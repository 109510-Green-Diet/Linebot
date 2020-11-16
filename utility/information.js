'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');

//---------------------------------
// 營養分析
//---------------------------------
var BMIcal = async function (user_account) {
    //存放結果
    let result;

    //讀取資料表
    await query('SELECT a.user_account, a.height, a.weight, a.infono, b.actno FROM project.information a, project.user b WHERE a.user_account = $1 order by a.infono desc', [user_account])
        .then((data) => {
            result = data.rows;   //查詢成功
        }, (error) => {
            result = -9;          //查詢失敗
        });

    //回傳執行結果
    return result;
}

//---------------------------------
// 填寫會員姓名
//---------------------------------
var fillheight = async function(user_account, height, weight, infono){
    //存放結果
    let result;  
    console.log(user_account);
    //寫入點餐資料表
    await query('INSERT INTO project.information (user_account, height, weight, infono) VALUES ($1, $2, $3, $4)', [user_account, height, weight, infono])
        .then((data) => {
            result = 0;    //新增成功
        }, (error) => {
            result = -9;   //新增失敗
        });

    //回傳執行結果
    return result;  
}

//-----------------------
// 匯出函式
//-----------------------
module.exports = { BMIcal, fillheight };