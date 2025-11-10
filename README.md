# 英语学习助手 - Vue + Supabase 项目

这是一个基于Vue 3和Supabase开发的英语学习助手，包含以下主要功能：

## 部署说明

### 在Netlify上部署时的环境变量配置

要在Netlify上成功部署并使用Supabase功能（登录、注册等），需要正确设置以下环境变量：

1. 在Netlify项目中，进入 **Site settings** > **Build & deploy** > **Environment** > **Environment variables**
2. 添加以下环境变量：

   | 环境变量名称 | 说明 | 必需 |
   |------------|------|------|
   | `VITE_SUPABASE_URL` | 您的Supabase项目URL | 是 |
   | `VITE_SUPABASE_ANON_KEY` | 您的Supabase匿名访问密钥 | 是 |

### 如何获取Supabase配置

1. 登录您的Supabase账户
2. 打开您的项目
3. 进入 **Settings** > **API**
4. 在 **Project URL** 部分复制URL
5. 在 **Project API keys** 部分复制 `anon` 类型的密钥

### 本地开发配置

1. 复制 `.env.example` 文件为 `.env`
2. 在 `.env` 文件中填入您的Supabase配置信息
3. 运行 `npm install` 和 `npm run dev` 开始本地开发

## 数据库设置

首次使用时，请在Supabase控制台中执行 `create-auth-tables.sql` 文件中的SQL脚本，以创建必要的用户表结构。

- 备考单词本管理
- 备考作文存储
- 好句记录功能
- 考试日历（可设置考试时间）

## 项目技术栈

- **前端框架**: Vue 3 + Vite
- **数据库**: Supabase
- **工具库**: Axios, Day.js

## 开始使用

### 前提条件

- Node.js 16+
- npm 或 yarn
- Supabase 账户

### 安装步骤

1. 克隆或下载本项目

2. 安装依赖
```bash
npm install
```

3. 配置Supabase

   a. 登录 [Supabase](https://supabase.com/)
   b. 创建新的项目
   c. 在项目设置中获取URL和匿名密钥
   d. 编辑 `.env.local` 文件，填入你的Supabase配置

4. 启动开发服务器
```bash
npm run dev
```

## Supabase数据库设置

在Supabase中创建以下表结构：

### words 表
- id (主键)
- word (单词)
- definition (释义)
- example (例句)
- category (分类)
- created_at (创建时间)
- user_id (用户ID)

### essays 表
- id (主键)
- title (标题)
- content (内容)
- created_at (创建时间)
- updated_at (更新时间)
- user_id (用户ID)

### good_sentences 表
- id (主键)
- sentence (句子)
- translation (翻译)
- source (来源)
- created_at (创建时间)
- user_id (用户ID)

### exams 表
- id (主键)
- title (考试名称)
- date (考试日期)
- description (描述)
- created_at (创建时间)
- user_id (用户ID)

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # Vue组件
├── config/         # 配置文件
├── views/          # 页面视图
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 功能模块

1. **单词管理**：添加、编辑、删除和查询单词
2. **作文管理**：创建、编辑和查看作文
3. **好句收藏**：记录和管理好句子
4. **考试日历**：查看和设置考试日期

## 许可证

MIT
