'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');

//---------------------------------
// 顯示活動量分類
//---------------------------------
var searchactive = async function(user_account){
    //存放結果
    let result;  

    //讀取資料表
    await query('SELECT user_account FROM project.user WHERE user_account = $1', [user_account])
        .then((data) => {
            result = data.rows;   //查詢成功
        }, (error) => {
            result = -9;          //查詢失敗
        });

    //回傳執行結果
    return result;  
}
//---------------------------------
// 填寫活動量編號
//---------------------------------
var fillactive = async function(user_account, actno){
    //存放結果
    let result;  

    //寫入資料庫
    await query('UPDATE project.user SET actno = $2 WHERE user_account = $1', [user_account, actno])
        .then((data) => {
            result = data.rowCount;   //填寫改變的資料數
        }, (error) => {
            result = -9;  //填寫錯誤
        });

    //回傳執行結果
    return result;  
}

//-----------------------
// 匯出函式
//-----------------------
module.exports = { searchactive, fillactive };