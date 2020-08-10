'use strict';

//-----------------------
// 引用資料庫模組
//-----------------------
const {Client} = require('pg');

//-----------------------
// 自己的資料庫連結位址
//-----------------------
var pgConn = 'postgres://onrccsoncnchfn:86673f8f2c9e81d41b5cc3a9d184234e8a0faa6fdaeab292fcd09bd1804305dd@ec2-107-21-113-60.compute-1.amazonaws.com:5432/dd30j358196cbp';

//產生可同步執行query物件的函式
function query(sql, value=null) {
    return new Promise((resolve, reject) => {
        //設定資料庫連線物件
        var client = new Client({
            connectionString: pgConn,
            ssl: true
        })     

        //連結資料庫
        client.connect();

        //回覆查詢結果  
        client.query(sql, value, (err, results) => {                   
            if (err){
                reject(err);
            }else{
                resolve(results);
            }

            //關閉連線
            client.end();
        });
    });
}

//-----------------------
// 匯出函式
//-----------------------
module.exports = query;