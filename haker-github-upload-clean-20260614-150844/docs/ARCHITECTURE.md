# MemeBrain 项目架构设计文档

## 1. 项目概述

### 1.1 项目定位
MemeBrain 是一个 AI 文化联想引擎，帮助内容创作者通过输入文本、图片或视频，自动联想到网络热梗、动漫名场面、历史典故、影视桥段、游戏剧情和表情包文化，并提供素材推荐和文案生成。

### 1.2 目标用户
- 自媒体创作者
- 视频剪辑师
- B站UP主
- 抖音创作者
- 小红书运营

---

## 2. 完整目录结构

```
haker/
├── backend/                          # FastAPI 后端
│   ├── app/
│   │   ├── api/                      # API 路由
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── text.py           # 文本联想接口
│   │   │   │   ├── image.py          # 图片联想接口
│   │   │   │   ├── video.py          # 视频联想接口
│   │   │   │   ├── material.py       # 素材推荐接口
│   │   │   │   ├── copywriting.py    # 文案生成接口
│   │   │   │   ├── meme.py           # 热梗库接口
│   │   │   │   └── culture.py        # 文化联想库接口
│   │   ├── core/                     # 核心配置
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── models/                   # 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   ├── schemas.py
│   │   │   └── enums.py
│   │   ├── services/                 # 业务逻辑层
│   │   │   ├── __init__.py
│   │   │   ├── text_association.py
│   │   │   ├── image_analysis.py
│   │   │   ├── video_analysis.py
│   │   │   ├── material_recommendation.py
│   │   │   ├── copywriting_generation.py
│   │   │   ├── vector_search.py
│   │   │   └── ai_integration.py
│   │   ├── db/                       # 数据库相关
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   ├── base.py
│   │   │   └── crud/
│   │   │       ├── __init__.py
│   │   │       ├── meme.py
│   │   │       └── culture.py
│   │   ├── vector/                   # 向量数据库相关
│   │   │   ├── __init__.py
│   │   │   ├── qdrant_client.py
│   │   │   ├── embedding.py
│   │   │   └── index.py
│   │   └── utils/                    # 工具函数
│   │       ├── __init__.py
│   │       ├── file_handler.py
│   │       ├── logger.py
│   │       └── validators.py
│   ├── alembic/                      # 数据库迁移
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/                        # 测试
│   │   ├── unit/
│   │   ├── integration/
│   │   └── conftest.py
│   ├── .env.example
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── main.py
│   └── Dockerfile
│
├── frontend/                         # Next.js 前端
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── text/
│   │   │   │   └── page.tsx
│   │   │   ├── image/
│   │   │   │   └── page.tsx
│   │   │   ├── video/
│   │   │   │   └── page.tsx
│   │   │   ├── meme-library/
│   │   │   │   └── page.tsx
│   │   │   └── culture-library/
│   │   │       └── page.tsx
│   │   ├── components/               # 组件
│   │   │   ├── ui/                   # Shadcn UI 组件
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── features/
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── ImageUpload.tsx
│   │   │   │   ├── VideoUpload.tsx
│   │   │   │   ├── AssociationResult.tsx
│   │   │   │   ├── MaterialCard.tsx
│   │   │   │   └── CopywritingTabs.tsx
│   │   │   └── shared/
│   │   ├── lib/                      # 工具库
│   │   │   ├── api.ts
│   │   │   ├── utils.ts
│   │   │   └── hooks.ts
│   │   ├── types/                    # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── store/                    # 状态管理
│   │   │   └── index.ts
│   │   └── styles/                   # 样式
│   │       └── globals.css
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── Dockerfile
│
├── docs/                             # 文档
│   ├── ARCHITECTURE.md               # 架构设计文档
│   ├── DATABASE_DESIGN.md            # 数据库设计
│   ├── API_DESIGN.md                 # API 设计
│   ├── FRONTEND_DESIGN.md            # 前端设计
│   ├── USER_FLOW.md                  # 用户流程图
│   ├── ROADMAP.md                    # 开发路线图
│   ├── MVP_PLAN.md                   # MVP 规划
│   └── EXTENSION_PLAN.md             # 后续扩展方案
│
├── docker-compose.yml
└── README.md
```

