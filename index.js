"use strict";

const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const { Text, Card, Image, Suggestion, Payload } = require('dialogflow-fulfillment');
const app = express()

//增加引用模組
const user = require('./utility/user');
const recipe = require('./utility/recipe');

//============================
// 處理各種意圖
//============================
app.post('/dialogflow', express.json(), (request, response) => {
    //回覆訊息的代理人
    const agent = new WebhookClient({ request, response })


    //------------------
    // 處理歡迎意圖
    //------------------   
    function welcome() {
        //回覆文字
        agent.add('你好!!');

        agent.add('request.body:' + JSON.stringify(request.body));
        agent.add('傳入訊息:' + request.body.queryResult.queryText);
        agent.add('action:' + request.body.queryResult.action);
        agent.add('parameters:' + request.body.queryResult.parameters);
        agent.add('userId:' + request.body.originalDetectIntentRequest.payload.data.source.userId);
        agent.add('timestamp:' + request.body.originalDetectIntentRequest.payload.data.timestamp);
    }

    //------------------
    // 處理加入會員意圖
    //------------------  
    function userJoin() {
        //回覆文字
        agent.add('歡迎你!!!');

        //取得會員的LineID
        var user_account = request.body.originalDetectIntentRequest.payload.data.source.userId;

        //呼叫user模組, 寫入會員資料
        return user.add(user_account).then(data => {
            if (data == -9) {
                //回覆文字
                agent.add('喔, 你的會員原本就存在!');

                //加一張貼圖
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "13"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else if (data == 0) {
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

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                agent.add('會員處理發生例外問題!');
            }
        });
    }


    //----------------------- 
    // 處理查看分類菜單意圖
    //-----------------------     
    function showrecipe() {
        //取得分類
        var recipe_name = request.body.queryResult.parameters.recipe_name;

        //回覆文字
        agent.add('查看的食譜是:' + recipe_name);

        //呼叫menu模組, 取出分類菜單
        return recipe.showrecipe(recipe_name).then(data => {
            //console.log(data);
            if (data == -9) {
                console.log('data == -9');
                //回覆文字            
                agent.add('喔, 讀取資料錯誤(程式或資料庫出錯)!');
            } else if (data.length == 0) {
                console.log('data.length == 0');
                //回覆文字              
                agent.add('喔, 目前沒有內容!');

                //回覆貼圖   
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "3"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                console.log('data.length');
                console.log(data.length);
                var cs = []

                //回覆圖文選單 
                for (var i = 0; i < data.length; i++) {
                    cs.push({
                        "thumbnailImageUrl": "https://localhost:3000/public/pic" + data[i].pic,
                        "imageBackgroundColor": "#FFFFFF",
                        "title": data[i].recipe_name,
                        "text": "全榖雜糧類:" + data[i].grains_portion + "份" + "\n" + "蔬菜類:" + data[i].vegetables_portion + "份" + "\n" + "豆魚蛋肉類:" + data[i].meatsandprotein_portion + "份" + "\n" + "乳品類:" + data[i].dairy_portion + "份" + "\n" + "水果類:" + data[i].fruit_portion + "份" + "\n" + "油脂與堅果種子類:" + data[i].fats_portion + "份",
                        "actions": [{
                            "type": "message",
                            "label": "查看食譜",
                            "text": "查看" + data[i].recipe_name + "完整食譜"

                        }]
                    })
                }

                console.log(cs);
                var lineMessage = {
                    "type": "template",
                    "altText": "這是一個Carousel圖文選單樣板",
                    "template": {
                        "type": "carousel",
                        "columns": cs,
                        "imageAspectRatio": "square",
                        "imageSize": "cover"
                    }
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            }
        });
    }

    //-----------------------
    // 顯示食譜
    //-----------------------     
    function findrecipe() {
        //取得分類
        var recipe_name = request.body.queryResult.parameters.recipe_name;

        return recipe.findrecipe(recipe_name).then(data => {
            if (data == -9) {
                //回覆文字            
                agent.add('喔, 讀取資料錯誤(程式或資料庫出錯)!');
            } else if (data.length == 0) {
                //回覆文字              
                agent.add('喔, 目前沒有內容!');

                //回覆貼圖   
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "3"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                var grains_portion = data[0].grains_portion;
                var vegetables_portion = data[0].vegetables_portion;
                var meatsandprotein_portion = data[0].meatsandprotein_portion;
                var dairy_portion = data[0].dairy_portion;
                var fruit_portion = data[0].fruit_portion;
                var fats_portion = data[0].fats_portion;
                var seasoning_use = data[0].seasoning_use;
                var rc_content = data[0].rc_content;
                //回覆文字
                /*
                agent.add('查看的食譜是:' + re_title);
                agent.add('營養標示:' + "\n" + '全榖雜糧類:' + grains_portion + '份' + '\n' + '蔬菜類:' + vegetables_portion + '份' + '\n' + '豆魚蛋肉類:' + meatsandprotein_portion + '份' + '\n' + '乳品類:' + dairy_portion + '份' + '\n' + '水果類:' + fruit_portion + '份' + '\n' + '油脂與堅果種子類:' + fats_portion + '份');
                agent.add('食材:' + '\n' + seasoning_use + '\n' + '步驟:' + '\n' + rc_content);
                */

                var lineMessage = {
                    "type": "flex",
                    "altText": "This is a Flex Message",
                    "contents": {
                        "type": "bubble",
                        /* "styles": {
                             "header": {
                                 "backgroundColor": "#ffaaaa"
                             },
                             "body": {
                                 "backgroundColor": "#aaffaa"
                             },
                             "footer": {
                                 "backgroundColor": "#aaaaff"
                             }
                         },*/
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": recipe_name,
                                    "weight": "bold",
                                    "size": "xl",
                                    "margin": "md"
                                },
                                {
                                    "type": "separator",
                                    "margin": "xxl"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "margin": "xxl",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "營養分類",
                                            "weight": "bold",
                                            "color": "#1DB446",
                                            "size": "md"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "全榖雜糧類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": grains_portion + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "蔬菜類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": vegetables_portion + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "豆魚蛋肉類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": meatsandprotein_portion + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "乳品類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": dairy_portion + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "水果類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": fruit_portion + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "油脂與堅果種子類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": fats_portion + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                    ]
                                },
                                {
                                    "type": "separator",
                                    "margin": "xxl"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "margin": "xxl",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "食材",
                                            "weight": "bold",
                                            "color": "#1DB446",
                                            "size": "md"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": seasoning_use,
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },

                                            ]
                                        },
                                    ]
                                },
                                {
                                    "type": "separator",
                                    "margin": "xxl"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "margin": "xxl",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "步驟",
                                            "weight": "bold",
                                            "color": "#1DB446",
                                            "size": "md"
                                        },
                                        {
                                            "type": "box",
                                            "layout": "vertical",

                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": rc_content,
                                                    "size": "md",
                                                    "color": "#555555",
                                                    "wrap": true,
                                                },

                                            ]
                                        },
                                    ]
                                },

                            ]

                        },/*
                        "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "footer"
                                }
                            ]
                        }*/
                    }
                };
                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);

            }
        });

    }

    //----------------------------------------
    // 可直接取用檔案的資料夾
    //----------------------------------------
    app.use(express.static('public'));

    //-----------------------------
    // 設定對話中各個意圖的函式對照
    //-----------------------------
    let intentMap = new Map();

    intentMap.set('Default Welcome Intent', welcome);  //歡迎意圖
    intentMap.set('user join', userJoin);      //加入會員意圖
    intentMap.set('find recipe', findrecipe);   //查看菜單意圖
    intentMap.set('show recipe', showrecipe);  //查看分類菜單
    agent.handleRequest(intentMap);
})


//----------------------------------------
// 監聽3000埠號, 
// 或是監聽Heroku設定的埠號
//----------------------------------------
var server = app.listen(process.env.PORT || 3000, function () {
    const port = server.address().port;
    console.log("正在監聽埠號:", port);
});