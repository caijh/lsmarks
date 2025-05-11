-- 雷水书签系统数据库统一脚本
-- 此脚本创建所有必要的数据表、索引、约束和函数

-- 确保 pgcrypto 扩展已启用
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    nickname VARCHAR(255),
    avatar_url VARCHAR(255),
    locale VARCHAR(50) DEFAULT 'zh',
    signin_type VARCHAR(50),
    signin_ip VARCHAR(255),
    signin_provider VARCHAR(50),
    signin_openid VARCHAR(255),
    username VARCHAR(30) UNIQUE,
    display_name VARCHAR(50),
    bio TEXT,
    color_theme VARCHAR(20) DEFAULT 'default',
    user_level VARCHAR(20) DEFAULT 'free',
    UNIQUE (email, signin_provider)
);

-- 用户凭证表
CREATE TABLE IF NOT EXISTS user_credentials (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL, -- 'password', 'oauth'
    identifier VARCHAR(255) NOT NULL, -- email for password, provider+id for oauth
    secret TEXT, -- password hash for password auth, token for oauth
    provider VARCHAR(50), -- 'github', 'google', etc. for oauth
    provider_id VARCHAR(255), -- provider's user id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_uuid, credential_type, identifier)
);

-- 用户等级表
CREATE TABLE IF NOT EXISTS user_levels (
    id SERIAL PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    level_code VARCHAR(20) NOT NULL UNIQUE,
    max_collections INTEGER NOT NULL,
    max_bookmarks_per_collection INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加外键约束
DO $$
BEGIN
    -- 检查约束是否已存在
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_user_level_fkey' AND conrelid = 'users'::regclass
    ) THEN
        -- 如果不存在，添加约束
        ALTER TABLE users
        ADD CONSTRAINT users_user_level_fkey
        FOREIGN KEY (user_level)
        REFERENCES user_levels(level_code);
    END IF;
END
$$;

-- 书签集合表
CREATE TABLE IF NOT EXISTS bookmark_collections (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    user_uuid VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    slug VARCHAR(255),
    cover_url VARCHAR(255),
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    UNIQUE (user_uuid, slug)
);

