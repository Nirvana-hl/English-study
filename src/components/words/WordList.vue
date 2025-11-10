<template>
  <div class="word-list">
    <div class="header">
      <h2>我的单词本</h2>
      <button @click="showAddForm = true" class="add-btn">添加单词</button>
    </div>
    
    <div class="search">
      <input 
        v-model="searchQuery" 
        @input="filterWords"
        placeholder="搜索单词..."
        class="search-input"
      />
      <select v-model="filterCategory" @change="filterWords" class="category-select">
        <option value="">全部分类</option>
        <option value="CET4">四级词汇</option>
        <option value="CET6">六级词汇</option>
        <option value="考研">考研词汇</option>
        <option value="其他">其他</option>
      </select>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="filteredWords.length === 0" class="empty">
      {{ searchQuery || filterCategory ? '没有找到匹配的单词' : '单词本还是空的，快来添加单词吧！' }}
    </div>
    
    <div v-else class="word-items">
      <div 
        v-for="word in filteredWords" 
        :key="word.id" 
        class="word-item"
      >
        <div class="word-header">
          <h3>{{ word.word }}</h3>
          <div class="word-actions">
            <button @click="editWord(word)" class="edit-btn">编辑</button>
            <button @click="deleteWord(word.id)" class="delete-btn">删除</button>
          </div>
        </div>
        <div class="word-content">
          <p class="definition"><strong>释义：</strong>{{ word.translation }}</p>
          <p class="example" v-if="word.example"><strong>例句：</strong>{{ word.example }}</p>
          <p class="category"><strong>分类：</strong>{{ word.category || '未分类' }}</p>
          <p class="created-at"><small>{{ formatDate(word.created_at) }}</small></p>
        </div>
      </div>
    </div>

    <!-- 添加/编辑单词表单 -->
    <div v-if="showAddForm || currentWord" class="word-form-modal" @click.self="closeForm">
      <div class="word-form">
        <h3>{{ currentWord ? '编辑单词' : '添加新单词' }}</h3>
        <form @submit.prevent="saveWord">
          <div class="form-group">
            <label for="word">单词</label>
            <input 
              id="word" 
              v-model="formData.word" 
              type="text" 
              required 
              placeholder="请输入单词"
            />
          </div>
          <div class="form-group">
            <label for="translation">释义</label>
            <textarea 
              id="translation" 
              v-model="formData.translation" 
              required 
              placeholder="请输入释义"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="example">例句 (可选)</label>
            <textarea 
              id="example" 
              v-model="formData.example" 
              placeholder="请输入例句"
              rows="2"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="category">分类</label>
            <select id="category" v-model="formData.category">
              <option value="CET4">四级词汇</option>
              <option value="CET6">六级词汇</option>
              <option value="考研">考研词汇</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn">保存</button>
            <button type="button" @click="closeForm" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../../supabase.js';
import dayjs from 'dayjs';

export default {
  name: 'WordList',
  data() {
    return {
      words: [],
      searchQuery: '',
      filterCategory: '',
      filteredWords: [],
      showAddForm: false,
      currentWord: null,
      formData: {
        word: '',
        translation: '',
        example: '',
        category: '其他'
      },
      loading: false
    };
  },
  mounted() {
    this.fetchWords();
  },
  methods: {
    async fetchWords() {
      this.loading = true;
      try {
        // 从Supabase获取单词数据
        const { data: words, error } = await supabase.from('words').select('*').order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase错误:', error);
          // 如果获取失败，使用模拟数据
          this.words = [
            {
              id: 1,
              word: 'diligent',
              translation: '勤奋的，勤勉的',
              example: 'He is a diligent student who always works hard.',
              category: 'CET4',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              word: 'perseverance',
              translation: '毅力，坚持',
              example: 'Success comes from perseverance.',
              category: 'CET6',
              created_at: new Date().toISOString()
            }
          ];
          alert('从Supabase获取数据失败，正在使用示例数据');
        } else {
          this.words = words || [];
        }
        
        this.filteredWords = [...this.words];
      } catch (error) {
        console.error('获取单词失败:', error);
        alert('获取单词失败');
      } finally {
        this.loading = false;
      }
    },
    
    filterWords() {
      this.filteredWords = this.words.filter(word => {
        const matchesQuery = word.word.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           word.definition.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = !this.filterCategory || word.category === this.filterCategory;
        return matchesQuery && matchesCategory;
      });
    },
    
    editWord(word) {
      this.currentWord = word;
      this.formData = {
        word: word.word,
        translation: word.translation,
        example: word.example || '',
        category: word.category || '其他'
      };
    },
    
    closeForm() {
      this.showAddForm = false;
      this.currentWord = null;
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        word: '',
        translation: '',
        example: '',
        category: '其他'
      };
    },
    
    async saveWord() {
      try {
        if (this.currentWord) {
          // 编辑现有单词
          const { data, error } = await supabase.from('words').update(this.formData).eq('id', this.currentWord.id).select();
          
          if (error) {
            console.error('更新失败:', error);
            // 如果Supabase更新失败，使用本地更新
            const index = this.words.findIndex(w => w.id === this.currentWord.id);
            if (index !== -1) {
              this.words[index] = { ...this.currentWord, ...this.formData };
            }
            alert('Supabase更新失败，使用本地更新');
          } else {
            // 更新本地数据
            const index = this.words.findIndex(w => w.id === this.currentWord.id);
            if (index !== -1) {
              this.words[index] = data[0];
            }
            alert('单词更新成功');
          }
        } else {
          // 添加新单词
          const { data, error } = await supabase.from('words').insert(this.formData).select();
          
          if (error) {
            console.error('添加失败:', error);
            // 如果Supabase添加失败，使用本地添加
            const newWord = {
              id: Date.now(),
              ...this.formData,
              created_at: new Date().toISOString()
            };
            this.words.unshift(newWord);
            alert('Supabase添加失败，使用本地添加');
          } else {
            // 添加到本地数据
            this.words.unshift(data[0]);
            alert('单词添加成功');
          }
        }
        
        this.filterWords();
        this.closeForm();
      } catch (error) {
        console.error('保存单词失败:', error);
        alert('保存单词失败');
      }
    },
    
    async deleteWord(id) {
      if (!confirm('确定要删除这个单词吗？')) return;
      
      try {
        // 从Supabase删除
        const { error } = await supabase.from('words').delete().eq('id', id);
        
        if (error) {
          console.error('删除失败:', error);
          // 如果Supabase删除失败，使用本地删除
          alert('Supabase删除失败，使用本地删除');
        }
        
        // 从本地数据中删除
        this.words = this.words.filter(word => word.id !== id);
        this.filterWords();
        
        alert('单词删除成功');
      } catch (error) {
        console.error('删除单词失败:', error);
        alert('删除单词失败');
      }
    },
    
    formatDate(dateString) {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    }
  }
};
</script>

<style scoped>
.word-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.add-btn {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background-color: #2563eb;
}

.search {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.category-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.word-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.word-item {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.word-header h3 {
  margin: 0;
  color: #2563eb;
  font-size: 20px;
}

.word-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background-color: #f59e0b;
  color: white;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.word-content p {
  margin: 5px 0;
  font-size: 14px;
}

.definition {
  color: #333;
}

.example {
  color: #555;
  font-style: italic;
  background-color: #f9fafb;
  padding: 8px;
  border-radius: 4px;
}

.category {
  color: #666;
}

.created-at {
  color: #999;
}

/* 表单样式 */
.word-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.word-form {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.word-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background-color: #10b981;
  color: white;
}

.cancel-btn {
  background-color: #6b7280;
  color: white;
}
</style>