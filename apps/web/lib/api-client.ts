/**
 * API 客户端工具函数
 * 提供统一的 API 调用接口,包含错误处理和重试机制
 */

export interface ApiError {
  message: string;
  status: number;
  errors?: unknown[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown[];
}

/**
 * 通用的 API 请求函数
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || '请求失败',
        status: response.status,
        errors: data.errors,
      } as ApiError;
    }

    return data as ApiResponse<T>;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    
    // 网络错误或其他错误
    throw {
      message: error instanceof Error ? error.message : '网络错误,请检查您的连接',
      status: 0,
    } as ApiError;
  }
}

/**
 * GET 请求
 */
export async function get<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'GET' });
}

/**
 * POST 请求
 */
export async function post<T = unknown>(
  url: string,
  data: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export async function put<T = unknown>(
  url: string,
  data: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export async function del<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { method: 'DELETE' });
}

/**
 * 带重试机制的 API 请求
 */
export async function apiRequestWithRetry<T = unknown>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<ApiResponse<T>> {
  let lastError: ApiError | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await apiRequest<T>(url, options);
    } catch (error) {
      lastError = error as ApiError;
      
      // 如果是客户端错误(4xx),不重试
      if (lastError.status >= 400 && lastError.status < 500) {
        throw lastError;
      }

      // 等待后重试
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * 批量请求(并行)
 */
export async function batchRequest<T = unknown>(
  requests: Array<{ url: string; options?: RequestInit }>
): Promise<ApiResponse<T>[]> {
  const promises = requests.map(({ url, options }) => apiRequest<T>(url, options));
  return Promise.all(promises);
}

/**
 * 创建带认证的 API 客户端
 */
export function createAuthApiClient(baseUrl = '') {
  return {
    get: <T = unknown>(path: string) => get<T>(`${baseUrl}${path}`),
    post: <T = unknown>(path: string, data: unknown) => post<T>(`${baseUrl}${path}`, data),
    put: <T = unknown>(path: string, data: unknown) => put<T>(`${baseUrl}${path}`, data),
    delete: <T = unknown>(path: string) => del<T>(`${baseUrl}${path}`),
  };
}

// 导出默认的 API 客户端实例
export const api = createAuthApiClient('/api');
