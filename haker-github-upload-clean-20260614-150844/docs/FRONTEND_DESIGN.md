# 前端设计文档

## 1. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14 | React 框架 |
| TypeScript | 5+ | 类型安全 |
| TailwindCSS | 3+ | 样式框架 |
| Shadcn UI | - | UI 组件库 |
| React Query | - | 数据获取和缓存 |
| Zustand | - | 状态管理 |

---

## 2. 页面结构

### 2.1 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| / | 首页 | 功能入口 |
| /text | 文本联想 | 文本输入和分析 |
| /image | 图片联想 | 图片上传和分析 |
| /video | 视频联想 | 视频上传和分析 |
| /meme-library | 热梗库 | 热梗浏览和搜索 |
| /culture-library | 文化联想库 | 文化内容浏览 |

---

## 3. 核心组件设计

### 3.1 布局组件

#### 3.1.1 Header 组件
**路径：** `src/components/layout/Header.tsx`

功能：
- Logo 展示
- 导航菜单
- 响应式设计

```tsx
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b bg-white dark:bg-gray-950">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          🧠 MemeBrain
        </Link>
        <nav className="ml-auto flex items-center gap-6">
          <Link href="/text" className="text-sm font-medium hover:text-primary">文本</Link>
          <Link href="/image" className="text-sm font-medium hover:text-primary">图片</Link>
          <Link href="/video" className="text-sm font-medium hover:text-primary">视频</Link>
          <Link href="/meme-library" className="text-sm font-medium hover:text-primary">热梗库</Link>
          <Link href="/culture-library" className="text-sm font-medium hover:text-primary">文化库</Link>
        </nav>
      </div>
    </header>
  )
}
```

---

### 3.2 功能组件

#### 3.2.1 TextInput 组件
**路径：** `src/components/features/TextInput.tsx`

功能：
- 大文本输入框
- 字数统计
- 提交按钮

```tsx
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface TextInputProps {
  onSubmit: (text: string) => void
  loading?: boolean
}

export function TextInput({ onSubmit, loading }: TextInputProps) {
  const [text, setText] = useState('')
  const maxLength = 1000

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="输入一段话、一段文案，让 AI 帮你联想相关的热梗、名场面..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={maxLength}
        rows={8}
        className="resize-none"
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{text.length}/{maxLength}</span>
        <Button onClick={() => onSubmit(text)} disabled={!text.trim() || loading}>
          {loading ? '分析中...' : '开始联想'}
        </Button>
      </div>
    </div>
  )
}
```

---

#### 3.2.2 AssociationResult 组件
**路径：** `src/components/features/AssociationResult.tsx`

功能：
- 显示分析结果
- 显示联想卡片
- 选择素材

```tsx
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Association {
  id: string
  type: string
  name: string
  explanation: string
  match_score: number
}

interface Analysis {
  emotion: string
  relationship?: string
  scene?: string
}

interface AssociationResultProps {
  analysis: Analysis
  associations: Association[]
  onSelectMaterial: (ids: string[]) => void
}

export function AssociationResult({ analysis, associations, onSelectMaterial }: AssociationResultProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">情绪</div>
          <div className="text-lg font-bold">{analysis.emotion}</div>
        </div>
        {analysis.relationship && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">关系</div>
            <div className="text-lg font-bold">{analysis.relationship}</div>
          </div>
        )}
        {analysis.scene && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">场景</div>
            <div className="text-lg font-bold">{analysis.scene}</div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {associations.map((item) => (
          <Card
            key={item.id}
            className={`p-4 cursor-pointer transition-all ${selectedIds.includes(item.id) ? 'border-primary' : ''}`}
            onClick={() => {
              setSelectedIds(prev =>
                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
              )
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant="outline">{item.type}</Badge>
                <h3 className="text-lg font-semibold mt-1">{item.name}</h3>
              </div>
              <div className="text-sm text-gray-500">{(item.match_score * 100).toFixed(0)}%</div>
            </div>
            <p className="text-sm text-gray-600">{item.explanation}</p>
          </Card>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={() => onSelectMaterial(selectedIds)}>推荐素材和文案</Button>
        </div>
      )}
    </div>
  )
}
```

---

#### 3.2.3 CopywritingTabs 组件
**路径：** `src/components/features/CopywritingTabs.tsx`

功能：
- 多平台文案标签页
- 一键复制

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy } from 'lucide-react'

interface Copywriting {
  douyin: string
  bilibili: string
  xiaohongshu: string
  gongzhonghao: string
}

interface CopywritingTabsProps {
  copywriting: Copywriting
}

