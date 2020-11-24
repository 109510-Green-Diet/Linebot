'use strict';

//引用操作資料庫的物件
const query = require('./asyncDB');

//-------------------
// 查看食譜分類
//-------------------
var showrecipe = async function(recipe_name){
    
    //存放結果
    let result;  
    recipe_name = "%" + recipe_name + "%";

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
// 查看食譜內容
//-------------------
var findrecipe = async function(recipe_name){
    
    //存放結果
    let result;  
    //讀取資料庫
    await query('SELECT a.recipe_name, a.rc_content, a.grains_portion, a.vegetables_portion, a.bean_portion, a.dairy_portion, a.fruit_portion, a.fats_portion, a.recipeno, b.foodno, b.gram, c.food_name FROM project.recipe as a join project.record_food as b on a.recipeno = b.recipeno join project.food as c on c.foodno = b.foodno WHERE recipe_name = $1', [recipe_name])
        .then((data) => {
            result = data.rows;   //查詢成功
            console.log(data.rows)
        }, (error) => {
            result = -9;          //查詢失敗
        });

    //回傳執行結果
    return result;  
}

//-------------------
// 查看分類菜單
//-------------------
var recrecipe = async function (user_account) {

    //存放結果
    let result;
    console.log("aaa")
    let bmino2;
    //讀取資料庫

    await query('SELECT bmino FROM project.information WHERE user_account = $1 order by infono desc limit 1', [user_account])
        .then((data) => {
            bmino2 = data.rows[0].bmino;  //查詢成功
            console.log("1234")
            console.log(bmino2);
        }, (error) => {
            result = -9;          //查詢失敗
        });

    console.log(bmino2);
    await query('SELECT * FROM project.recipe WHERE bmino = $1 order by random() limit 10', [bmino2])
    .then((data) => {
        result = data.rows;
        console.log("5678")
        //console.log(bmino);
    }, (error) => {
        result = -9;          //查詢失敗
    });

    //回傳執行結果
    return result;
}

//-----------------------
// 匯出函式
//-----------------------
module.exports = {showrecipe, findrecipe, recrecipe};