-- 大分类表
CREATE TABLE IF NOT EXISTS bookmark_categories (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    collection_uuid VARCHAR(255) NOT NULL,
    user_uuid VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (collection_uuid) REFERENCES bookmark_collections(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE
);

-- 子分类表
CREATE TABLE IF NOT EXISTS bookmark_subcategories (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_uuid VARCHAR(255) NOT NULL,
    user_uuid VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (category_uuid) REFERENCES bookmark_categories(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE
);

-- URL统计表
CREATE TABLE IF NOT EXISTS bookmark_url_stats (
    id SERIAL PRIMARY KEY,
    normalized_url VARCHAR(2000) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    icon_url TEXT,
    add_count INTEGER NOT NULL DEFAULT 1,
    first_added_at TIMESTAMPTZ DEFAULT NOW(),
    last_added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 书签表
CREATE TABLE IF NOT EXISTS bookmark_items (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    normalized_url VARCHAR(2000) NOT NULL,
    description TEXT,
    icon_url TEXT,
    subcategory_uuid VARCHAR(255) NOT NULL,
    user_uuid VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (subcategory_uuid) REFERENCES bookmark_subcategories(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (normalized_url) REFERENCES bookmark_url_stats(normalized_url)
);

-- 用户主题偏好表
CREATE TABLE IF NOT EXISTS bookmark_user_preferences (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(255) UNIQUE NOT NULL,
    color_theme VARCHAR(50) DEFAULT 'default',
    dark_mode BOOLEAN DEFAULT false,
    custom_colors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_uuid ON user_credentials(user_uuid);
CREATE INDEX IF NOT EXISTS idx_user_credentials_identifier ON user_credentials(identifier);
CREATE INDEX IF NOT EXISTS idx_bookmark_collections_user_uuid ON bookmark_collections(user_uuid);
CREATE INDEX IF NOT EXISTS idx_bookmark_collections_is_public ON bookmark_collections(is_public);
CREATE INDEX IF NOT EXISTS idx_bookmark_collections_slug ON bookmark_collections(slug);
CREATE INDEX IF NOT EXISTS idx_bookmark_categories_collection_uuid ON bookmark_categories(collection_uuid);
CREATE INDEX IF NOT EXISTS idx_bookmark_subcategories_category_uuid ON bookmark_subcategories(category_uuid);
CREATE INDEX IF NOT EXISTS idx_bookmark_items_subcategory_uuid ON bookmark_items(subcategory_uuid);
CREATE INDEX IF NOT EXISTS idx_bookmark_items_user_uuid ON bookmark_items(user_uuid);
CREATE INDEX IF NOT EXISTS idx_bookmark_items_normalized_url ON bookmark_items(normalized_url);
CREATE INDEX IF NOT EXISTS idx_bookmark_url_stats_add_count ON bookmark_url_stats(add_count);

-- 创建函数：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：标准化URL
CREATE OR REPLACE FUNCTION normalize_url(url TEXT)
RETURNS VARCHAR AS $$
BEGIN
    -- 基本标准化：移除协议、www前缀、查询参数、锚点和尾部斜杠
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(url, '^https?://(www\.)?', '', 'i'),
                    '\?.*$', ''
                ),
                '#.*$', ''
            ),
            '/$', ''
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 创建函数：处理新书签添加，更新URL统计
CREATE OR REPLACE FUNCTION process_new_bookmark()
RETURNS TRIGGER AS $$
DECLARE
    norm_url VARCHAR;
    current_count INTEGER;
BEGIN
    -- 标准化URL
    norm_url := normalize_url(NEW.url);
    NEW.normalized_url := norm_url;

    -- 检查URL是否已存在于统计表中
    SELECT add_count INTO current_count FROM bookmark_url_stats WHERE normalized_url = norm_url;

    IF current_count IS NULL THEN
        -- 如果URL不存在，创建新记录
        INSERT INTO bookmark_url_stats (normalized_url, original_url, title, description, icon_url)
        VALUES (norm_url, NEW.url, NEW.title, NEW.description, NEW.icon_url)
        RETURNING add_count INTO current_count;
    ELSE
        -- 如果URL已存在，更新统计
        UPDATE bookmark_url_stats
        SET add_count = add_count + 1, last_added_at = NOW()
        WHERE normalized_url = norm_url
        RETURNING add_count INTO current_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：检查用户是否可以创建新的书签集合
CREATE OR REPLACE FUNCTION check_user_collection_limit(user_uuid_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    user_level_code VARCHAR(20);
BEGIN
    -- 获取用户等级
    SELECT user_level INTO user_level_code FROM users WHERE uuid = user_uuid_param;

    -- 如果用户不存在或没有等级，使用默认等级 'free'
    IF user_level_code IS NULL THEN
        user_level_code := 'free';
    END IF;

    -- 获取用户当前的集合数量
    SELECT COUNT(*) INTO current_count
    FROM bookmark_collections
    WHERE user_uuid = user_uuid_param;

    -- 获取用户等级允许的最大集合数量
    SELECT max_collections INTO max_allowed
    FROM user_levels
    WHERE level_code = user_level_code;

    -- 返回是否可以创建新集合
    RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：检查用户是否可以在特定集合中创建新的书签
CREATE OR REPLACE FUNCTION check_user_bookmark_limit(subcategory_uuid_param TEXT, user_uuid_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    collection_uuid_var TEXT;
    current_count INTEGER;
    max_allowed INTEGER;
    user_level_code VARCHAR(20);
BEGIN
    -- 获取用户等级
    SELECT user_level INTO user_level_code FROM users WHERE uuid = user_uuid_param;

    -- 如果用户不存在或没有等级，使用默认等级 'free'
    IF user_level_code IS NULL THEN
        user_level_code := 'free';
    END IF;

    -- 获取子分类所属的集合
    SELECT c.collection_uuid INTO collection_uuid_var
    FROM bookmark_subcategories s
    JOIN bookmark_categories c ON s.category_uuid = c.uuid
    WHERE s.uuid = subcategory_uuid_param;

    -- 获取集合中当前的书签数量
    SELECT COUNT(*) INTO current_count
    FROM bookmark_items bi
    JOIN bookmark_subcategories bs ON bi.subcategory_uuid = bs.uuid
    JOIN bookmark_categories bc ON bs.category_uuid = bc.uuid
    WHERE bc.collection_uuid = collection_uuid_var;

    -- 获取用户等级允许的最大书签数量
    SELECT max_bookmarks_per_collection INTO max_allowed
    FROM user_levels
    WHERE level_code = user_level_code;

    -- 返回是否可以创建新书签
    RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：获取用户书签使用情况
CREATE OR REPLACE FUNCTION get_user_bookmark_usage(user_id VARCHAR)
RETURNS TABLE(collection_uuid VARCHAR, bookmark_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH user_subcategories AS (
        -- 获取用户所有集合的子分类
        SELECT
            bc.uuid AS collection_uuid,
            bs.uuid AS subcategory_uuid
        FROM
            bookmark_collections bc
        JOIN
            bookmark_categories bcat ON bc.uuid = bcat.collection_uuid
        JOIN
            bookmark_subcategories bs ON bcat.uuid = bs.category_uuid
        WHERE
            bc.user_uuid = user_id
    )
    -- 计算每个集合的书签数量
    SELECT
        us.collection_uuid,
        COUNT(bi.id)::BIGINT AS bookmark_count
    FROM
        user_subcategories us
    LEFT JOIN
        bookmark_items bi ON us.subcategory_uuid = bi.subcategory_uuid AND bi.user_uuid = user_id
    GROUP BY
        us.collection_uuid;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：在添加书签前处理URL
DROP TRIGGER IF EXISTS process_bookmark_before_insert ON bookmark_items;

CREATE TRIGGER process_bookmark_before_insert
BEFORE INSERT ON bookmark_items
FOR EACH ROW EXECUTE FUNCTION process_new_bookmark();

-- 创建触发器：检查用户集合限制
CREATE OR REPLACE FUNCTION check_collection_limit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_user_collection_limit(NEW.user_uuid) THEN
        RAISE EXCEPTION '您已达到书签集合数量上限，请升级账户以创建更多集合';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 先删除触发器（如果存在），然后重新创建
DROP TRIGGER IF EXISTS enforce_collection_limit ON bookmark_collections;

CREATE TRIGGER enforce_collection_limit
BEFORE INSERT ON bookmark_collections
FOR EACH ROW EXECUTE FUNCTION check_collection_limit_trigger();

-- 创建触发器：检查用户书签限制
CREATE OR REPLACE FUNCTION check_bookmark_limit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_user_bookmark_limit(NEW.subcategory_uuid, NEW.user_uuid) THEN
        RAISE EXCEPTION '您已达到此集合的书签数量上限，请升级账户以添加更多书签';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 先删除触发器（如果存在），然后重新创建
DROP TRIGGER IF EXISTS enforce_bookmark_limit ON bookmark_items;

CREATE TRIGGER enforce_bookmark_limit
BEFORE INSERT ON bookmark_items
FOR EACH ROW EXECUTE FUNCTION check_bookmark_limit_trigger();

-- 创建触发器：自动更新时间戳
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON user_credentials;
CREATE TRIGGER update_user_credentials_updated_at
BEFORE UPDATE ON user_credentials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmark_collections_updated_at ON bookmark_collections;
CREATE TRIGGER update_bookmark_collections_updated_at
BEFORE UPDATE ON bookmark_collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmark_categories_updated_at ON bookmark_categories;
CREATE TRIGGER update_bookmark_categories_updated_at
BEFORE UPDATE ON bookmark_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmark_subcategories_updated_at ON bookmark_subcategories;
CREATE TRIGGER update_bookmark_subcategories_updated_at
BEFORE UPDATE ON bookmark_subcategories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookmark_items_updated_at ON bookmark_items;
CREATE TRIGGER update_bookmark_items_updated_at
BEFORE UPDATE ON bookmark_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始化用户等级
INSERT INTO user_levels (level_name, level_code, max_collections, max_bookmarks_per_collection, description)
VALUES
    ('初六', '1', 1, 2000, '初六级用户，最多创建1个书签集合，每个集合最多2000个书签'),
    ('九二', '2', 1, 3000, '九二级用户，最多创建1个书签集合，每个集合最多3000个书签'),
    ('六三', '3', 2, 5000, '六三级用户，最多创建2个书签集合，每个集合最多5000个书签'),
    ('九四', '4', 3, 6000, '九四级用户，最多创建3个书签集合，每个集合最多6000个书签'),
    ('六五', '5', 4, 7000, '六五级用户，最多创建4个书签集合，每个集合最多7000个书签'),
    ('上六', '6', 5, 8000, '上六级用户，最多创建5个书签集合，每个集合最多8000个书签'),
    ('用九', '7', 999, 999999, '用九级用户，无限制书签集合和书签数量'),
    ('免费', 'free', 1, 1000, '免费用户，最多创建1个书签集合，每个集合最多1000个书签')
ON CONFLICT (level_code) DO UPDATE
SET
    level_name = EXCLUDED.level_name,
    max_collections = EXCLUDED.max_collections,
    max_bookmarks_per_collection = EXCLUDED.max_bookmarks_per_collection,
    description = EXCLUDED.description,
    updated_at = NOW();
