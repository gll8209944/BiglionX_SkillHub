-- ============================================
-- 向量搜索数据库迁移脚本
-- 用于将embeddings从JSON格式迁移到pgvector格式
-- ============================================

-- 1. 安装pgvector扩展（如果尚未安装）
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 为skills表添加embedding_vector列（使用pgvector类型）
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

-- 3. 创建索引以加速向量搜索
-- HNSW索引适合高维向量相似度搜索
CREATE INDEX IF NOT EXISTS idx_skills_embedding_hnsw 
ON skills 
USING hnsw (embedding_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. 创建GIN索引用于传统文本搜索优化
CREATE INDEX IF NOT EXISTS idx_skills_name_gin 
ON skills 
USING gin (to_tsvector('simple', name));

CREATE INDEX IF NOT EXISTS idx_skills_description_gin 
ON skills 
USING gin (to_tsvector('simple', description));

-- 5. 创建复合索引用于常见查询模式
CREATE INDEX IF NOT EXISTS idx_skills_category_status 
ON skills (category, status);

CREATE INDEX IF NOT EXISTS idx_skills_quality_updated 
ON skills ("qualityScore" DESC, "updatedAt" DESC);

-- 6. 为embedding字段添加注释
COMMENT ON COLUMN skills.embedding_vector IS 'OpenAI/智谱AI embeddings存储为pgvector格式，维度1536';
COMMENT ON INDEX idx_skills_embedding_hnsw IS 'HNSW索引用于快速向量相似度搜索';

-- 7. 创建函数：从JSON embedding迁移到vector格式
CREATE OR REPLACE FUNCTION migrate_embeddings_to_vector()
RETURNS void AS $$
DECLARE
    skill_record RECORD;
    embedding_array float8[];
BEGIN
    RAISE NOTICE '开始迁移embeddings...';
    
    FOR skill_record IN 
        SELECT id, embedding 
        FROM skills 
        WHERE embedding IS NOT NULL 
          AND embedding_vector IS NULL
    LOOP
        -- 将JSON数组转换为PostgreSQL数组
        embedding_array := ARRAY(
            SELECT json_array_elements_text(skill_record.embedding::json)::float8
        );
        
        -- 更新vector列
        UPDATE skills 
        SET embedding_vector = embedding_array::vector
        WHERE id = skill_record.id;
    END LOOP;
    
    RAISE NOTICE 'Embeddings迁移完成！';
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器：自动同步JSON embedding到vector格式
CREATE OR REPLACE FUNCTION sync_embedding_to_vector()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.embedding IS NOT NULL THEN
        NEW.embedding_vector := (
            SELECT ARRAY(
                SELECT json_array_elements_text(NEW.embedding::json)::float8
            )::vector
        );
    ELSE
        NEW.embedding_vector := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器
DROP TRIGGER IF EXISTS trg_sync_embedding_vector ON skills;
CREATE TRIGGER trg_sync_embedding_vector
    BEFORE INSERT OR UPDATE OF embedding ON skills
    FOR EACH ROW
    EXECUTE FUNCTION sync_embedding_to_vector();

-- 10. 执行迁移（可选，取消注释以执行）
-- SELECT migrate_embeddings_to_vector();

-- 11. 验证迁移结果
SELECT 
    COUNT(*) as total_skills,
    COUNT(embedding) as json_embeddings,
    COUNT(embedding_vector) as vector_embeddings,
    COUNT(*) FILTER (WHERE embedding IS NOT NULL AND embedding_vector IS NULL) as needs_migration
FROM skills;
