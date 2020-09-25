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

    //-----------------------
    // 處理填寫身高意圖
    //-----------------------     
    function fillheight() {
        //取得會員LineID
        var user_account = request.body.originalDetectIntentRequest.payload.data.source.userId;

        //取得會員姓名
        var height = request.body.queryResult.parameters.height;
        var weight = request.body.queryResult.parameters.weight;
        console.log(height);
        console.log(weight);
        //取得現在的日期時間
        var currentdate = new Date();
        var infono = String(currentdate.getFullYear())
            + String('0' + (currentdate.getMonth() + 1)).substr(-2)
            + String('0' + currentdate.getDate()).substr(-2)
            + String('0' + currentdate.getHours()).substr(-2)
            + String('0' + currentdate.getMinutes()).substr(-2)
            + String('0' + currentdate.getSeconds()).substr(-2)
            + String('0' + currentdate.getMilliseconds()).substr(-3);

        //呼叫customer模組, 填入客戶姓名
        return information.fillheight(user_account, height, weight, infono).then(data => {
            console.log("*****");
            console.log(weight);
            console.log(infono);
            console.log(height);
            if (data == 0) {
                //回覆文字             
                agent.add('已填入身高體重!');

                //回覆貼圖     
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "13"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                //回覆文字             
                agent.add('填寫失敗, 請再試試!');

                //回覆貼圖     
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "16"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            }
        });
    }

    //-----------------------
    // 處理營養分析意圖
    //-----------------------     
    function BMIcal() {
        //取得客戶ID
        var user_account = request.body.originalDetectIntentRequest.payload.data.source.userId;

        //呼叫menu模組, 進行結帳        
        return information.BMIcal(user_account).then(data => {
            if (data == -9) {
                //回覆文字            
                agent.add('喔, 讀取資料錯誤(程式或資料庫出錯)!');
            } else if (data.length == 0) {
                //回覆文字             
                agent.add('喔, 你沒有輸入資料!');

                //回覆貼圖   
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "2",
                    "stickerId": "34"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                let h = data[0].height;
                let w = data[0].weight;
                let n = data[0].actno;
                let BMI = String(Math.round(w / ((h / 100) * (h / 100)) * 100) / 100);
                //計算總金額, 產生帳單內容                       
                var cal = 0;
                //var content = "";
                var an = "";
                if (BMI < 18.5) {
                    if (n == 'A001 ') {
                        an = "輕度活動量";
                        cal = 35 * w;
                        //content = "您的體重過輕" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    } else if (n == 'A002 ') {
                        an = "中度活動量";
                        cal = 40 * w;
                        //content = "您的體重過輕" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    } else {
                        an = "重度活動量";
                        cal = 45 * w;
                        //content = "您的體重過輕" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    }
                } else if (18.5 <= BMI < 24) {
                    if (n == 'A001 ') {
                        an = "輕度活動量";
                        cal = 30 * w;
                        //content = "您的體重正常" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    } else if (n == 'A002 ') {
                        an = "中度活動量";
                        cal = 35 * w;
                        //content = "您的體重正常" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    } else {
                        an = "重度活動量";
                        cal = 40 * w;
                        //content = "您的體重正常" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    }
                } else {
                    if (n == 'A001 ') {
                        an = "輕度活動量";
                        cal = 25 * w;
                        //content = "您的體重過重" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    } else if (n == 'A002 ') {
                        an = "中度活動量";
                        cal = 30 * w;
                        //content = "您的體重過重" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    } else {
                        an = "重度活動量";
                        cal = 35 * w;
                        //content = "您的體重過重" + "您的BMI為" + String(BMI) + "\n" + "每日建議攝取" + String(cal) + "大卡";
                    }
                }
                //agent.add(content);
                //var content2 = "";
                var a = 0;
                var b = 0;
                var c = 0;
                var d = 0;
                var e = 0;
                var f = 0;
                if (cal <= 1200) {
                    a = 1.5;
                    b = 3;
                    c = 1.5;
                    d = 3;
                    e = 2;
                    f = 4;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 1.5碗" + "\n" + "豆魚蛋肉類 3份" + "\n" + "乳品類 1.5杯" + "\n" + "蔬菜類 3份" + "\n" + "水果類 2份" + "\n" + "油脂與堅果種子類 4份";
                } else if (1200 < cal && cal <= 1500) {
                    a = 2.5;
                    b = 4;
                    c = 1.5;
                    d = 3;
                    e = 3;
                    f = 4;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 2.5碗" + "\n" + "豆魚蛋肉類 4份" + "\n" + "乳品類 1.5杯" + "\n" + "蔬菜類 3份" + "\n" + "水果類 3份" + "\n" + "油脂與堅果種子類 4份";
                } else if (1500 < cal && cal <= 1800) {
                    a = 3;
                    b = 5;
                    c = 1.5;
                    d = 3;
                    e = 2;
                    f = 5;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 3碗" + "\n" + "豆魚蛋肉類 5份" + "\n" + "乳品類 1.5杯" + "\n" + "蔬菜類 3份" + "\n" + "水果類 2份" + "\n" + "油脂與堅果種子類 5份";
                } else if (1800 < cal && cal <= 2000) {
                    a = 3;
                    b = 6;
                    c = 1.5;
                    d = 4;
                    e = 3;
                    f = 6;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 3碗" + "\n" + "豆魚蛋肉類 6份" + "\n" + "乳品類 1.5杯" + "\n" + "蔬菜類 4份" + "\n" + "水果類 3份" + "\n" + "油脂與堅果種子類 6份";
                } else if (2000 < cal && cal <= 2200) {
                    a = 3.5;
                    b = 6;
                    c = 1.5;
                    d = 4;
                    e = 3.5;
                    f = 6;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 3.5碗" + "\n" + "豆魚蛋肉類 6份" + "\n" + "乳品類 1.5杯" + "\n" + "蔬菜類 4份" + "\n" + "水果類 3.5份" + "\n" + "油脂與堅果種子類 6份";
                } else if (2200 < cal && cal <= 2500) {
                    a = 4;
                    b = 7;
                    c = 1.5;
                    d = 5;
                    e = 4;
                    f = 7;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 4碗" + "\n" + "豆魚蛋肉類 7份" + "\n" + "乳品類 1.5杯" + "\n" + "蔬菜類 5份" + "\n" + "水果類 4份" + "\n" + "油脂與堅果種子類 7份";
                } else {
                    a = 4;
                    b = 8;
                    c = 2;
                    d = 5;
                    e = 4;
                    f = 8;
                    //content2 = "您一天需攝取六大類之份數:" + "\n" + "全榖雜糧類 4碗" + "\n" + "豆魚蛋肉類 8份" + "\n" + "乳品類 2杯" + "\n" + "蔬菜類 5份" + "\n" + "水果類 4份" + "\n" + "油脂與堅果種子類 8份";
                }
                //agent.add(content2);
                //回覆貼圖 

                var lineMessage = {
                    "type": "flex",
                    "altText": "This is a Flex Message",
                    "contents": {
                        "type": "bubble",
                        "header": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "個人分析",
                                    "weight": "bold",
                                    "size": "xl",
                                    "margin": "md"
                                },
                                {
                                    "type": "separator",
                                    "margin": "xxl"
                                },
                                {
                                    "type": "text",
                                    "text": "基本資料",
                                    "weight": "bold",
                                    "color": "#1DB446",
                                    "size": "sm",
                                    "margin": "md"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "margin": "sm",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "身高",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": h + "公分",
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
                                                    "text": "體重",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": w + "公斤",
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
                                                    "text": "BMI",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": BMI,
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
                                                    "text": "活動量",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": an,
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
                                    "type": "text",
                                    "text": "六大類之份數及總熱量",
                                    "weight": "bold",
                                    "color": "#1DB446",
                                    "size": "sm",
                                    "margin": "md"
                                },
                                {
                                    "type": "box",
                                    "layout": "vertical",
                                    "spacing": "sm",
                                    "margin": "sm",
                                    "contents": [
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
                                                    "text": a + "碗",
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
                                                    "text": b + "份",
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
                                                    "text": c + "杯",
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
                                                    "text": d + "份",
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
                                                    "text": e + "份",
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
                                                    "text": f + "份",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "text",
                                            "text": " ",
                                            "size": "sm",
                                        },
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "總熱量",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": cal + "大卡",
                                                    "size": "sm",
                                                    "color": "#111111",
                                                    "align": "end"
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
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
    intentMap.set('show recipe', showrecipe);
    intentMap.set('check BMI and cal', BMIcal);
    intentMap.set('fill height', fillheight);
    //查看分類菜單
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