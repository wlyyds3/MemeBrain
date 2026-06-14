const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const headers = new Headers(options?.headers);
  const isFormData = options?.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join("；")
      : data.detail;
    throw new Error(detail || data.message || "请求失败");
  }
  return data as T;
}

export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type Recommendation = {
  id: string;
  category: "meme" | "anime" | "history" | "film";
  title: string;
  summary: string;
  reason: string;
  score: number;
  source?: string | null;
  work_title?: string | null;
  scene_title?: string | null;
  scene_description?: string | null;
  episode_label?: string | null;
  timestamp_start?: string | null;
  timestamp_end?: string | null;
  quote?: {
    speaker?: string | null;
    text?: string | null;
    verified: boolean;
  } | null;
  concepts?: string[];
  retrieval_methods?: Array<"rule" | "vector">;
  reason_meta?: {
    matched_signals?: string[];
    rule_score?: number;
    vector_score?: number | null;
  } | null;
};

export type TextAnalysisResult = {
  mode: "text";
  analysis: {
    emotion: string;
    relationship: string;
    scene: string;
    concepts: string[];
    search_focus?: string | null;
  };
  recommendations: Recommendation[];
  source: "deepseek" | "openai" | "fallback";
  vector_search_enabled: boolean;
  reserved_capabilities: {
    image: boolean;
    video: boolean;
  };
};

export type MediaReservationResult = {
  mode: "image" | "video";
  status: "reserved";
  enabled: boolean;
  message: string;
  accepted_types: string[];
  planned_pipeline: string[];
  recommended_models: string[];
};

export type AnalysisResult = TextAnalysisResult | MediaReservationResult;

export type HistoryItem = {
  id: string;
  input_text: string;
  emotion: string;
  relationship: string;
  scene: string;
  recommendations: Recommendation[];
  created_at: string;
};

export type FeedbackAction = "useful" | "not_accurate" | "favorite" | "dislike";
export type CopyPlatform = "douyin" | "xiaohongshu" | "bilibili";
export type CopyStyle = "balanced" | "funny" | "sharp" | "warm" | "cinematic";

export type PlatformCopy = {
  platform: CopyPlatform;
  title: string;
  body: string;
  tags: string[];
};

export type CopywritingResponse = {
  copies: PlatformCopy[];
};

export const api = {
  register: (payload: { email: string; password: string; name: string }) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: (token: string) =>
    request<User>("/auth/me", {
      token,
    }),
  analyze: (token: string, text: string) =>
    request<TextAnalysisResult>("/analysis", {
      method: "POST",
      token,
      body: JSON.stringify({ text }),
    }),
  analyzeImage: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<MediaReservationResult>("/analysis/image", {
      method: "POST",
      token,
      body: formData,
    });
  },
  analyzeVideo: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<MediaReservationResult>("/analysis/video", {
      method: "POST",
      token,
      body: formData,
    });
  },
  history: (token: string, filters?: { q?: string; emotion?: string; scene?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.q) params.set("q", filters.q);
    if (filters?.emotion) params.set("emotion", filters.emotion);
    if (filters?.scene) params.set("scene", filters.scene);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    return request<HistoryItem[]>(`/history${query ? `?${query}` : ""}`, { token });
  },
  deleteHistory: (token: string, id: string) =>
    request<void>(`/history/${id}`, {
      method: "DELETE",
      token,
    }),
  feedback: (
    token: string,
    payload: {
      history_id?: string | null;
      recommendation_id: string;
      category: Recommendation["category"];
      title: string;
      action: FeedbackAction;
      note?: string | null;
    },
  ) =>
    request<{ id: string; recommendation_id: string; action: FeedbackAction; created_at: string }>("/feedback", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  copywriting: (
    token: string,
    payload: {
      input_text: string;
      analysis: TextAnalysisResult["analysis"];
      recommendations: Recommendation[];
      platforms: CopyPlatform[];
      style: CopyStyle;
      focus_recommendation_id?: string | null;
      variant_seed?: number;
    },
  ) =>
    request<CopywritingResponse>("/copywriting", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
};