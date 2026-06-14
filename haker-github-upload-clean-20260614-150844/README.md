# 🧠 MemeBrain - AI 文化联想引擎

MemeBrain 是一个 AI 驱动的文化联想引擎，帮助内容创作者通过输入文本、图片或视频，自动联想网络热梗、动漫名场面、历史典故、影视桥段、游戏剧情，并提供素材推荐和多平台文案生成。

## ✨ 核心功能

- **📝 文本联想** - 输入文本，分析情绪、关系、场景，自动联想相关内容
- **🖼️ 图片联想** - 上传图片，AI 识别并联想相关名场面
- **🎬 视频联想** - 上传视频，分析剧情和情绪，智能匹配
- **🎨 素材推荐** - 推荐 GIF、截图、视频片段
- **✍️ 文案生成** - 自动生成抖音、B站、小红书、公众号文案
- **🔥 热梗库** - 海量热梗，随时搜索查阅
- **🎭 文化联想库** - 动漫、影视、历史、游戏内容库

## 🎯 目标用户

- 自媒体创作者
- 视频剪辑师
- B站UP主
- 抖音创作者
- 小红书运营

## 🛠️ 技术栈

### 前端
- Next.js 14
- TypeScript
- TailwindCSS
- Shadcn UI

### 后端
- FastAPI
- Python 3.11+

### 数据库
- PostgreSQL 16
- Qdrant (向量数据库)

### AI 模型
- OpenAI API
- Gemini API
- Qwen / Qwen-VL / Qwen-VL Video
- Sentence-Transformers

## 📁 项目结构

```
haker/
├── backend/          # FastAPI 后端
├── frontend/         # Next.js 前端
├── docs/            # 文档
│   ├── ARCHITECTURE.md    # 架构设计
│   ├── DATABASE_DESIGN.md # 数据库设计
│   ├── API_DESIGN.md      # API 设计
│   ├── FRONTEND_DESIGN.md # 前端设计
│   ├── USER_FLOW.md       # 用户流程
│   ├── ROADMAP.md         # 开发路线图
│   ├── MVP_PLAN.md        # MVP 规划
│   └── EXTENSION_PLAN.md  # 扩展方案
├── docker-compose.yml
└── README.md
```

## 📚 文档

- [架构设计文档](./docs/ARCHITECTURE.md)
- [数据库设计文档](./docs/DATABASE_DESIGN.md)
- [API 设计文档](./docs/API_DESIGN.md)
- [前端设计文档](./docs/FRONTEND_DESIGN.md)
- [用户流程图](./docs/USER_FLOW.md)
- [开发路线图](./docs/ROADMAP.md)
- [MVP 规划](./docs/MVP_PLAN.md)
- [扩展方案](./docs/EXTENSION_PLAN.md)

## 🚀 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### 启动服务

```bash
# 启动数据库
docker-compose up -d

# 后端开发
cd backend
pip install -r requirements.txt
python main.py

# 前端开发
cd frontend
npm install
npm run dev
```

## 🗓️ 开发计划

- **MVP 版本** (2周): 核心文本联想功能
- **第二阶段** (2周): 图片和视频联想
- **第三阶段** (2周): 完整功能和优化

详细计划请查看 [开发路线图](./docs/ROADMAP.md)

## 📄 许可证

MIT License
