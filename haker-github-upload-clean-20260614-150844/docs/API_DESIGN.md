# API 设计文档

## 1. API 概述

### 1.1 基础信息
- Base URL: `/api/v1`
- 响应格式: JSON
- 字符编码: UTF-8

### 1.2 通用响应格式

**成功响应：**
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

---

## 2. API 端点详情

### 2.1 文本联想模块

#### 2.1.1 文本联想
**POST /api/v1/text/associate**

**请求体：**
```json
{
  "text": "老板周末让我加班"
}
```

**响应：**
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
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "anime",
        "category": "anime",
        "name": "猫和老鼠",
        "title": "猫和老鼠",
        "explanation": "老板让你加班就像汤姆追杰瑞，你努力想逃脱但总是失败，充满无奈和绝望感",
        "match_score": 0.92
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "type": "film",
        "category": "film",
        "name": "灭霸响指",
        "title": "复仇者联盟",
        "explanation": "老板的加班通知就像灭霸的响指，瞬间让你的周末计划化为灰烬，感受到绝望",
        "match_score": 0.88
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "type": "meme",
        "category": "meme",
        "name": "天塌了",
        "title": "天塌了",
        "explanation": "听到加班消息，感觉天塌下来一样，形容重大打击",
        "match_score": 0.85
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "type": "meme",
        "category": "meme",
        "name": "破防了",
        "title": "破防了",
        "explanation": "周末加班的消息让你彻底破防，心理防线被突破",
        "match_score": 0.82
      }
    ]
  }
}
```

---

### 2.2 图片联想模块

#### 2.2.1 图片联想
**POST /api/v1/image/associate**

**请求：** multipart/form-data
```
Content-Type: multipart/form-data

file: [图片文件]
```

**响应：**
同文本联想响应格式

---

### 2.3 视频联想模块

#### 2.3.1 视频联想
**POST /api/v1/video/associate**

**请求：** multipart/form-data
```
Content-Type: multipart/form-data

file: [视频文件]
```

**响应：**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "emotion": "搞笑",
      "actions": ["摔倒", "大笑"],
      "scene": "喜剧场景"
    },
    "associations": [ ... ]
  }
}
```

---

### 2.4 素材推荐模块

#### 2.4.1 素材推荐
**POST /api/v1/material/recommend**

**请求体：**
```json
{
  "association_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "type": "gif",
      "title": "汤姆被杰瑞耍",
      "source": "猫和老鼠 第1集",
      "url": "https://example.com/gifs/tom-jerry.gif",
      "timestamp": "0:45-0:52",
      "culture_content_id": "550e8400-e29b-41d4-a716-446655440000",
      "match_score": 0.95
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "type": "screenshot",
      "title": "灭霸打响指",
      "source": "复仇者联盟3",
      "url": "https://example.com/images/thanos.jpg",
      "timestamp": "2:15:30",
      "culture_content_id": "550e8400-e29b-41d4-a716-446655440001",
      "match_score": 0.90
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "type": "video",
      "title": "经典片段",
      "source": "猫和老鼠",
      "url": "https://example.com/videos/tom-jerry.mp4",
      "timestamp": "0:30-1:00",
      "culture_content_id": "550e8400-e29b-41d4-a716-446655440000",
      "match_score": 0.88
    }
  ]
}
```

---

### 2.5 文案生成模块

#### 2.5.1 文案生成
**POST /api/v1/copywriting/generate**

**请求体：**
```json
{
  "input_text": "老板周末让我加班",
  "associations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "anime",
      "name": "猫和老鼠"
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "douyin": "家人们谁懂啊！周五刚要下班，老板一句周末加班，我直接破防😱 像极了猫和老鼠里的汤姆，永远逃不出老板的手掌心... #打工人 #加班 #破防了",
    "bilibili": "【打工人实录】周末加班？我的内心是崩溃的！这波老板操作直接让我联想到灭霸响指，周末计划灰飞烟灭！评论区聊聊你们遇到过的离谱加班经历！",
    "xiaohongshu": "救命！老板周末让加班💔 瞬间天塌了的感觉谁懂！分享打工人的绝望瞬间～ #打工人日常 #加班 #职场吐槽",
    "gongzhonghao": "周末加班：当代打工人的集体困境。当老板的加班通知发来，我们如同复仇者联盟里面对灭霸的英雄，感受到深深的无力。今天我们来聊聊如何应对职场中的突发状况..."
  }
}
```

---

### 2.6 热梗库模块

#### 2.6.1 获取热梗列表
**GET /api/v1/memes**

**查询参数：**
- `page`: 页码（默认 1）
- `page_size`: 每页数量（默认 20）
- `tag`: 标签筛选
- `source`: 来源筛选

**响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "破防了",
        "source": "网络",
        "meaning": "指心理防线被突破，情绪受到冲击",
        "usage_scenarios": ["遇到挫折", "情感冲击"],
        "tags": ["情绪", "网络热梗"],
        "created_at": "2026-06-14T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

#### 2.6.2 获取单个热梗
**GET /api/v1/memes/{id}**

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "破防了",
    "source": "网络",
    "meaning": "指心理防线被突破，情绪受到冲击",
    "usage_scenarios": ["遇到挫折", "情感冲击"],
    "tags": ["情绪", "网络热梗"],
    "created_at": "2026-06-14T00:00:00Z"
  }
}
```

#### 2.6.3 搜索热梗
**POST /api/v1/memes/search**

**请求体：**
```json
{
  "query": "绝望",
  "page": 1,
  "page_size": 20
}
```

**响应：** 同获取热梗列表

---

### 2.7 文化联想库模块

#### 2.7.1 获取文化内容列表
**GET /api/v1/culture**

**查询参数：**
- `page`: 页码（默认 1）
- `page_size`: 每页数量（默认 20）
- `category`: 分类筛选（anime/film/history/game）
- `emotion`: 情绪筛选
- `tag`: 标签筛选

**响应：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "category": "anime",
        "title": "猫和老鼠",
        "description": "经典动画",
        "plot": "汤姆总是想抓住杰瑞...",
        "emotion": "搞笑",
        "keywords": ["追逐", "失败"],
        "tags": ["动画", "经典"],
        "created_at": "2026-06-14T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

#### 2.7.2 获取单个文化内容
**GET /api/v1/culture/{id}**

**响应：** 同单个热梗格式

#### 2.7.3 搜索文化内容
**POST /api/v1/culture/search**

**请求体：**
```json
{
  "query": "绝望",
  "page": 1,
  "page_size": 20
}
```

**响应：** 同获取文化内容列表

---

### 2.8 健康检查

#### 2.8.1 健康检查
**GET /health**

**响应：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "postgres": "connected",
    "qdrant": "connected"
  }
}
```

---

## 3. 错误码定义

| 错误码 | 说明 |
|--------|------|
| VALIDATION_ERROR | 验证错误 |
| NOT_FOUND | 资源不存在 |
| INTERNAL_ERROR | 内部错误 |
| AI_SERVICE_ERROR | AI服务错误 |
| FILE_TOO_LARGE | 文件过大 |
| UNSUPPORTED_FILE_TYPE | 不支持的文件类型 |

---

## 4. 限流策略

- 匿名用户：10次/分钟
- 登录用户：100次/分钟
