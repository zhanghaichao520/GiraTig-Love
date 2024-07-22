// 云函数入口文件
const cloud = require('wx-server-sdk')
// cloud.init()
cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
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

exports.main = async (event, context) => {
  try {
    console.log("Sending message with event data:", event);

    let openid = cloud.getWXContext().OPENID;  // 获取用户的openid

    if (openid === 'of-AF5ursHrLMSfnfyvvq1pt1FzI') {//_openidA放到单引号里
        openid = 'of-AF5nfMuyo0deZ8Wv3DCOdy1ao';//_openidB放到单引号
    } else {
        openid = 'of-AF5ursHrLMSfnfyvvq1pt1FzI';//_openidA放到单引号里
    }

    let taskName = '叮咚～任务更新提醒'
    let date = new Date()

    let desc = "打开小程序查看最新发布的任务内容"
    let credit = 0
    // 获取发布任务最后一条信息进行推送
    await cloud.callFunction({ name: 'getList', data: { list: 'MissionList' } }).then(res => {
        const { data } = res.result
        const task = data.filter(task => task._openid == openid)
        if (task.length) {
            taskName = task[task.length - 1].title
            // date = task[task.length - 1].date
            credit = task[task.length - 1].credit
        }
    })
    
    const formattedDate = formatDate(date);
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid, // 发送通知给谁的openid(把上面挑好就行，这块不用动)
      data: {
        time2: { 
          value: formattedDate 
        },
        thing3: {
          value: taskName
        },
        thing28: {
          value: credit
        },
        thing4: {
          value: desc
        },
      },
      
      templateId: event.templateId, // 模板ID
      miniprogramState: 'developer',
      page: 'pages/MainPage/index' // 这个是发送完服务通知用户点击消息后跳转的页面
    })
    console.log("Sending message with event data:", event);

    console.log("Message sent successfully:", result);
    return event.startdate
  } catch (err) {
    console.log("Error while sending message:", err);
    return err
  }
}
