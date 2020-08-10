"use strict";

const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment'); 
const app = express()

//增加引用模組
const customer = require('./utility/customer');

//============================
// 處理各種意圖
//============================
app.post('/dialogflow', express.json(), (request, response) => {
    //回覆訊息的代理人
    const agent = new WebhookClient({request, response})

    //------------------
    // 處理歡迎意圖
    //------------------   
    function welcome(){
        //回覆文字
        agent.add('你好!!');

        agent.add('request.body:'+JSON.stringify(request.body));        
        agent.add('傳入訊息:'+request.body.queryResult.queryText);
        agent.add('action:'+request.body.queryResult.action);
        agent.add('parameters:'+request.body.queryResult.parameters);
        agent.add('userId:'+request.body.originalDetectIntentRequest.payload.data.source.userId);
        agent.add('timestamp:'+request.body.originalDetectIntentRequest.payload.data.timestamp);
    }

    //------------------
    // 處理加入會員意圖
    //------------------  
    function userJoin(){
        //回覆文字
        agent.add('歡迎你!!');

        //取得會員的LineID
        var id = request.body.originalDetectIntentRequest.payload.data.source.userId;

        //呼叫customer模組, 寫入會員資料
        return customer.add(id).then(data => {  
            if (data == -9){
                //回覆文字
                agent.add('喔, 你的會員原本就存在!');

                //加一張貼圖
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "13"
                };
                
                var payload = new Payload('LINE', lineMessage, {sendAsMessage: true});
                agent.add(payload);   
            }else if(data == 0){   
                //回覆文字            
                agent.add('會員已建立!');    
                agent.add('可填寫[姓名]及[email]收到我們的訊息!'); 
                agent.add('只要用以下格式填寫即可:'); 
                agent.add('姓名:XXX');
                agent.add('email:xxx@xxx.xxx.xxx');

                //加一張貼圖
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "5"
                };
                
                var payload = new Payload('LINE', lineMessage, {sendAsMessage: true});
                agent.add(payload);                                 
            }else{
                agent.add('會員處理發生例外問題!');
            }  
        });
    }


    //-----------------------------
    // 設定對話中各個意圖的函式對照
    //-----------------------------
    let intentMap = new Map();
    
    intentMap.set('Default Welcome Intent', welcome);  //歡迎意圖
    intentMap.set('user join', userJoin);      //加入會員意圖

    agent.handleRequest(intentMap);
})


//----------------------------------------
// 監聽3000埠號, 
// 或是監聽Heroku設定的埠號
//----------------------------------------
var server = app.listen(process.env.PORT || 3000, function() {
    const port = server.address().port;
    console.log("正在監聽埠號:", port);
});