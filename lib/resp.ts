/**
 * 添加缓存控制头到响应
 * @param response 原始响应
 * @param maxAge 缓存时间（秒）
 * @returns 添加了缓存控制头的响应
 */
export function addCacheControl(response: Response, maxAge: number = 10): Response {
  // 克隆响应以避免修改原始响应
  const newResponse = new Response(response.body, response);

  // 添加缓存控制头
  newResponse.headers.set('Cache-Control', `private, max-age=${maxAge}`);

  return newResponse;
}

/**
 * 返回成功响应，包含数据
 * @param data 响应数据
 * @param maxAge 缓存时间（秒），默认为10秒
 */
export function respData(data: any, maxAge?: number) {
  const response = respJson(0, "ok", data || []);
  return maxAge !== undefined ? addCacheControl(response, maxAge) : response;
}

/**
 * 返回成功响应，不包含数据
 * @param maxAge 缓存时间（秒），默认不缓存
 */
export function respOk(maxAge?: number) {
  const response = respJson(0, "ok");
  return maxAge !== undefined ? addCacheControl(response, maxAge) : response;
}

/**
 * 返回错误响应
 * @param message 错误消息
 * @param maxAge 缓存时间（秒），默认不缓存
 */
export function respErr(message: string, maxAge?: number) {
  const response = respJson(-1, message);
  return maxAge !== undefined ? addCacheControl(response, maxAge) : response;
}

/**
 * 创建JSON响应
 * @param code 响应代码
 * @param message 响应消息
 * @param data 响应数据
 * @returns Response对象
 */
export function respJson(code: number, message: string, data?: any) {
  let json = {
    code: code,
    message: message,
    data: data,
  };
  if (data) {
    json["data"] = data;
  }

  // 创建响应对象，这样调用者可以添加自定义头部
  return new Response(JSON.stringify(json), {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}
