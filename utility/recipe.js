'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');

//-------------------
// 查看分類菜單
//-------------------
var showrecipe = async function(recipe_name){
    
    //存放結果
    let result;  
    recipe_name = "%" + recipe_name + "%";
    console.log(recipe_name);
    //讀取資料庫
    await query('SELECT * FROM project.recipe WHERE recipe_name like $1 order by random() limit 10', [recipe_name])
        .then((data) => {
            console.log(data.rows);
            result = data.rows;   //查詢成功
        }, (error) => {
            result = -9;          //查詢失敗
        });

    //回傳執行結果
    return result;  
}

//-------------------
// 查看分類菜單
//-------------------
var findrecipe = async function(recipe_name){
    
    //存放結果
    let result;  
    //讀取資料庫
    await query('SELECT * FROM project.recipe WHERE recipe_name = $1', [recipe_name])
        .then((data) => {
            result = data.rows;   //查詢成功
        }, (error) => {
            result = -9;          //查詢失敗
        });

    //回傳執行結果
    return result;  
}

//-----------------------
// 匯出函式
//-----------------------
module.exports = {showrecipe, findrecipe};