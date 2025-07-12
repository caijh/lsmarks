# LSMarks - 智能书签管理系统

<div align="center">
  <img src="public/logo.svg" alt="LSMarks Logo" width="120" />
  <h3>简洁优雅的书签管理与分享系统</h3>
</div>

## 📖 项目介绍

LSMarks 是一个现代化的书签管理与分享系统，专为提升网络资源整理效率而设计。项目采用 Next.js 15 构建，提供简洁直观的用户界面和高效的书签管理体验。

### 核心特性

- **书签集合管理**：创建、编辑和分享您的书签集合
- **多级分类**：通过大分类和子分类灵活组织书签
- **主题定制**：支持多种预设主题和深色/浅色模式
- **响应式设计**：完美适配桌面和移动设备
- **高性能**：采用代码分割和动态导入优化性能
- **简洁界面**：专注于用户体验的简约设计

## 🚀 快速开始

### 在线体验

访问 [https://lsmark.669696.xyz](https://lsmark.669696.xyz) 体验 LSMarks。

### 本地开发

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/lsmarks.git
cd lsmarks
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填写必要的环境变量：

```bash
# 本地开发URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase配置（从Supabase项目设置中获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth密钥（可使用任意字符串用于开发）
NEXTAUTH_SECRET=development-secret-key
```

4. **启动开发服务器**

```bash
pnpm dev
```

5. **访问本地站点**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/)
- **UI组件**: [Shadcn UI](https://ui.shadcn.com/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **数据库**: [Supabase](https://supabase.com/) (PostgreSQL)
- **认证**: [NextAuth.js 5](https://next-auth.js.org/)
- **状态管理**: React Context API

## 📋 完整部署指南

### 部署前准备

在部署 LSMarks 前，您需要准备以下资源：

1. **域名**：一个指向您部署服务器的域名（例如 `yourdomain.com`）
2. **Supabase 项目**：用于数据库和用户认证
3. **Vercel 账号**：用于部署和托管应用

### 步骤 1：创建 Supabase 项目

1. 访问 [Supabase 控制台](https://app.supabase.com/) 并创建一个账户
2. 点击 "New Project" 创建新项目
3. 填写项目详情：
   - 项目名称：例如 "leishui-bookmark"
   - 数据库密码：设置一个安全的密码（请记住它）
   - 区域：选择离您用户最近的区域
4. 点击 "Create new project" 并等待项目创建完成（约 2-3 分钟）
5. 创建完成后，从项目设置中获取以下信息：
   - **Project URL**：在 Settings > API 中找到（例如 `https://abcdefghijklm.supabase.co`）
   - **anon/public key**：在 Settings > API 中找到
   - **service_role key**：在 Settings > API 中找到（注意：这是高权限密钥，请妥善保管）

### 步骤 2：初始化 Supabase 数据库

1. 在 Supabase 控制台中，导航到 SQL 编辑器
2. 打开项目根目录的 `data/unified.sql` 文件
3. 复制文件内容，粘贴到 SQL 编辑器中
4. 点击 "Run" 执行 SQL 脚本，创建所有必要的表和函数
5. 确认在 "Table Editor" 中可以看到创建的表（users、bookmark_collections 等）

**重要：安全策略配置**
- 如果是现有数据库或需要单独应用安全策略，请执行 `data/rls-policies.sql`
- 这将启用行级安全（RLS）并修复安全警告
- 在 SQL 编辑器中执行该文件以确保数据安全

### 步骤 3：配置 Supabase 认证

1. 在 Supabase 控制台中，导航到 Authentication > Settings
2. 在 "URL Configuration" 部分，设置：
   - Site URL：您的网站 URL（例如 `https://yourdomain.com`）
   - Redirect URLs：添加 `https://yourdomain.com/auth/callback/credentials`
3. 在 "Email Auth" 部分，确保 "Enable Email Signup" 已启用
4. 保存设置

### 步骤 4：准备环境变量

以下是部署 LSMarks 所需的所有环境变量：

```bash
# 站点 URL - 您的网站域名，用于站点访问和认证回调
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Supabase 配置 - 从 Supabase 项目设置中获取
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth 认证密钥 - 用于加密会话
# 可以使用以下命令生成: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-key
```

### 步骤 5：Vercel 部署

Vercel 是部署 Next.js 应用的最佳平台，提供免费计划和简单的设置流程。

1. 将项目推送到 GitHub 仓库
2. 访问 [Vercel 控制台](https://vercel.com/) 并创建账户
3. 点击 "New Project" 并导入您的 GitHub 仓库
4. 配置项目:
   - 框架预设: Next.js
   - 构建命令: `pnpm build`
   - 输出目录: `.next`
   - 安装命令: `pnpm install --no-frozen-lockfile`
   - Node.js 版本: 18.x 或更高
5. 在 "Environment Variables" 部分添加上述所有环境变量
6. 点击 "Deploy" 按钮开始部署
7. 部署完成后，您可以在 "Domains" 设置中添加自定义域名

### 步骤 6：验证部署

1. 访问您的网站域名（例如 `https://yourdomain.com`）
2. 尝试注册一个新账户
3. 登录并创建书签集合
4. 测试添加书签和分类功能

   - 检查构建日志中的错误信息
   - 确保 Node.js 和 pnpm 版本符合要求
   - 验证所有环境变量是否正确设置


<div align="center">
  <p>LSMarks - 智能书签管理系统，让您的网络资源井然有序，构建个人知识库。</p>

  <div style="display: flex; justify-content: center; gap: 20px; margin-top: 30px;">
    <img src="public/images/买个辣条.jpg" alt="买个辣条" width="120" />
    <img src="public/images/一起交流.jpg" alt="一起交流" width="120" />
    <img src="public/images/wxq.jpg" alt="微信群" width="120" />
  </div>
</div>
