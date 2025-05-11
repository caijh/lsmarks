/**
 * 密码哈希和验证工具
 * 
 * 这个模块提供了安全的密码哈希和验证功能
 * 使用 bcryptjs 库进行密码哈希处理
 */

import bcrypt from 'bcryptjs';

// 盐值轮数，越高越安全但也越慢，推荐值为10-12
const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希处理
 * @param password 原始密码
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // 生成盐值
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    
    // 使用盐值对密码进行哈希
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return hashedPassword;
  } catch (error) {
    console.error('密码哈希失败:', error);
    throw new Error('密码处理失败');
  }
}

/**
 * 验证密码是否匹配
 * @param plainPassword 原始密码
 * @param hashedPassword 哈希后的密码
 * @returns 密码是否匹配
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    // 比较原始密码和哈希密码
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}

/**
 * 同步版本的密码哈希（用于特殊情况）
 * 注意：一般情况下应使用异步版本
 * @param password 原始密码
 * @returns 哈希后的密码
 */
export function hashPasswordSync(password: string): string {
  try {
    // 生成盐值并哈希密码
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    return hashedPassword;
  } catch (error) {
    console.error('密码哈希失败:', error);
    throw new Error('密码处理失败');
  }
}

/**
 * 同步版本的密码验证（用于特殊情况）
 * 注意：一般情况下应使用异步版本
 * @param plainPassword 原始密码
 * @param hashedPassword 哈希后的密码
 * @returns 密码是否匹配
 */
export function verifyPasswordSync(plainPassword: string, hashedPassword: string): boolean {
  try {
    // 比较原始密码和哈希密码
    return bcrypt.compareSync(plainPassword, hashedPassword);
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}
