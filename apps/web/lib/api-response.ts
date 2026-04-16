import { NextResponse } from 'next/server';

/**
 * 创建成功响应
 */
export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(message: string, status = 400, errors?: any[]) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
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
