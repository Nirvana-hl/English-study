# 英语学习助手 - Vue + Supabase 项目

这是一个基于Vue 3和Supabase开发的英语学习助手，包含以下主要功能：

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
