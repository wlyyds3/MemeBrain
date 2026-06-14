# 数据库设计文档

## 1. 数据库架构概览

MemeBrain 使用双数据库架构：
- **PostgreSQL**：关系型数据存储
- **Qdrant**：向量数据库，用于语义搜索

---

## 2. PostgreSQL 数据库设计

### 2.1 ER 图概览

```
user_history
    ↓
culture_contents ← materials
    ↓
memes
```

### 2.2 表结构详解

#### 2.2.1 memes 表（热梗表）

```sql
CREATE TABLE memes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source VARCHAR(255),
    meaning TEXT,
    usage_scenarios TEXT[],
    tags TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memes_tags ON memes USING GIN(tags);
CREATE INDEX idx_memes_created_at ON memes(created_at);
```

**字段说明：**
- `id`: 主键 UUID
- `name`: 热梗名称
- `source`: 来源（如：B站、抖音、微博等）
- `meaning`: 热梗含义
- `usage_scenarios`: 适用场景数组
- `tags`: 标签数组
- `created_at`: 创建时间
- `updated_at`: 更新时间

---

#### 2.2.2 culture_contents 表（文化内容表）

```sql
CREATE TABLE culture_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('anime', 'film', 'history', 'game')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plot TEXT,
    emotion VARCHAR(50),
    keywords TEXT[],
    tags TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_culture_category ON culture_contents(category);
CREATE INDEX idx_culture_tags ON culture_contents USING GIN(tags);
CREATE INDEX idx_culture_emotion ON culture_contents(emotion);
```

**字段说明：**
- `id`: 主键 UUID
- `category`: 分类（anime/film/history/game）
- `title`: 标题
- `description`: 描述
- `plot`: 剧情
- `emotion`: 情绪（如：快乐、悲伤、愤怒、绝望等）
- `keywords`: 关键词数组
- `tags`: 标签数组
- `created_at`: 创建时间
- `updated_at`: 更新时间

---

#### 2.2.3 materials 表（素材表）

```sql
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('gif', 'screenshot', 'video')),
    title VARCHAR(255),
    source VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    timestamp VARCHAR(50),
    culture_content_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (culture_content_id) REFERENCES culture_contents(id) ON DELETE SET NULL
);

CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_culture ON materials(culture_content_id);
```

**字段说明：**
- `id`: 主键 UUID
- `type`: 素材类型（gif/screenshot/video）
- `title`: 作品名称
- `source`: 出处
- `url`: 资源URL
- `timestamp`: 时间点（如：0:30, 5:12-5:45）
- `culture_content_id`: 关联的文化内容ID
- `created_at`: 创建时间

---

#### 2.2.4 user_history 表（用户历史表）

```sql
CREATE TABLE user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    input_type VARCHAR(50) NOT NULL CHECK (input_type IN ('text', 'image', 'video')),
    input_content TEXT,
    input_file_url VARCHAR(500),
    result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_input_type ON user_history(input_type);
CREATE INDEX idx_user_history_created_at ON user_history(created_at);
```

**字段说明：**
- `id`: 主键 UUID
- `user_id`: 用户ID（可选，用于未来用户系统）
- `input_type`: 输入类型（text/image/video）
- `input_content`: 输入文本内容
- `input_file_url`: 输入文件URL（图片/视频）
- `result`: 联想结果JSON
- `created_at`: 创建时间

---

### 2.3 Alembic 迁移配置

**backend/alembic/versions/initial_schema.py**
```python
"""Initial schema

Revision ID: initial
Revises: 
Create Date: 2026-06-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    op.create_table(
        'memes',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=True),
        sa.Column('meaning', sa.Text(), nullable=True),
        sa.Column('usage_scenarios', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('idx_memes_tags', 'memes', ['tags'], postgresql_using='gin')
    op.create_index('idx_memes_created_at', 'memes', ['created_at'])
    
    op.create_table(
        'culture_contents',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('plot', sa.Text(), nullable=True),
        sa.Column('emotion', sa.String(length=50), nullable=True),
        sa.Column('keywords', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("category IN ('anime', 'film', 'history', 'game')")
    )
    
    op.create_index('idx_culture_category', 'culture_contents', ['category'])
    op.create_index('idx_culture_tags', 'culture_contents', ['tags'], postgresql_using='gin')
    op.create_index('idx_culture_emotion', 'culture_contents', ['emotion'])
    
    op.create_table(
        'materials',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('source', sa.String(length=255), nullable=True),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('timestamp', sa.String(length=50), nullable=True),
        sa.Column('culture_content_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['culture_content_id'], ['culture_contents.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("type IN ('gif', 'screenshot', 'video')")
    )
    
    op.create_index('idx_materials_type', 'materials', ['type'])
    op.create_index('idx_materials_culture', 'materials', ['culture_content_id'])
    
    op.create_table(
        'user_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('input_type', sa.String(length=50), nullable=False),
        sa.Column('input_content', sa.Text(), nullable=True),
        sa.Column('input_file_url', sa.String(length=500), nullable=True),
        sa.Column('result', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("input_type IN ('text', 'image', 'video')")
    )
    
    op.create_index('idx_user_history_user_id', 'user_history', ['user_id'])
    op.create_index('idx_user_history_input_type', 'user_history', ['input_type'])
    op.create_index('idx_user_history_created_at', 'user_history', ['created_at'])


def downgrade() -> None:
    op.drop_index('idx_user_history_created_at', table_name='user_history')
    op.drop_index('idx_user_history_input_type', table_name='user_history')
    op.drop_index('idx_user_history_user_id', table_name='user_history')
    op.drop_table('user_history')
    
    op.drop_index('idx_materials_culture', table_name='materials')
    op.drop_index('idx_materials_type', table_name='materials')
    op.drop_table('materials')
    
    op.drop_index('idx_culture_emotion', table_name='culture_contents')
    op.drop_index('idx_culture_tags', table_name='culture_contents')
    op.drop_index('idx_culture_category', table_name='culture_contents')
    op.drop_table('culture_contents')
    
    op.drop_index('idx_memes_created_at', table_name='memes')
    op.drop_index('idx_memes_tags', table_name='memes')
    op.drop_table('memes')
```

