Component({
  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    dates: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    selectedDate: '',
    visible: false,
    today: '',
    daysPast: 0,
    notes: {} // 存储备注
  },

  lifetimes: {
    attached() {
      this.setData({
        today: this.getTodayDate(),
        daysPast: this.calculateDaysPast('2024-05-12')
      });
      this.generateCalendar(this.data.year, this.data.month);
    }
  },

  methods: {
    showCalendar() {
      this.setData({ visible: true });
      this.generateCalendar(this.data.year, this.data.month);
    },

    hideCalendar() {
      this.setData({ visible: false });
    },

    prevMonth() {
      let { year, month } = this.data;
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      this.setData({ year, month });
      this.generateCalendar(year, month);
    },

    nextMonth() {
      let { year, month } = this.data;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      this.setData({ year, month });
      this.generateCalendar(year, month);
    },

    async generateCalendar(year, month) {
      const firstDay = new Date(year, month - 1, 1).getDay();
      const daysInMonth = new Date(year, month, 0).getDate();
      const dates = [];
      const today = this.getTodayDate();
      const notes = await this.loadNotes(year, month);

      let week = [];
      for (let i = 0; i < firstDay; i++) {
        week.push({ day: '', date: '' });
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        week.push({ 
          day, 
          date, 
          isToday: date === today, 
          hasNote: notes[date] !== undefined 
        });
        if (week.length === 7) {
          dates.push({ week });
          week = [];
        }
      }

      if (week.length) {
        while (week.length < 7) {
          week.push({ day: '', date: '' });
        }
        dates.push({ week });
      }

      this.setData({ dates });
    },

    selectDate(event) {
      const selectedDate = event.currentTarget.dataset.date;
      this.triggerEvent('select', { date: selectedDate, note: this.data.notes[selectedDate] });
      this.hideCalendar();
    },

    getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    },

    calculateDaysPast(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = today - date;
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },

    async loadNotes(year, month) {
      const notes = {};
      const res = await wx.cloud.callFunction({
        name: 'getNotes',
        data: {
          year,
          month
        }
      });
      res.result.data.forEach(note => {
        notes[note.date] = note.content;
      });
      this.setData({ notes });
      return notes;
    }
  }
});
