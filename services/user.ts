import { findUserByEmail, findUserByUuid, insertUser, updateUserUsername } from "@/models/user";

import { User } from "@/types/user";
import { auth } from "@/auth";
// 仅在服务器组件中导入
// import { headers } from "next/headers";

export async function saveUser(user: User) {
  try {
    console.log("saveUser: Saving user with email:", user.email, "and UUID:", user.uuid);

    // 首先检查是否已经存在具有相同 UUID 的用户
    if (user.uuid) {
      const existUserByUuid = await findUserByUuid(user.uuid);
      if (existUserByUuid) {
        console.log("saveUser: Found existing user by UUID:", existUserByUuid.uuid);

        // 使用现有用户的 ID 和创建时间
        user.id = existUserByUuid.id;
        user.created_at = existUserByUuid.created_at;

        // 如果现有用户没有用户名，但新用户有昵称，则更新用户名
        if (!existUserByUuid.username && user.nickname) {
          // 将昵称转换为有效的用户名（只保留字母、数字、下划线和连字符）
          let username = user.nickname.toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .substring(0, 30); // 限制长度为30个字符

          // 如果用户名为空（例如，昵称只包含特殊字符），使用随机字符串
          if (!username) {
            username = 'user_' + Math.random().toString(36).substring(2, 10);
          }

          console.log("saveUser: Updating username for existing user:", username);

          // 更新用户名
          await updateUserUsername(user.uuid, username);
          user.username = username;
        } else if (existUserByUuid.username) {
          // 保留现有用户名
          user.username = existUserByUuid.username;
        }

        return user;
      }
    }

    // 如果没有找到具有相同 UUID 的用户，则检查是否存在具有相同电子邮件的用户
    const existUserByEmail = await findUserByEmail(user.email);
    if (existUserByEmail) {
      console.log("saveUser: Found existing user by email:", existUserByEmail.email);

      // 使用现有用户的 ID、UUID 和创建时间
      user.id = existUserByEmail.id;
      user.uuid = existUserByEmail.uuid;
      user.created_at = existUserByEmail.created_at;

      // 如果现有用户没有用户名，但新用户有昵称，则更新用户名
      if (!existUserByEmail.username && user.nickname) {
        // 将昵称转换为有效的用户名（只保留字母、数字、下划线和连字符）
        let username = user.nickname.toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
          .substring(0, 30); // 限制长度为30个字符

        // 如果用户名为空（例如，昵称只包含特殊字符），使用随机字符串
        if (!username) {
          username = 'user_' + Math.random().toString(36).substring(2, 10);
        }

        console.log("saveUser: Updating username for existing user:", username);

        // 更新用户名
        await updateUserUsername(user.uuid || "", username);
        user.username = username;
      } else if (existUserByEmail.username) {
        // 保留现有用户名
        user.username = existUserByEmail.username;
      }
    } else {
      // 新用户，确保有用户名
      if (!user.username && user.nickname) {
        // 将昵称转换为有效的用户名（只保留字母、数字、下划线和连字符）
        let username = user.nickname.toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
          .substring(0, 30); // 限制长度为30个字符

        // 如果用户名为空（例如，昵称只包含特殊字符），使用随机字符串
        if (!username) {
          username = 'user_' + Math.random().toString(36).substring(2, 10);
        }

        user.username = username;
        console.log("saveUser: Generated username for new user:", username);
      }

      console.log("saveUser: Inserting new user with email:", user.email);
      await insertUser(user);
    }

    return user;
  } catch (e) {
    console.log("save user failed: ", e);
    throw e;
  }
}

// 服务器端版本 - 仅在服务器组件中使用
export async function getUserUuid() {
  let user_uuid = "";

  const session = await auth();
  if (session && session.user) {
    // 首先尝试从uuid字段获取
    if (session.user.uuid) {
      user_uuid = session.user.uuid;
    }
    // 如果没有uuid字段，尝试从id字段获取
    else if (session.user.id) {
      user_uuid = session.user.id;
    }
  }

  return user_uuid;
}

// 客户端安全版本 - 可以在客户端组件中使用
export async function getUserUuidClient() {
  let user_uuid = "";

  // 在客户端，我们只使用 auth() 获取用户信息
  const session = await auth();
  if (session && session.user) {
    // 首先尝试从uuid字段获取
    if (session.user.uuid) {
      user_uuid = session.user.uuid;
    }
    // 如果没有uuid字段，尝试从id字段获取
    else if (session.user.id) {
      user_uuid = session.user.id;
    }
  }

  return user_uuid;
}

// 这些函数已不再需要，因为我们不再使用API密钥
// 保留函数签名但简化实现，以防其他地方调用
export async function getBearerToken() {
  return "";
}

export async function getBearerTokenClient() {
  return "";
}

export async function getUserEmail() {
  let user_email = "";

  const session = await auth();
  if (session && session.user && session.user.email) {
    user_email = session.user.email;
  }

  return user_email;
}

// 服务器端版本 - 仅在服务器组件中使用
export async function getUserInfo() {
  let user_uuid = await getUserUuid();

  if (!user_uuid) {
    return;
  }

  const user = await findUserByUuid(user_uuid);

  return user;
}

// 客户端安全版本 - 可以在客户端组件中使用
export async function getUserInfoClient() {
  let user_uuid = await getUserUuidClient();

  if (!user_uuid) {
    return;
  }

  const user = await findUserByUuid(user_uuid);

  return user;
}
