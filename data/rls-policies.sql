-- ================================
-- 行级安全策略修复脚本
-- 用于修复 Supabase 安全警告
-- ================================

-- 修复函数安全路径问题
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_items ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can manage own credentials" ON user_credentials;
DROP POLICY IF EXISTS "Users can view public collections or own collections" ON bookmark_collections;
DROP POLICY IF EXISTS "Users can manage own collections" ON bookmark_collections;
DROP POLICY IF EXISTS "Users can view categories of accessible collections" ON bookmark_categories;
DROP POLICY IF EXISTS "Users can manage categories of own collections" ON bookmark_categories;
DROP POLICY IF EXISTS "Users can view subcategories of accessible collections" ON bookmark_subcategories;
DROP POLICY IF EXISTS "Users can manage subcategories of own collections" ON bookmark_subcategories;
DROP POLICY IF EXISTS "Users can view items of accessible collections" ON bookmark_items;
DROP POLICY IF EXISTS "Users can manage items of own collections" ON bookmark_items;

-- 用户表 RLS 策略
-- 用户只能查看和修改自己的记录
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = uuid);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = uuid);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = uuid);

-- 用户凭据表 RLS 策略
CREATE POLICY "Users can manage own credentials" ON user_credentials
    FOR ALL USING (auth.uid()::text = user_uuid);

-- 书签集合 RLS 策略
-- 用户可以查看公开集合或自己的集合
CREATE POLICY "Users can view public collections or own collections" ON bookmark_collections
    FOR SELECT USING (
        is_public = true OR 
        auth.uid()::text = user_uuid
    );

-- 用户只能管理自己的集合
CREATE POLICY "Users can manage own collections" ON bookmark_collections
    FOR ALL USING (auth.uid()::text = user_uuid);

-- 书签分类 RLS 策略
-- 基于集合的访问权限
CREATE POLICY "Users can view categories of accessible collections" ON bookmark_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookmark_collections bc 
            WHERE bc.uuid = collection_uuid 
            AND (bc.is_public = true OR bc.user_uuid = auth.uid()::text)
        )
    );

CREATE POLICY "Users can manage categories of own collections" ON bookmark_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bookmark_collections bc 
            WHERE bc.uuid = collection_uuid 
            AND bc.user_uuid = auth.uid()::text
        )
    );

-- 书签子分类 RLS 策略
CREATE POLICY "Users can view subcategories of accessible collections" ON bookmark_subcategories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookmark_categories bc
            JOIN bookmark_collections bcol ON bc.collection_uuid = bcol.uuid
            WHERE bc.uuid = category_uuid 
            AND (bcol.is_public = true OR bcol.user_uuid = auth.uid()::text)
        )
    );

CREATE POLICY "Users can manage subcategories of own collections" ON bookmark_subcategories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bookmark_categories bc
            JOIN bookmark_collections bcol ON bc.collection_uuid = bcol.uuid
            WHERE bc.uuid = category_uuid 
            AND bcol.user_uuid = auth.uid()::text
        )
    );

-- 书签项目 RLS 策略
CREATE POLICY "Users can view items of accessible collections" ON bookmark_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookmark_subcategories bs
            JOIN bookmark_categories bc ON bs.category_uuid = bc.uuid
            JOIN bookmark_collections bcol ON bc.collection_uuid = bcol.uuid
            WHERE bs.uuid = subcategory_uuid 
            AND (bcol.is_public = true OR bcol.user_uuid = auth.uid()::text)
        )
    );

CREATE POLICY "Users can manage items of own collections" ON bookmark_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bookmark_subcategories bs
            JOIN bookmark_categories bc ON bs.category_uuid = bc.uuid
            JOIN bookmark_collections bcol ON bc.collection_uuid = bcol.uuid
            WHERE bs.uuid = subcategory_uuid 
            AND bcol.user_uuid = auth.uid()::text
        )
    );
