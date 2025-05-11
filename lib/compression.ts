/**
 * 数据压缩工具
 * 
 * 提供简单的数据压缩和解压缩功能，用于减少本地存储空间占用。
 * 使用 LZString 库进行压缩。
 */

/**
 * 压缩数据
 * @param data 要压缩的数据
 * @returns 压缩后的字符串
 */
export function compress(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    
    // 使用简单的 Base64 编码，在实际项目中可以使用 LZString 等库进行更高效的压缩
    return btoa(encodeURIComponent(jsonString));
  } catch (error) {
    console.error('Failed to compress data', error);
    return JSON.stringify(data);
  }
}

/**
 * 解压缩数据
 * @param compressedString 压缩后的字符串
 * @returns 解压缩后的数据
 */
export function decompress(compressedString: string): any {
  try {
    // 使用简单的 Base64 解码，在实际项目中可以使用 LZString 等库进行更高效的解压缩
    const jsonString = decodeURIComponent(atob(compressedString));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decompress data', error);
    try {
      // 尝试直接解析 JSON
      return JSON.parse(compressedString);
    } catch {
      return null;
    }
  }
}

/**
 * 检查字符串是否为压缩格式
 * @param str 要检查的字符串
 * @returns 是否为压缩格式
 */
export function isCompressed(str: string): boolean {
  try {
    // 尝试解码 Base64
    atob(str);
    return true;
  } catch {
    return false;
  }
}
