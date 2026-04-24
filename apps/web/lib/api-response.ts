import { NextResponse } from 'next/server';

/**
 * API 响应数据类型
 */
type ApiResponseData = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

/**
 * 验证错误项类型
 */
type ValidationError = {
  field?: string;
  message: string;
  code?: string;
};

/**
 * 创建成功响应
 */
export function successResponse(data: ApiResponseData, status = 200) {
  return new NextResponse(
    JSON.stringify({
      success: true,
      data,
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(message: string, status = 400, errors?: ValidationError[]) {
  return new NextResponse(
    JSON.stringify({
      success: false,
      message,
      errors,
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}

/**
 * 创建未授权响应
 */
export function unauthorizedResponse(message = '未授权访问') {
  return errorResponse(message, 401);
}

/**
 * 创建禁止访问响应
 */
export function forbiddenResponse(message = '禁止访问') {
  return errorResponse(message, 403);
}

/**
 * 创建未找到响应
 */
export function notFoundResponse(message = '资源不存在') {
  return errorResponse(message, 404);
}

/**
 * 创建服务器错误响应
 */
export function serverErrorResponse(message = '服务器内部错误') {
  return errorResponse(message, 500);
}
