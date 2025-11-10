-- 创建单词表 (words)
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL,
  translation VARCHAR(200) NOT NULL,
  part_of_speech VARCHAR(50),
  pronunciation VARCHAR(100),
  example VARCHAR(500),
  notes TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建作文表 (essays)
CREATE TABLE IF NOT EXISTS essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建好句收藏表 (good_sentences)
CREATE TABLE IF NOT EXISTS good_sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentence TEXT NOT NULL,
  translation TEXT,
  source VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建考试日历表 (exams)
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为words表添加更新时间触发器
CREATE TRIGGER update_words_modtime
BEFORE UPDATE ON words
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 为essays表添加更新时间触发器
CREATE TRIGGER update_essays_modtime
BEFORE UPDATE ON essays
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 添加一些基础索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_essays_title ON essays(title);
CREATE INDEX IF NOT EXISTS idx_essays_category ON essays(category);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date);

-- 插入一些示例数据
INSERT INTO words (word, translation, part_of_speech, example)
VALUES 
('diligent', '勤奋的', 'adjective', 'He is a diligent student.'),
('perseverance', '毅力', 'noun', 'Perseverance leads to success.'),
('vocabulary', '词汇量', 'noun', 'Reading books helps expand your vocabulary.')
ON CONFLICT DO NOTHING;

INSERT INTO good_sentences (sentence, translation, source)
VALUES 
('The early bird catches the worm.', '早起的鸟儿有虫吃。', '谚语'),
('Where there is a will, there is a way.', '有志者事竟成。', '谚语'),
('Practice makes perfect.', '熟能生巧。', '谚语')
ON CONFLICT DO NOTHING;

-- 显示创建的表信息
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;