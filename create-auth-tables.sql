-- 创建用户表（与Supabase认证系统配合使用）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为profiles表添加更新触发器
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加唯一索引，确保用户名和邮箱的唯一性
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 为认证用户授予适当的权限
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略，允许用户只能访问和修改自己的个人资料
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 允许新用户插入自己的个人资料
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 允许用户删除自己的个人资料
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 启用profiles表的RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 授予authenticated角色对profiles表的访问权限
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;