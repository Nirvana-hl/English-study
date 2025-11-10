<template>
  <div class="exam-calendar">
    <div class="header">
      <h2>考试日历</h2>
      <button @click="showAddForm = true" class="add-btn">添加考试</button>
    </div>
    
    <div class="calendar-container">
      <div class="month-navigator">
        <button @click="changeMonth(-1)" class="nav-btn"><<</button>
        <h3>{{ currentYear }}年{{ currentMonth + 1 }}月</h3>
        <button @click="changeMonth(1)" class="nav-btn">>></button>
      </div>
      
      <div class="calendar-grid">
        <div class="weekday-header" v-for="weekday in weekdays" :key="weekday">
          {{ weekday }}
        </div>
        <div 
          v-for="day in calendarDays" 
          :key="day.date"
          :class="['calendar-day', { 
            'other-month': !day.isCurrentMonth,
            'has-exam': day.exams.length > 0,
            'today': day.isToday
          }]"
        >
          <span class="day-number">{{ day.day }}</span>
          <div class="exam-indicators">
            <div 
              v-for="(exam, index) in day.exams.slice(0, 2)" 
              :key="exam.id"
              class="exam-indicator"
              @click="viewExam(exam)"
              :title="exam.title"
            >
              {{ exam.title.substring(0, 2) }}
            </div>
            <div 
              v-if="day.exams.length > 2" 
              class="more-indicator"
              title="还有更多考试"
            >
              +{{ day.exams.length - 2 }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="upcoming-exams">
      <h3>近期考试</h3>
      <div v-if="upcomingExams.length === 0" class="no-exams">
        近期没有安排考试
      </div>
      <div v-else class="exam-list">
        <div 
          v-for="exam in upcomingExams" 
          :key="exam.id" 
          class="exam-item"
        >
          <div class="exam-date">
            <span class="month">{{ formatExamMonth(exam.date) }}</span>
            <span class="day">{{ formatExamDay(exam.date) }}</span>
          </div>
          <div class="exam-info">
            <h4>{{ exam.title }}</h4>
            <p v-if="exam.description">{{ exam.description }}</p>
            <div class="exam-actions">
              <button @click="editExam(exam)" class="edit-btn">编辑</button>
              <button @click="deleteExam(exam.id)" class="delete-btn">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑考试表单 -->
    <div v-if="showAddForm || currentExam" class="exam-form-modal" @click.self="closeForm">
      <div class="exam-form">
        <h3>{{ currentExam ? '编辑考试' : '添加考试' }}</h3>
        <form @submit.prevent="saveExam">
          <div class="form-group">
            <label for="title">考试名称</label>
            <input 
              id="title" 
              v-model="formData.title" 
              type="text" 
              required 
              placeholder="例如：英语四级"
            />
          </div>
          <div class="form-group">
            <label for="date">考试日期</label>
            <input 
              id="date" 
              v-model="formData.date" 
              type="date" 
              required 
            />
          </div>
          <div class="form-group">
            <label for="description">描述 (可选)</label>
            <textarea 
              id="description" 
              v-model="formData.description" 
              placeholder="添加考试详情"
              rows="3"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn">保存</button>
            <button type="button" @click="closeForm" class="cancel-btn">取消</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看考试详情 -->
    <div v-if="viewingExam" class="exam-view-modal" @click.self="closeView">
      <div class="exam-view">
        <h2>{{ viewingExam.title }}</h2>
        <p class="exam-detail-date">考试日期：{{ formatFullDate(viewingExam.date) }}</p>
        <div v-if="viewingExam.description" class="exam-detail-description">
          <h4>描述：</h4>
          <p>{{ viewingExam.description }}</p>
        </div>
        <p class="exam-countdown">距考试还有：{{ getCountdown(viewingExam.date) }}</p>
        <button @click="closeView" class="close-btn">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../../supabase.js';
import dayjs from 'dayjs';

export default {
  name: 'ExamCalendar',
  data() {
    return {
      exams: [],
      currentDate: new Date(),
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      calendarDays: [],
      upcomingExams: [],
      showAddForm: false,
      currentExam: null,
      viewingExam: null,
      formData: {
        title: '',
        date: '',
        description: ''
      }
    };
  },
  mounted() {
    this.fetchExams();
    this.generateCalendar();
  },
  methods: {
    async fetchExams() {
      try {
        // 从Supabase获取考试数据
        const { data: exams, error } = await supabase.from('exams').select('*').order('date', { ascending: true });
        
        if (error) {
          console.error('Supabase错误:', error);
          // 如果获取失败，使用模拟数据
          this.exams = [
            {
              id: 1,
              title: '英语四级',
              date: dayjs().add(10, 'day').format('YYYY-MM-DD'),
              description: '大学英语四级考试',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: '英语六级',
              date: dayjs().add(30, 'day').format('YYYY-MM-DD'),
              description: '大学英语六级考试',
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              title: '英语口语考试',
              date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
              description: '英语口语水平测试',
              created_at: new Date().toISOString()
            }
          ];
          alert('从Supabase获取数据失败，正在使用示例数据');
        } else {
          this.exams = exams || [];
        }
        
        this.updateUpcomingExams();
        this.generateCalendar();
      } catch (error) {
        console.error('获取考试失败:', error);
        alert('获取考试失败');
      }
    },
    
    generateCalendar() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0);
      
      const daysInMonth = lastDay.getDate();
      const prevMonthDays = prevMonthLastDay.getDate();
      const startDayIndex = firstDay.getDay();
      
      const days = [];
      
      // 添加上个月的日期
      for (let i = startDayIndex - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const date = new Date(this.currentYear, this.currentMonth - 1, day);
        const dayExams = this.getExamsByDate(date);
        days.push({
          day,
          date: date.toISOString().split('T')[0],
          isCurrentMonth: false,
          isToday: this.isToday(date),
          exams: dayExams
        });
      }
      
      // 添加当前月的日期
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(this.currentYear, this.currentMonth, i);
        const dayExams = this.getExamsByDate(date);
        days.push({
          day: i,
          date: date.toISOString().split('T')[0],
          isCurrentMonth: true,
          isToday: this.isToday(date),
          exams: dayExams
        });
      }
      
      // 添加下个月的日期，补齐到42天（6行）
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i);
        const dayExams = this.getExamsByDate(date);
        days.push({
          day: i,
          date: date.toISOString().split('T')[0],
          isCurrentMonth: false,
          isToday: this.isToday(date),
          exams: dayExams
        });
      }
      
      this.calendarDays = days;
    },
    
    getExamsByDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      return this.exams.filter(exam => exam.date === dateStr);
    },
    
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    },
    
    changeMonth(delta) {
      this.currentMonth += delta;
      while (this.currentMonth < 0) {
        this.currentMonth += 12;
        this.currentYear -= 1;
      }
      while (this.currentMonth >= 12) {
        this.currentMonth -= 12;
        this.currentYear += 1;
      }
      this.generateCalendar();
    },
    
    updateUpcomingExams() {
      // 筛选出未来30天内的考试，并按日期排序
      const today = dayjs();
      this.upcomingExams = this.exams
        .filter(exam => {
          const examDate = dayjs(exam.date);
          return examDate.isAfter(today.subtract(1, 'day'));
        })
        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
        .slice(0, 5); // 只显示最近5个考试
    },
    
    viewExam(exam) {
      this.viewingExam = exam;
    },
    
    editExam(exam) {
      this.currentExam = exam;
      this.formData = {
        title: exam.title,
        date: exam.date,
        description: exam.description || ''
      };
    },
    
    closeForm() {
      this.showAddForm = false;
      this.currentExam = null;
      this.resetForm();
    },
    
    closeView() {
      this.viewingExam = null;
    },
    
    resetForm() {
      this.formData = {
        title: '',
        date: '',
        description: ''
      };
    },
    
    async saveExam() {
      try {
        if (this.currentExam) {
          // 编辑现有考试
          const { data, error } = await supabase.from('exams').update(this.formData).eq('id', this.currentExam.id).select();
          
          if (error) {
            console.error('更新失败:', error);
            // 如果Supabase更新失败，使用本地更新
            const index = this.exams.findIndex(e => e.id === this.currentExam.id);
            if (index !== -1) {
              this.exams[index] = { ...this.currentExam, ...this.formData };
            }
            alert('Supabase更新失败，使用本地更新');
          } else {
            // 更新本地数据
            const index = this.exams.findIndex(e => e.id === this.currentExam.id);
            if (index !== -1) {
              this.exams[index] = data[0];
            }
            alert('考试更新成功');
          }
        } else {
          // 添加新考试
          const { data, error } = await supabase.from('exams').insert({...this.formData, created_at: new Date().toISOString()}).select();
          
          if (error) {
            console.error('添加失败:', error);
            // 如果Supabase添加失败，使用本地添加
            const newExam = {
              id: Date.now(),
              ...this.formData,
              created_at: new Date().toISOString()
            };
            this.exams.push(newExam);
            alert('Supabase添加失败，使用本地添加');
          } else {
            // 添加到本地数据
            this.exams.push(data[0]);
            alert('考试添加成功');
          }
        }
        
        this.updateUpcomingExams();
        this.generateCalendar();
        this.closeForm();
      } catch (error) {
        console.error('保存考试失败:', error);
        alert('保存考试失败');
      }
    },
    
    async deleteExam(id) {
      if (!confirm('确定要删除这个考试安排吗？')) return;
      
      try {
        // 从Supabase删除
        const { error } = await supabase.from('exams').delete().eq('id', id);
        
        if (error) {
          console.error('删除失败:', error);
          // 如果Supabase删除失败，使用本地删除
          alert('Supabase删除失败，使用本地删除');
        }
        
        // 从本地数据中删除
        this.exams = this.exams.filter(exam => exam.id !== id);
        this.updateUpcomingExams();
        this.generateCalendar();
        
        alert('考试删除成功');
      } catch (error) {
        console.error('删除考试失败:', error);
        alert('删除考试失败');
      }
    },
    
    formatExamMonth(dateStr) {
      return dayjs(dateStr).format('MM月');
    },
    
    formatExamDay(dateStr) {
      return dayjs(dateStr).format('DD');
    },
    
    formatFullDate(dateStr) {
      return dayjs(dateStr).format('YYYY年MM月DD日');
    },
    
    getCountdown(dateStr) {
      const today = dayjs();
      const examDate = dayjs(dateStr);
      const diffDays = examDate.diff(today, 'day');
      
      if (diffDays < 0) return '已过期';
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '明天';
      if (diffDays === 2) return '后天';
      if (diffDays < 7) return `${diffDays}天`;
      
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      if (days === 0) return `${weeks}周`;
      return `${weeks}周${days}天`;
    }
  }
};
</script>

