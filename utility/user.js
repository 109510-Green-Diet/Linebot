'use strict';

//引用操作資料庫的物件
const sql = require('./asyncDB');

//---------------------------------
// 加入會員 (寫id到user資料表)
//---------------------------------
var add = async function(newData){
    //存放結果
    var result;  

    //寫入資料表
    await sql('INSERT INTO project.user (user_account) VALUES ($1)', [newData.user_account])
        .then((data) => {
            result = 0;   //寫入成功
        }, (error) => {
            result = -9;  //寫入錯誤
        });

    //回傳執行結果
    return result;  
}

//-----------------------
// 匯出函式
//-----------------------
module.exports = {add};