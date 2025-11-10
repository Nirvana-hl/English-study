<template>
  <div class="essay-list">
    <div class="header">
      <h2>我的备考作文</h2>
      <button @click="showAddForm = true" class="add-btn">新建作文</button>
    </div>
    
    <div class="search">
      <input 
        v-model="searchQuery" 
        @input="filterEssays"
        placeholder="搜索作文标题..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="filteredEssays.length === 0" class="empty">
      {{ searchQuery ? '没有找到匹配的作文' : '还没有创建任何作文，快来写一篇吧！' }}
    </div>
    <div v-else class="essay-items">
      <div 
        v-for="essay in filteredEssays" 
        :key="essay.id" 
        class="essay-item"
      >
        <div class="essay-header">
          <h3>{{ essay.title }}</h3>
          <div class="essay-actions">
            <button @click="viewEssay(essay)" class="view-btn">查看</button>
            <button @click="editEssay(essay)" class="edit-btn">编辑</button>
            <button @click="deleteEssay(essay.id)" class="delete-btn">删除</button>
          </div>
        </div>
        <div class="essay-meta">
          <span class="created-at">创建: {{ formatDate(essay.created_at) }}</span>
          <span class="updated-at" v-if="essay.updated_at">更新: {{ formatDate(essay.updated_at) }}</span>
        </div>
        <p class="essay-preview">{{ getContentPreview(essay.content) }}</p>
      </div>
    </div>

    <!-- 添加/编辑作文表单 -->
    <div v-if="showAddForm || currentEssay" class="essay-form-modal" @click.self="closeForm">
      <div class="essay-form">
        <h3>{{ currentEssay ? '编辑作文' : '新建作文' }}</h3>
        <form @submit.prevent="saveEssay">
          <div class="form-group">
            <label for="title">标题</label>
            <input 
              id="title" 
              v-model="formData.title" 
              type="text" 
              required 
              placeholder="请输入作文标题"
            />
          </div>
          <div class="form-group">
            <label for="content">作文内容</label>
            <textarea 
              id="content" 
              v-model="formData.content" 
              required 
              placeholder="请输入作文内容"
              rows="10"
              class="content-textarea"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn">保存</button>
            <button type="button" @click="closeForm" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看作文详情 -->
    <div v-if="viewingEssay" class="essay-view-modal" @click.self="closeView">
      <div class="essay-view">
        <h2>{{ viewingEssay.title }}</h2>
        <div class="view-meta">
          <span>创建: {{ formatDate(viewingEssay.created_at) }}</span>
          <span v-if="viewingEssay.updated_at">更新: {{ formatDate(viewingEssay.updated_at) }}</span>
        </div>
        <div class="view-content">
          {{ viewingEssay.content }}
        </div>
        <button @click="closeView" class="close-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../../config/supabase';
import dayjs from 'dayjs';