<style scoped>
.exam-calendar {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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

.calendar-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.month-navigator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-navigator h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.nav-btn {
  background-color: #f3f4f6;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
}

.nav-btn:hover {
  background-color: #e5e7eb;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.weekday-header {
  text-align: center;
  padding: 10px 0;
  font-weight: 600;
  color: #666;
  background-color: #f9fafb;
  border-radius: 4px;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.calendar-day:hover {
  background-color: #f9fafb;
}

.other-month {
  color: #9ca3af;
  background-color: #f9fafb;
}

.today {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.day-number {
  font-weight: 600;
  font-size: 16px;
}

.exam-indicators {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exam-indicator {
  background-color: #3b82f6;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 11px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-indicator {
  background-color: #6b7280;
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 11px;
  text-align: center;
}

.upcoming-exams {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upcoming-exams h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.no-exams {
  text-align: center;
  color: #999;
  padding: 40px;
}

.exam-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exam-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  align-items: center;
}

.exam-date {
  background-color: #3b82f6;
  color: white;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  min-width: 60px;
}

.exam-date .month {
  font-size: 12px;
  display: block;
}

.exam-date .day {
  font-size: 24px;
  font-weight: bold;
  display: block;
}

.exam-info {
  flex: 1;
}

.exam-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.exam-info p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.exam-actions {
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

/* 模态框样式 */
.exam-form-modal,
.exam-view-modal {
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

.exam-form,
.exam-view {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.exam-form h3,
.exam-view h2 {
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

.exam-detail-date {
  font-size: 16px;
  color: #3b82f6;
  margin-bottom: 15px;
}

.exam-detail-description h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.exam-countdown {
  font-size: 16px;
  color: #ef4444;
  font-weight: 600;
  margin: 20px 0;
}

.close-btn {
  display: block;
  margin-left: auto;
}
</style>