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
    let nickname = event.userA;
    if (openid === event.openidB) {//_openidA放到单引号里
        nickname = event.userB;
        openid = event.openidA;//_openidB放到单引号
    } else {
        openid = event.openidB;//_openidA放到单引号里
    }

    let date = new Date()
    const formattedDate = formatDate(date);
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid, // 发送通知给谁的openid(把上面挑好就行，这块不用动)
      data: {
        time2: { 
          value: formattedDate 
        },
        thing3: {
          value: event.taskName
        },
        thing28: {
          value: event.credit
        },
        thing4: {
          value: nickname + event.desc
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
