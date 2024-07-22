// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { year, month } = event;
  const startDate = `${year}-${month < 10 ? '0' + month : month}-01`;
  const endDate = `${year}-${month < 10 ? '0' + month : month}-31`;
  
  try {
    const result = await db.collection('notes')
      .where({
        date: db.command.gte(startDate).and(db.command.lte(endDate))
      })
      .get();
    return { success: true, data: result.data };
  } catch (e) {
    return { success: false, error: e }
  }
}