export function CopywritingTabs({ copywriting }: CopywritingTabsProps) {
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const platforms = [
    { key: 'douyin', label: '抖音', icon: '🎵' },
    { key: 'bilibili', label: 'B站', icon: '📺' },
    { key: 'xiaohongshu', label: '小红书', icon: '📕' },
    { key: 'gongzhonghao', label: '公众号', icon: '💬' },
  ] as const

  return (
    <Tabs defaultValue="douyin">
      <TabsList className="grid w-full grid-cols-4">
        {platforms.map(p => (
          <TabsTrigger key={p.key} value={p.key}>
            {p.icon} {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {platforms.map(p => (
        <TabsContent key={p.key} value={p.key}>
          <Card className="p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">{p.label}文案</span>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(copywriting[p.key])}>
                <Copy className="w-4 h-4 mr-1" /> 复制
              </Button>
            </div>
            <p className="whitespace-pre-wrap">{copywriting[p.key]}</p>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
```

---

## 4. TypeScript 类型定义

**路径：** `src/types/index.ts`

```typescript
export interface Analysis {
  emotion: string
  relationship?: string
  scene?: string
  actions?: string[]
}

export interface Association {
  id: string
  type: 'anime' | 'film' | 'history' | 'game' | 'meme'
  category: string
  name: string
  title: string
  explanation: string
  match_score: number
}

export interface Material {
  id: string
  type: 'gif' | 'screenshot' | 'video'
  title: string
  source: string
  url: string
  timestamp: string
  culture_content_id?: string
  match_score: number
}

export interface Copywriting {
  douyin: string
  bilibili: string
  xiaohongshu: string
  gongzhonghao: string
}

export interface Meme {
  id: string
  name: string
  source: string
  meaning: string
  usage_scenarios: string[]
  tags: string[]
  created_at: string
}

export interface CultureContent {
  id: string
  category: 'anime' | 'film' | 'history' | 'game'
  title: string
  description: string
  plot: string
  emotion: string
  keywords: string[]
  tags: string[]
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
```

---

## 5. API 封装

**路径：** `src/lib/api.ts`

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.error?.message || '请求失败')
  }

  return data.data
}

export const api = {
  text: {
    associate: (text: string) =>
      request<{ analysis: Analysis; associations: Association[] }>('/text/associate', {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
  },

  image: {
    associate: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return request<{ analysis: Analysis; associations: Association[] }>('/image/associate', {
        method: 'POST',
        body: formData,
      })
    },
  },

  video: {
    associate: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return request<{ analysis: Analysis; associations: Association[] }>('/video/associate', {
        method: 'POST',
        body: formData,
      })
    },
  },

  material: {
    recommend: (associationIds: string[]) =>
      request<Material[]>('/material/recommend', {
        method: 'POST',
        body: JSON.stringify({ association_ids: associationIds }),
      }),
  },

  copywriting: {
    generate: (inputText: string, associations: Association[]) =>
      request<Copywriting>('/copywriting/generate', {
        method: 'POST',
        body: JSON.stringify({ input_text: inputText, associations }),
      }),
  },

  memes: {
    list: (params?: { page?: number; page_size?: number; tag?: string; source?: string }) =>
      request<PaginatedResponse<Meme>>(`/memes?${new URLSearchParams(params as any)}`),
    get: (id: string) => request<Meme>(`/memes/${id}`),
    search: (query: string, page = 1, page_size = 20) =>
      request<PaginatedResponse<Meme>>('/memes/search', {
        method: 'POST',
        body: JSON.stringify({ query, page, page_size }),
      }),
  },

  culture: {
    list: (params?: { page?: number; page_size?: number; category?: string; emotion?: string; tag?: string }) =>
      request<PaginatedResponse<CultureContent>>(`/culture?${new URLSearchParams(params as any)}`),
    get: (id: string) => request<CultureContent>(`/culture/${id}`),
    search: (query: string, page = 1, page_size = 20) =>
      request<PaginatedResponse<CultureContent>>('/culture/search', {
        method: 'POST',
        body: JSON.stringify({ query, page, page_size }),
      }),
  },
}
```

---

## 6. 首页设计

**路径：** `src/app/page.tsx`

```tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container py-20">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold">
          🧠 MemeBrain
        </h1>
        <p className="text-xl text-gray-600">
          AI 文化联想引擎 - 让灵感触手可及
        </p>
        <p className="text-gray-500">
          输入文本、图片或视频，自动联想网络热梗、动漫名场面、历史典故、影视桥段、游戏剧情
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link href="/text">
            <Button className="w-full h-24 text-lg" variant="default">
              📝 文本联想
            </Button>
          </Link>
          <Link href="/image">
            <Button className="w-full h-24 text-lg" variant="default">
              🖼️ 图片联想
            </Button>
          </Link>
          <Link href="/video">
            <Button className="w-full h-24 text-lg" variant="default">
              🎬 视频联想
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8">
          <Link href="/meme-library">
            <Button className="w-full" variant="outline">
              🔥 热梗库
            </Button>
          </Link>
          <Link href="/culture-library">
            <Button className="w-full" variant="outline">
              🎭 文化联想库
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. Tailwind 配置

**路径：** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```