---

## 3. Qdrant 向量数据库设计

### 3.1 集合配置

#### 3.1.1 memes 集合

```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

client = QdrantClient(url="http://localhost:6333")

client.create_collection(
    collection_name="memes",
    vectors_config=VectorParams(
        size=768,
        distance=Distance.COSINE
    )
)
```

**Payload 结构：**
```json
{
  "id": "uuid",
  "name": "热梗名称",
  "source": "来源",
  "meaning": "含义",
  "usage_scenarios": ["场景1", "场景2"],
  "tags": ["标签1", "标签2"]
}
```

---

#### 3.1.2 culture_contents 集合

```python
client.create_collection(
    collection_name="culture_contents",
    vectors_config=VectorParams(
        size=768,
        distance=Distance.COSINE
    )
)
```

**Payload 结构：**
```json
{
  "id": "uuid",
  "category": "anime",
  "title": "标题",
  "description": "描述",
  "plot": "剧情",
  "emotion": "情绪",
  "keywords": ["关键词1", "关键词2"],
  "tags": ["标签1", "标签2"]
}
```

---

### 3.2 向量嵌入策略

使用 `all-mpnet-base-v2` 模型进行嵌入，向量维度 768。

#### 嵌入文本拼接策略：

**对于 memes：**
```
name: {name}
source: {source}
meaning: {meaning}
usage_scenarios: {usage_scenarios.join(', ')}
tags: {tags.join(', ')}
```

**对于 culture_contents：**
```
title: {title}
category: {category}
description: {description}
plot: {plot}
emotion: {emotion}
keywords: {keywords.join(', ')}
tags: {tags.join(', ')}
```

---

## 4. 初始化数据示例

### 4.1 热梗示例数据

```sql
INSERT INTO memes (name, source, meaning, usage_scenarios, tags) VALUES
('破防了', '网络', '指心理防线被突破，情绪受到冲击', 
 ARRAY['遇到挫折', '情感冲击', '负面消息'], 
 ARRAY['情绪', '网络热梗', '通用']),
('天塌了', '网络', '形容遇到重大打击或灾难', 
 ARRAY['重大打击', '绝望', '崩溃'], 
 ARRAY['情绪', '夸张', '通用']);
```

### 4.2 文化内容示例数据

```sql
INSERT INTO culture_contents (category, title, description, plot, emotion, keywords, tags) VALUES
('anime', '猫和老鼠', '经典动画，汤姆和杰瑞的搞笑日常', 
 '汤姆总是想抓住杰瑞，但每次都失败，过程充满笑料', 
 '搞笑', 
 ARRAY['追逐', '失败', '搞笑', '猫', '老鼠'], 
 ARRAY['动画', '经典', '搞笑']),
('film', '复仇者联盟', '灭霸打了响指，一半的生命消失', 
 '灭霸收集无限宝石，一个响指让宇宙一半生命灰飞烟灭', 
 '绝望', 
 ARRAY['灭霸', '响指', '消失', '绝望'], 
 ARRAY['漫威', '电影', '名场面']);
```

---

## 5. Docker Compose 配置

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: memebrain-postgres
    environment:
      POSTGRES_USER: memebrain
      POSTGRES_PASSWORD: memebrain123
      POSTGRES_DB: memebrain
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U memebrain"]
      interval: 10s
      timeout: 5s
      retries: 5

  qdrant:
    image: qdrant/qdrant:latest
    container_name: memebrain-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  postgres_data:
  qdrant_data:
```