export default {
  name: 'EssayList',
  data() {
    return {
      essays: [],
      searchQuery: '',
      filteredEssays: [],
      showAddForm: false,
      currentEssay: null,
      viewingEssay: null,
      formData: {
        title: '',
        content: ''
      },
      loading: false
    };
  },
  mounted() {
    this.fetchEssays();
  },
  methods: {
    async fetchEssays() {
      this.loading = true;
      try {
        // 从Supabase获取作文数据
        const { data: essays, error } = await supabase.from('essays').select('*').order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase错误:', error);
          // 如果获取失败，使用模拟数据
          this.essays = [
            {
              id: 1,
              title: 'My Dream Job',
              content: 'I want to be a software engineer in the future. Software engineering is a challenging and rewarding field that combines creativity with technical skills...',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              title: 'Environmental Protection',
              content: 'Environmental protection is becoming more and more important in today\'s world. We should take actions to protect our planet...',
              created_at: new Date().toISOString(),
              updated_at: null
            }
          ];
          alert('从Supabase获取数据失败，正在使用示例数据');
        } else {
          this.essays = essays || [];
        }
        
        this.filteredEssays = [...this.essays];
      } catch (error) {
        console.error('获取作文失败:', error);
        alert('获取作文失败');
      } finally {
        this.loading = false;
      }
    },
    
    filterEssays() {
      this.filteredEssays = this.essays.filter(essay => 
        essay.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    
    editEssay(essay) {
      this.currentEssay = essay;
      this.formData = {
        title: essay.title,
        content: essay.content
      };
    },
    
    viewEssay(essay) {
      this.viewingEssay = essay;
    },
    
    closeForm() {
      this.showAddForm = false;
      this.currentEssay = null;
      this.resetForm();
    },
    
    closeView() {
      this.viewingEssay = null;
    },
    
    resetForm() {
      this.formData = {
        title: '',
        content: ''
      };
    },
    
    async saveEssay() {
      try {
        if (this.currentEssay) {
          // 编辑现有作文
          const updateData = { 
            ...this.formData, 
            updated_at: new Date().toISOString() 
          };
          const { data, error } = await supabase.from('essays').update(updateData).eq('id', this.currentEssay.id).select();
          
          if (error) {
            console.error('更新失败:', error);
            // 如果Supabase更新失败，使用本地更新
            const index = this.essays.findIndex(e => e.id === this.currentEssay.id);
            if (index !== -1) {
              this.essays[index] = { 
                ...this.currentEssay, 
                ...this.formData,
                updated_at: new Date().toISOString()
              };
            }
            alert('Supabase更新失败，使用本地更新');
          } else {
            // 更新本地数据
            const index = this.essays.findIndex(e => e.id === this.currentEssay.id);
            if (index !== -1) {
              this.essays[index] = data[0];
            }
            alert('作文更新成功');
          }
        } else {
          // 添加新作文
          const insertData = { 
            ...this.formData,
            created_at: new Date().toISOString()
          };
          const { data, error } = await supabase.from('essays').insert(insertData).select();
          
          if (error) {
            console.error('添加失败:', error);
            // 如果Supabase添加失败，使用本地添加
            const newEssay = {
              id: Date.now(),
              ...this.formData,
              created_at: new Date().toISOString(),
              updated_at: null
            };
            this.essays.unshift(newEssay);
            alert('Supabase添加失败，使用本地添加');
          } else {
            // 添加到本地数据
            this.essays.unshift(data[0]);
            alert('作文创建成功');
          }
        }
        
        this.filterEssays();
        this.closeForm();
      } catch (error) {
        console.error('保存作文失败:', error);
        alert('保存作文失败');
      }
    },
    
    async deleteEssay(id) {
      if (!confirm('确定要删除这篇作文吗？')) return;
      
      try {
        // 从Supabase删除
        const { error } = await supabase.from('essays').delete().eq('id', id);
        
        if (error) {
          console.error('删除失败:', error);
          // 如果Supabase删除失败，使用本地删除
          alert('Supabase删除失败，使用本地删除');
        }
        
        // 从本地数据中删除
        this.essays = this.essays.filter(essay => essay.id !== id);
        this.filterEssays();
        
        alert('作文删除成功');
      } catch (error) {
        console.error('删除作文失败:', error);
        alert('删除作文失败');
      }
    },
    
    getContentPreview(content) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    },
    
    formatDate(dateString) {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    }
  }
};
</script>

<style scoped>
.essay-list {
  max-width: 900px;
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

.essay-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.essay-item {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.essay-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.essay-header h3 {
  margin: 0;
  color: #2563eb;
  font-size: 18px;
  flex: 1;
}

.essay-actions {
  display: flex;
  gap: 8px;
}

.view-btn,
.edit-btn,
.delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.view-btn {
  background-color: #10b981;
  color: white;
}

.edit-btn {
  background-color: #f59e0b;
  color: white;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.essay-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #666;
}

.essay-preview {
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

/* 表单样式 */
.essay-form-modal,
.essay-view-modal {
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
  overflow-y: auto;
}

.essay-form,
.essay-view {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
}

.essay-form h3,
.essay-view h2 {
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
.content-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.content-textarea {
  resize: vertical;
  min-height: 300px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn,
.cancel-btn,
.close-btn {
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

.cancel-btn,
.close-btn {
  background-color: #6b7280;
  color: white;
}

.view-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #666;
}

.view-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.close-btn {
  display: block;
  margin-left: auto;
}
</style>