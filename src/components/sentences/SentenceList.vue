<template>
  <div class="sentence-list">
    <div class="header">
      <h2>好句收藏夹</h2>
      <button @click="showAddForm = true" class="add-btn">添加好句</button>
    </div>
    
    <div class="search">
      <input 
        v-model="searchQuery" 
        @input="filterSentences"
        placeholder="搜索句子或翻译..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="filteredSentences.length === 0" class="empty">
      {{ searchQuery ? '没有找到匹配的句子' : '还没有收藏任何好句，快来添加吧！' }}
    </div>
    <div v-else class="sentence-items">
      <div 
        v-for="sentence in filteredSentences" 
        :key="sentence.id" 
        class="sentence-item"
      >
        <div class="sentence-content">
            <blockquote>{{ sentence.sentence }}</blockquote>
            <p class="translation">{{ sentence.translation }}</p>
            <p class="source" v-if="sentence.source"><strong>来源：</strong>{{ sentence.source }}</p>
            <div class="sentence-actions">
              <button @click="editSentence(sentence)" class="edit-btn">编辑</button>
              <button @click="deleteSentence(sentence.id)" class="delete-btn">删除</button>
            </div>
          </div>
          <p class="created-at"><small>{{ formatDate(sentence.created_at) }}</small></p>
      </div>
    </div>

    <!-- 添加/编辑好句表单 -->
    <div v-if="showAddForm || currentSentence" class="sentence-form-modal" @click.self="closeForm">
      <div class="sentence-form">
        <h3>{{ currentSentence ? '编辑好句' : '添加好句' }}</h3>
        <form @submit.prevent="saveSentence">
          <div class="form-group">
            <label for="sentence">英语句子</label>
            <textarea 
              id="sentence" 
              v-model="formData.sentence" 
              required 
              placeholder="请输入英语句子"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="translation">中文翻译</label>
            <textarea 
              id="translation" 
              v-model="formData.translation" 
              required 
              placeholder="请输入中文翻译"
              rows="2"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="source">来源 (可选)</label>
            <input 
              id="source" 
              v-model="formData.source" 
              type="text" 
              placeholder="例如：电影、书籍、演讲等"
            />
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
  name: 'SentenceList',
  data() {
    return {
      sentences: [],
      searchQuery: '',
      filteredSentences: [],
      showAddForm: false,
      currentSentence: null,
      formData: {
        sentence: '',
        translation: '',
        source: ''
      },
      loading: false
    };
  },
  mounted() {
    this.fetchSentences();
  },
  methods: {
    async fetchSentences() {
      this.loading = true;
      try {
        // 从Supabase获取句子数据
        const { data: sentences, error } = await supabase.from('good_sentences').select('*').order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase错误:', error);
          // 如果获取失败，使用模拟数据
          this.sentences = [
            {
              id: 1,
              sentence: 'The early bird catches the worm.',
              translation: '早起的鸟儿有虫吃。',
              source: '谚语',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              sentence: 'Where there is a will, there is a way.',
              translation: '有志者事竟成。',
              source: '谚语',
              created_at: new Date().toISOString()
            }
          ];
          alert('从Supabase获取数据失败，正在使用示例数据');
        } else {
          this.sentences = sentences || [];
        }
        
        this.filteredSentences = [...this.sentences];
      } catch (error) {
        console.error('获取好句失败:', error);
        alert('获取好句失败');
      } finally {
        this.loading = false;
      }
    },
    
    filterSentences() {
      const query = this.searchQuery.toLowerCase();
      this.filteredSentences = this.sentences.filter(sentence => 
        sentence.sentence.toLowerCase().includes(query) ||
        sentence.translation.toLowerCase().includes(query) ||
        (sentence.source && sentence.source.toLowerCase().includes(query))
      );
    },
    
    editSentence(sentence) {
      this.currentSentence = sentence;
      this.formData = {
        sentence: sentence.sentence,
        translation: sentence.translation,
        source: sentence.source || ''
      };
    },
    
    closeForm() {
      this.showAddForm = false;
      this.currentSentence = null;
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        sentence: '',
        translation: '',
        source: ''
      };
    },
    
    async saveSentence() {
      try {
        if (this.currentSentence) {
          // 编辑现有句子
          const { data, error } = await supabase.from('good_sentences').update(this.formData).eq('id', this.currentSentence.id).select();
          
          if (error) {
            console.error('更新失败:', error);
            // 如果Supabase更新失败，使用本地更新
            const index = this.sentences.findIndex(s => s.id === this.currentSentence.id);
            if (index !== -1) {
              this.sentences[index] = { ...this.currentSentence, ...this.formData };
            }
            alert('Supabase更新失败，使用本地更新');
          } else {
            // 更新本地数据
            const index = this.sentences.findIndex(s => s.id === this.currentSentence.id);
            if (index !== -1) {
              this.sentences[index] = data[0];
            }
            alert('好句更新成功');
          }
        } else {
          // 添加新句子
          const { data, error } = await supabase.from('good_sentences').insert(this.formData).select();
          
          if (error) {
            console.error('添加失败:', error);
            // 如果Supabase添加失败，使用本地添加
            const newSentence = {
              id: Date.now(),
              ...this.formData,
              created_at: new Date().toISOString()
            };
            this.sentences.unshift(newSentence);
            alert('Supabase添加失败，使用本地添加');
          } else {
            // 添加到本地数据
            this.sentences.unshift(data[0]);
            alert('好句添加成功');
          }
        }
        
        this.filterSentences();
        this.closeForm();
      } catch (error) {
        console.error('保存好句失败:', error);
        alert('保存好句失败');
      }
    },
    
    async deleteSentence(id) {
      if (!confirm('确定要删除这个句子吗？')) return;
      
      try {
        // 从Supabase删除
        const { error } = await supabase.from('good_sentences').delete().eq('id', id);
        
        if (error) {
          console.error('删除失败:', error);
          // 如果Supabase删除失败，使用本地删除
          alert('Supabase删除失败，使用本地删除');
        }
        
        // 从本地数据中删除
        this.sentences = this.sentences.filter(sentence => sentence.id !== id);
        this.filterSentences();
        
        alert('好句删除成功');
      } catch (error) {
        console.error('删除好句失败:', error);
        alert('删除好句失败');
      }
    },
    
    formatDate(dateString) {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    }
  }
};
</script>

<style scoped>
.sentence-list {
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
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
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

.sentence-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sentence-item {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.sentence-content {
  position: relative;
}

blockquote {
  margin: 0 0 15px 0;
  padding: 0 0 0 15px;
  border-left: 4px solid #3b82f6;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  font-style: italic;
}

.translation {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 15px;
  line-height: 1.5;
}

.source {
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #666;
}

.sentence-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  position: absolute;
  top: 20px;
  right: 20px;
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

.created-at {
  text-align: right;
  margin: 0;
  font-size: 12px;
  color: #999;
}

/* 表单样式 */
.sentence-form-modal {
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

.sentence-form {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sentence-form h3 {
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
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
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