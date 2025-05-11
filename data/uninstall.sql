-- 雷水书签系统卸载脚本
-- 此脚本删除所有表、视图、函数和触发器

-- 删除触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_credentials_updated_at ON user_credentials;
DROP TRIGGER IF EXISTS update_bookmark_collections_updated_at ON bookmark_collections;
DROP TRIGGER IF EXISTS update_bookmark_categories_updated_at ON bookmark_categories;
DROP TRIGGER IF EXISTS update_bookmark_subcategories_updated_at ON bookmark_subcategories;
DROP TRIGGER IF EXISTS update_bookmark_items_updated_at ON bookmark_items;
DROP TRIGGER IF EXISTS process_bookmark_before_insert ON bookmark_items;

-- 删除视图（管理员功能已移除）

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS normalize_url(TEXT);
DROP FUNCTION IF EXISTS process_new_bookmark();
DROP FUNCTION IF EXISTS check_user_collection_limit(TEXT);
DROP FUNCTION IF EXISTS check_user_bookmark_limit(TEXT, TEXT);
DROP FUNCTION IF EXISTS check_collection_limit_trigger();
DROP FUNCTION IF EXISTS check_bookmark_limit_trigger();
DROP FUNCTION IF EXISTS get_user_bookmark_usage(VARCHAR);


-- 删除表（按照依赖关系顺序）
DROP TABLE IF EXISTS bookmark_items;
DROP TABLE IF EXISTS bookmark_subcategories;
DROP TABLE IF EXISTS bookmark_categories;
DROP TABLE IF EXISTS bookmark_collections;
DROP TABLE IF EXISTS bookmark_url_stats;
DROP TABLE IF EXISTS bookmark_user_preferences;
DROP TABLE IF EXISTS user_credentials;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_levels;
