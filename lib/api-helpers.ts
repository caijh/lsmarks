import { NextResponse } from "next/server";

/**
 * 返回成功响应
 * @param data 响应数据
 * @param cacheSeconds 缓存时间（秒）
 * @returns NextResponse
 */
export function respData(data: any, cacheSeconds = 0) {
  const headers: HeadersInit = {};
  
  if (cacheSeconds > 0) {
    headers["Cache-Control"] = `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`;
  } else {
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
  }
  
  return NextResponse.json(
    { success: true, data },
    { headers }
  );
}

/**
 * 返回错误响应
 * @param message 错误信息
 * @param status 状态码
 * @returns NextResponse
 */
export function respErr(message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { 
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    }
  );
}