---

## 3. 数据库设计

### 3.1 PostgreSQL 数据库表结构

#### 3.1.1 热梗表 (memes)
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| name | VARCHAR(255) | 热梗名称 | NOT NULL |
| source | VARCHAR(255) | 来源 | |
| meaning | TEXT | 含义 | |
| usage_scenarios | TEXT[] | 适用场景 | |
| tags | TEXT[] | 标签 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT NOW() |

#### 3.1.2 文化内容表 (culture_contents)
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| category | VARCHAR(50) | 分类(anime/film/history/game) | NOT NULL |
| title | VARCHAR(255) | 标题 | NOT NULL |
| description | TEXT | 描述 | |
| plot | TEXT | 剧情 | |
| emotion | VARCHAR(50) | 情绪 | |
| keywords | TEXT[] | 关键词 | |
| tags | TEXT[] | 标签 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT NOW() |

#### 3.1.3 素材表 (materials)
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| type | VARCHAR(50) | 类型(gif/screenshot/video) | NOT NULL |
| title | VARCHAR(255) | 作品名称 | |
| source | VARCHAR(255) | 出处 | |
| url | VARCHAR(500) | 资源URL | |
| timestamp | VARCHAR(50) | 时间点 | |
| culture_content_id | UUID | 关联文化内容ID | FOREIGN KEY |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |

#### 3.1.4 用户历史表 (user_history)
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | UUID | 主键 | PRIMARY KEY |
| user_id | UUID | 用户ID | |
| input_type | VARCHAR(50) | 输入类型(text/image/video) | NOT NULL |
| input_content | TEXT | 输入内容 | |
| result | JSONB | 联想结果 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT NOW() |

### 3.2 Qdrant 向量数据库集合

#### 3.2.1 memes 集合
- 向量维度：768
- 字段：id, vector, payload

#### 3.2.2 culture_contents 集合
- 向量维度：768
- 字段：id, vector, payload

---

## 4. API 设计

### 4.1 API 基础信息
- Base URL: `/api/v1`
- 响应格式: JSON

### 4.2 API 端点

#### 4.2.1 文本联想
- `POST /api/v1/text/associate` - 文本联想
- 请求体：
```json
{
  "text": "老板周末让我加班"
}
```
- 响应：
```json
{
  "success": true,
  "data": {
    "analysis": {
      "emotion": "绝望",
      "relationship": "压迫",
      "scene": "逃跑失败"
    },
    "associations": [
      {
        "id": "uuid",
        "type": "anime",
        "name": "猫和老鼠",
        "explanation": "..."
      }
    ]
  }
}
```

#### 4.2.2 图片联想
- `POST /api/v1/image/associate` - 图片联想
- 请求：multipart/form-data
- 响应：同文本联想

#### 4.2.3 视频联想
- `POST /api/v1/video/associate` - 视频联想
- 请求：multipart/form-data
- 响应：同文本联想

