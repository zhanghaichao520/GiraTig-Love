// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { date, content } = event;
  
  try {
    const result = await db.collection('notes').where({ date }).get();
    if (result.data.length > 0) {
      await db.collection('notes').where({ date }).update({
        data: { content }
      });
    } else {
      await db.collection('notes').add({
        data: {
          date,
          content
        }
      });
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e }
  }
}
