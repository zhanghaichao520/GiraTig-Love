Page({
  data: {
    screenWidth: 1000,
    screenHeight: 1000,

    search: "",

    allMissions: [],
    unfinishedMissions: [],
    finishedMissions: [],

    _openidA : getApp().globalData._openidA,
    _openidB : getApp().globalData._openidB,

    slideButtons: [
      {extClass: 'markBtn', text: '标记', src: "Images/icon_mark.svg"},
      {extClass: 'starBtn', text: '星标', src: "Images/icon_star.svg"},
      {extClass: 'removeBtn', text: '删除', src: 'Images/icon_del.svg'}
    ],
  },

  //页面加载时运行
  async onShow(){
    await wx.cloud.callFunction({name: 'getList', data: {list: getApp().globalData.collectionMissionList}}).then(data => {
      this.setData({allMissions: data.result.data})
      this.filterMission()
      this.getScreenSize()
    })
  },

  //获取页面大小
  async getScreenSize(){
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          screenWidth: res.windowWidth,
          screenHeight: res.windowHeight
        })
      }
    })
  },

  //转到任务详情
  async toDetailPage(element, isUpper) {
    const missionIndex = element.currentTarget.dataset.index
    const mission = isUpper ? this.data.unfinishedMissions[missionIndex] : this.data.finishedMissions[missionIndex]
    wx.navigateTo({url: '../MissionDetail/index?id=' + mission._id})
  },
  //转到任务详情[上]
  async toDetailPageUpper(element) {
    this.toDetailPage(element, true)
  },  
  //转到任务详情[下]
  async toDetailPageLower(element) {
    this.toDetailPage(element, false)
  },
  //转到添加任务
  async toAddPage() {
    wx.navigateTo({url: '../MissionAdd/index'})
  },

  //设置搜索
  onSearch(element){
    this.setData({
      search: element.detail.value
    })

    this.filterMission()
  },

  //将任务划分为：完成，未完成
  filterMission(){
    let missionList = []
    if(this.data.search != ""){
      for(let i in this.data.allMissions){
        if(this.data.allMissions[i].title.match(this.data.search) != null){
          missionList.push(this.data.allMissions[i])
        }
      }
    }else{
      missionList = this.data.allMissions
    }

    this.setData({
      unfinishedMissions: missionList.filter(item => item.available === true),
      finishedMissions: missionList.filter(item => item.available === false),
    })
  },

  //响应左划按钮事件[上]
  async slideButtonTapUpper(element) {
    this.slideButtonTap(element, true)
  },

  //响应左划按钮事件[下]
  async slideButtonTapLower(element) {
    this.slideButtonTap(element, false)
  },

  //响应左划按钮事件逻辑
  async slideButtonTap(element, isUpper){
    //得到UI序号
    const {index} = element.detail

    //根据序号获得任务
    const missionIndex = element.currentTarget.dataset.index
    const mission = isUpper === true ? this.data.unfinishedMissions[missionIndex] : this.data.finishedMissions[missionIndex]

    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {

        //处理完成点击事件
        if (index === 0) {
            if(isUpper) {
                this.finishMission(element)
            }else{
                wx.showToast({
                    title: '任务已经完成',
                    icon: 'error',
                    duration: 2000
                })
            }

        } else if(mission._openid === openid.result){
            //处理星标按钮点击事件
            if (index === 1) {
                wx.cloud.callFunction({name: 'editStar', data: {_id: mission._id, list: getApp().globalData.collectionMissionList, value: !mission.star}})
                //更新本地数据
                mission.star = !mission.star
            }
            
            //处理删除按钮点击事件
            else if (index === 2) {
                wx.cloud.callFunction({name: 'deleteElement', data: {_id: mission._id, list: getApp().globalData.collectionMissionList}})
                //更新本地数据
                if(isUpper) this.data.unfinishedMissions.splice(missionIndex, 1) 
                else this.data.finishedMissions.splice(missionIndex, 1) 
                //如果删除完所有事项，刷新数据，让页面显示无事项图片
                if (this.data.unfinishedMissions.length === 0 && this.data.finishedMissions.length === 0) {
                    this.setData({
                    allMissions: [],
                    unfinishedMissions: [],
                    finishedMissions: []
                    })
                }
                await wx.cloud.callFunction({name: 'addNews', data: {desc:"取消了任务【"+mission.title+"】，下次早点做哦！"}}).then()
            }

            //触发显示更新
            this.setData({finishedMissions: this.data.finishedMissions, unfinishedMissions: this.data.unfinishedMissions})

        //如果编辑的不是自己的任务，显示提醒
        }else{
            wx.showToast({
            title: '只能编辑自己创建的任务',
            icon: 'error',
            duration: 2000
            })
        }
    })
  },

  //发送消息
  sendSubscribeMessage(mission) {
    //调用云函数，
    wx.cloud.callFunction({
      name: 'information_general',
      //data是用来传给云函数event的数据，你可以把你当前页面获取消息填写到服务通知里面
      data: {
          action: 'sendSubscribeMessage',
          templateId: 'zp4xOBxiCDMpW7I2bWlttnR00DMpGY9AlaeFnm1cSMU',
          taskName: '叮咚～任务被做完啦！',
          desc: "完成任务【"+mission.title+"】",
          credit: "奖励 "+mission.credit + " 积分",
          openidA: getApp().globalData._openidA, 
          openidB: getApp().globalData._openidB, 
          userA: getApp().globalData.userA, 
          userB: getApp().globalData.userB, 
      },
    success: res => {
        console.warn('[云函数] [openapi] subscribeMessage.send 调用成功：', res)

        this.setData({
        subscribeMessageResult: JSON.stringify(res.result)
        })
    },
    fail: err => {
        wx.showToast({
        icon: 'none',
        title: '调用失败',
        })
        console.error('[云函数] [openapi] subscribeMessage.send 调用失败：', err)
    }
    })
},  
  //完成任务
  async finishMission(element) {
    //根据序号获得触发切换事件的待办
    const missionIndex = element.currentTarget.dataset.index
    const mission = this.data.unfinishedMissions[missionIndex]

    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {
      if(mission._openid != openid.result){
        //完成对方的任务，奖金打入自己账号
        await wx.cloud.callFunction({name: 'editAvailable', data: {_id: mission._id, value: false, list: getApp().globalData.collectionMissionList}})
        await wx.cloud.callFunction({name: 'editCredit', data: {_openid: openid.result, value: mission.credit, list: getApp().globalData.collectionUserList}})

        //触发显示更新
        mission.available = false
        this.filterMission()

        await wx.cloud.callFunction({name: 'addNews', data: {desc:"完成了任务【"+mission.title+"】, 获得奖励" + mission.credit + "积分！"}}).then()
        //显示提示
        wx.showToast({
            title: '任务完成',
            icon: 'success',
            duration: 2000
        })

      }else{
        wx.showToast({
          title: '不能完成自己的任务',
          icon: 'error',
          duration: 2000
        })
      }
    })

    await this.sendSubscribeMessage(mission);

  },
})