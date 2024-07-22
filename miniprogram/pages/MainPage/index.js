/* Main page of the app */
Page({
    //允许接收服务通知
    async requestSubscribeMessage() {
        const templateId = 'zp4xOBxiCDMpW7I2bWlttnR00DMpGY9AlaeFnm1cSMU'//填入你自己想要的模板ID，记得复制粘贴全，我自己因为网页没开全，结果浪费半小时
        wx.requestSubscribeMessage({
        //tmplIds: [templateId,templateId2,templateId3],
        tmplIds: [templateId],
        success: (res) => {
            if (res[templateId] === 'accept') {
            this.setData({
                requestSubscribeMessageResult: '成功',
            })
            } else {
            this.setData({
                requestSubscribeMessageResult: `失败（${res[templateId]}）`,
            })
            }
        },
        fail: (err) => {
            this.setData({
            requestSubscribeMessageResult: `失败（${JSON.stringify(err)}）`,
            })
        },
        })
    },

    data: {
        creditA: 0,
        creditB: 0,

        userA: '',
        userB: '',


        selectedDate: '',
        showNoteInput: false,
        noteContent: ''
        
    },
    taskChanges: [], // 存储最新的任务变更记录

    
    showCalendar() {
      this.selectComponent('#calendar').showCalendar();
    },
  
    onDateSelect(event) {
      const { date, note } = event.detail;
      this.setData({ 
        selectedDate: date,
        noteContent: note || '',
        showNoteInput: true
      });
    },
  
    onNoteInput(event) {
      this.setData({ noteContent: event.detail.value });
    },
  
    hideNoteInput() {
      this.setData({ showNoteInput: false });
    },
    saveNote() {
      const { selectedDate, noteContent } = this.data;
      if (!selectedDate) {
        wx.showToast({
          title: '请选择日期',
          icon: 'none'
        });
        return;
      }
      wx.cloud.callFunction({
        name: 'saveNote',
        data: {
          date: selectedDate,
          content: noteContent
        },
        success: res => {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          this.setData({ showNoteInput: false });
          this.selectComponent('#calendar').generateCalendar(this.selectComponent('#calendar').data.year, this.selectComponent('#calendar').data.month);
        },
        fail: err => {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      });
    },
    cancelNote() { // 新增取消按钮的事件处理函数
      this.setData({ showNoteInput: false });
    },
    async onShow(){
        this.getCreditA()
        this.getCreditB()
        this.setData({
            userA: getApp().globalData.userA,
            userB: getApp().globalData.userB,
        })
        // 读取新闻
        wx.cloud.callFunction({name: 'getNewsByOpenId'}).then(res => {
          const taskChanges = res.result.data.map(item => {
            let nickname = getApp().globalData.userA
            if(item._openid === getApp().globalData._openidB) {
                nickname = getApp().globalData.userB
            }
            return `${formatDate(new Date(item.date))}: ${nickname}${item.desc}`;
          });
          this.setData({taskChanges});
          
        })
        
    },

    
    getCreditA(){
        wx.cloud.callFunction({name: 'getElementByOpenId', data: {list: getApp().globalData.collectionUserList, _openid: getApp().globalData._openidA}})
        .then(res => {
          this.setData({creditA: res.result.data[0].credit})
        })
    },
    
    getCreditB(){
        wx.cloud.callFunction({name: 'getElementByOpenId', data: {list: getApp().globalData.collectionUserList, _openid: getApp().globalData._openidB}})
        .then(res => {
            this.setData({creditB: res.result.data[0].credit})
        })
    },
})

// 获取当前时间并格式化
function formatDate(date) {
  const year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let hour = ("0" + date.getHours()).slice(-2);
  let minute = ("0" + date.getMinutes()).slice(-2);
  let second = ("0" + date.getSeconds()).slice(-2);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}