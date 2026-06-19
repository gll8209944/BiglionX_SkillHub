-- 验证并安装pgvector扩展
-- 在Neon数据库中执行此脚本

-- 1. 检查是否已安装pgvector
SELECT extname FROM pg_extension WHERE extname = 'vector';

-- 2. 如果未安装，创建扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 3. 验证扩展安装成功
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- 4. 测试向量类型
SELECT '[1,2,3]'::vector(3) as test_vector;