#### 4.2.4 素材推荐
- `POST /api/v1/material/recommend` - 素材推荐
- 请求体：
```json
{
  "association_ids": ["uuid1", "uuid2"]
}
```
- 响应：
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "gif",
      "title": "作品名称",
      "source": "出处",
      "url": "...",
      "timestamp": "0:30",
      "match_score": 0.95
    }
  ]
}
```

#### 4.2.5 文案生成
- `POST /api/v1/copywriting/generate` - 文案生成
- 请求体：
```json
{
  "input_text": "老板周末让我加班",
  "associations": [...]
}
```
- 响应：
```json
{
  "success": true,
  "data": {
    "douyin": "抖音版文案",
    "bilibili": "B站版文案",
    "xiaohongshu": "小红书版文案",
    "gongzhonghao": "公众号版文案"
  }
}
```

#### 4.2.6 热梗库
- `GET /api/v1/memes` - 获取热梗列表
- `GET /api/v1/memes/:id` - 获取单个热梗
- `POST /api/v1/memes/search` - 搜索热梗

#### 4.2.7 文化联想库
- `GET /api/v1/culture` - 获取文化内容列表
- `GET /api/v1/culture/:id` - 获取单个文化内容
- `POST /api/v1/culture/search` - 搜索文化内容

---

## 5. 前端页面设计

### 5.1 页面结构
1. **首页** - 功能入口，快速开始
2. **文本联想页** - 文本输入和结果展示
3. **图片联想页** - 图片上传和分析
4. **视频联想页** - 视频上传和分析
5. **热梗库页** - 热梗搜索和浏览
6. **文化联想库页** - 文化内容浏览

### 5.2 核心组件
- TextInput - 文本输入组件
- ImageUpload - 图片上传组件
- VideoUpload - 视频上传组件
- AssociationResult - 联想结果展示组件
- MaterialCard - 素材卡片组件
- CopywritingTabs - 文案标签页组件

---

## 6. 用户流程图

### 6.1 文本联想流程
```
用户输入文本
    ↓
前端发送到后端
    ↓
后端调用 AI 分析文本
    ↓
向量检索匹配相关内容
    ↓
返回联想结果
    ↓
用户选择素材
    ↓
生成多平台文案
    ↓
保存或下载结果
```

### 6.2 图片联想流程
```
用户上传图片
    ↓
前端发送到后端
    ↓
Qwen-VL 识别图片内容
    ↓
AI 分析图片信息
    ↓
向量检索匹配
    ↓
返回联想结果
    ↓
推荐素材和文案
```

### 6.3 视频联想流程
```
用户上传视频
    ↓
前端发送到后端
    ↓
Qwen-VL Video 分析视频
    ↓
提取关键帧和剧情
    ↓
向量检索匹配
    ↓
返回联想结果
    ↓
推荐素材和文案
```

---

## 7. 开发路线图

### 第一阶段：MVP 版本 (2周)
- [ ] 项目基础架构搭建
- [ ] PostgreSQL 和 Qdrant 数据库搭建
- [ ] 文本联想功能
- [ ] 基础热梗库
- [ ] 前端基础页面

### 第二阶段：图片和视频功能 (2周)
- [ ] 图片识别和联想
- [ ] 视频分析和联想
- [ ] 素材推荐功能
- [ ] 文案生成功能

### 第三阶段：完整功能 (2周)
- [ ] 完整热梗库和文化联想库
- [ ] 搜索和筛选功能
- [ ] 用户历史记录
- [ ] 优化和测试

---

## 8. MVP 版本规划

### MVP 核心功能
1. 文本联想
2. 基础热梗库（100+热梗）
3. 基础文化联想库（50+内容）
4. 简单素材推荐
5. 基础文案生成（2-3个平台）

### MVP 技术实现
- OpenAI API 用于文本分析
- 基础向量检索
- 简化前端界面
- 核心 API 端点

### MVP 交付标准
- 可正常使用文本联想功能
- 有基础的数据库内容
- 界面美观可用
- 基本的错误处理

---

## 9. 后续扩展方案

### 9.1 功能扩展
- 用户账户系统
- 素材上传和分享
- 热梗和文化内容贡献
- 协作功能
- 导出功能（多种格式）

### 9.2 技术扩展
- 更多 AI 模型支持
- 实时视频流分析
- 自定义训练模型
- 移动端 App
- Chrome 浏览器插件

### 9.3 内容扩展
- 更多分类（文学、音乐等）
- 多语言支持
- 实时热梗更新
- 用户自定义标签

---

## 10. 技术栈总结

| 层次 | 技术选型 |
|------|----------|
| 前端 | Next.js 14, TypeScript, TailwindCSS, Shadcn UI |
| 后端 | FastAPI, Python 3.11 |
| 数据库 | PostgreSQL 16 |
| 向量数据库 | Qdrant |
| AI 模型 | OpenAI API, Gemini API, Qwen3, Qwen-VL, Qwen-VL Video |
| 向量模型 | Sentence Transformers |
| 部署 | Docker, Docker Compose |
