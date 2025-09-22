import axios from 'axios';

export const DIFY_API_CONFIG = {
  baseUrl: '/v1',
  endpoints: {
    workflowsRun: '/workflows/run',
    completionMessages: '/completion-messages',
    chatMessages: '/chat-messages'
  },
  defaultUser: 'paper-generator-ui'
} as const;

type WorkflowInputs = Record<string, unknown>;

type WorkflowResponse = {
  id?: string;
  status?: string;
  message?: string;
  outputs?: Record<string, unknown> | null;
  result?: string;
  data?: {
    outputs?: Record<string, unknown> | null;
    result?: string;
  };
};

type WorkflowPayload = {
  inputs: WorkflowInputs;
  response_mode?: 'blocking' | 'streaming' | 'no_wait' | 'async';
  user?: string;
  workflow_id?: string;
  metadata?: Record<string, unknown>;
};

export interface GenerateOutlineParams {
  title: string;
  major?: string;
  direction?: string;
  wordCount?: number;
  description?: string;
}

export interface GenerateContentParams {
  outline: string;
  wordCount?: number;
}

const apiClient = axios.create({
  baseURL: DIFY_API_CONFIG.baseUrl,
  timeout: 60_000
});

const createHeaders = (apiKey?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
};

const runWorkflow = async <T extends WorkflowResponse>(
  payload: WorkflowPayload,
  apiKey?: string
): Promise<T> => {
  const { data } = await apiClient.post<T>(
    DIFY_API_CONFIG.endpoints.workflowsRun,
    {
      response_mode: 'blocking',
      user: DIFY_API_CONFIG.defaultUser,
      ...payload
    },
    { headers: createHeaders(apiKey) }
  );
  return data;
};

const extractTextFromOutputs = (outputs?: Record<string, unknown> | null): string | null => {
  if (!outputs) {
    return null;
  }
  const values = Object.values(outputs);
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    if (typeof value === 'object' && value !== null) {
      const maybeText =
        (typeof (value as { text?: unknown }).text === 'string'
          ? (value as { text: string }).text
          : undefined) ??
        (typeof (value as { answer?: unknown }).answer === 'string'
          ? (value as { answer: string }).answer
          : undefined) ??
        (typeof (value as { result?: unknown }).result === 'string'
          ? (value as { result: string }).result
          : undefined) ??
        (typeof (value as { content?: unknown }).content === 'string'
          ? (value as { content: string }).content
          : undefined);
      if (maybeText) {
        const trimmed = maybeText.trim();
        if (trimmed) {
          return trimmed;
        }
      }
    }
  }
  return null;
};

const parseTextArray = (text: string): string[] => {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }
  } catch (error) {
    // 不是 JSON 数组，退回到按行解析
  }
  return text
    .split(/\r?\n+/)
    .map((item) => item.replace(/^[-*•\d\.\s]+/, '').trim())
    .filter(Boolean);
};

export const generatePaperOutline = async (
  params: GenerateOutlineParams,
  apiKey?: string
): Promise<string> => {
  const payload: WorkflowPayload = {
    inputs: {
      title: params.title,
      major: params.major,
      direction: params.direction,
      word_count: params.wordCount,
      description: params.description,
      task_type: 'outline'
    }
  };
  const response = await runWorkflow(payload, apiKey);
  const text =
    extractTextFromOutputs(response.outputs ?? response.data?.outputs ?? null) ??
    response.result ??
    response.data?.result ??
    '';
  if (!text) {
    throw new Error('未能从工作流响应中解析到论文大纲，请稍后重试或检查工作流配置。');
  }
  return text;
};

export const fetchTitleSuggestions = async (
  seedText: string,
  apiKey?: string
): Promise<string[]> => {
  const payload: WorkflowPayload = {
    inputs: {
      seed_text: seedText,
      task_type: 'title_suggestions'
    }
  };
  const response = await runWorkflow(payload, apiKey);
  const text =
    extractTextFromOutputs(response.outputs ?? response.data?.outputs ?? null) ??
    response.result ??
    response.data?.result ??
    '';
  if (!text) {
    return [];
  }
  return parseTextArray(text);
};

export const generatePaperContent = async (
  params: GenerateContentParams,
  apiKey?: string
): Promise<string> => {
  const payload: WorkflowPayload = {
    inputs: {
      outline: params.outline,
      word_count: params.wordCount,
      task_type: 'content'
    }
  };
  const response = await runWorkflow(payload, apiKey);
  const text =
    extractTextFromOutputs(response.outputs ?? response.data?.outputs ?? null) ??
    response.result ??
    response.data?.result ??
    '';
  if (!text) {
    throw new Error('未能从工作流响应中解析到正文内容，请检查工作流返回格式。');
  }
  return text;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await apiClient.post(
      DIFY_API_CONFIG.endpoints.workflowsRun,
      {
        inputs: { ping: 'health_check' },
        response_mode: 'no_wait',
        user: DIFY_API_CONFIG.defaultUser
      },
      { headers: createHeaders(apiKey) }
    );
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return false;
    }
    throw error;
  }
};

export const formatErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请检查网络状况或稍后重试。';
    }

    if (!error.response) {
      return '网络请求失败，请确认已连接至网络并检查代理配置。';
    }

    const status = error.response.status;
    const data = error.response.data as
      | { message?: string; error?: string; detail?: string }
      | string
      | undefined;
    const detail =
      typeof data === 'string'
        ? data
        : data?.message ?? data?.error ?? data?.detail ?? '';

    switch (status) {
      case 400:
        return detail || '请求参数有误，请检查输入内容后重试。';
      case 401:
        return detail || '鉴权失败，请确认 Dify API Key 是否填写正确。';
      case 403:
        return detail || '无权访问所请求的工作流，请确认权限配置。';
      case 404:
        return detail || '未找到对应的接口，请确认代理或工作流地址是否正确。';
      case 429:
        return detail || '请求过于频繁，请稍后重试或降低调用频率。';
      case 500:
        return detail || '服务内部错误，请稍后重试。';
      case 502:
      case 503:
      case 504:
        return (
          detail ||
          '上游服务暂时不可用或超时，请稍后重试，必要时可调整工作流为流式或异步模式。'
        );
      default:
        return detail || `请求失败（状态码：${status}），请稍后再试。`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '发生未知错误，请稍后重试。';
};
