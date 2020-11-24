"use strict";

const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const { Text, Card, Image, Suggestion, Payload } = require('dialogflow-fulfillment');
const app = express()

//增加引用模組
const user = require('./utility/user');
const recipe = require('./utility/recipe');
const information = require('./utility/information');
const active = require('./utility/active');

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
    function add() {
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
                agent.add('請輸入「活動量」來計算卡路里');

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

    //------------------
    // 處理查詢食譜意圖
    //------------------   
    function upin() {
        agent.add('如欲更新身高體重,請輸入"身高體重"');
        agent.add('如欲更新活動量,請輸入"活動量"');

    }

    //------------------
    // 處理查詢食譜意圖
    //------------------   
    function searchrecipe() {
        //回覆文字
        agent.add('請輸入你想查詢的食譜名稱~');


    }

    //----------------------- 
    // 處理查看食譜類別
    //-----------------------     
    function showrecipe() {

        //取得分類
        var recipe_name = request.body.queryResult.parameters.recipe_name;
        //回覆文字            

        //呼叫recipe模組, 取出食譜
        return recipe.showrecipe(recipe_name).then(data => {
            //console.log(data);
            if (data == -9) {
                console.log('data == -9');
                //回覆文字            
                agent.add('喔, 讀取資料錯誤(程式或資料庫出錯)!');

                //回覆貼圖   
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "16"
                };

            } else if (data == 0) {

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
                        "thumbnailImageUrl": "https://eat10556ntub.herokuapp.com/pic/" + data[i].pic,
                        "imageBackgroundColor": "#FFFFFF",
                        "title": data[i].recipe_name,
                        "text": "熱量:" + data[i].calories + "大卡",
                        "actions": [{
                            "type": "message",
                            "label": "查看食譜",
                            "text": "查看" + data[i].recipe_name + "完整食譜"

                        },
                        {
                            "type": "message",
                            "label": "查看食材",
                            "text": "查看" + data[i].recipe_name + "食材"

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
                var bean_portion = data[0].bean_portion;
                var dairy_portion = data[0].dairy_portion;
                var fruit_portion = data[0].fruit_portion;
                var fats_portion = data[0].fats_portion;
                var rc_content = data[0].rc_content;

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
                                                    "text": "豆類",
                                                    "size": "sm",
                                                    "color": "#555555",
                                                },
                                                {
                                                    "type": "text",
                                                    "text": bean_portion + "份",
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
                                                    "size": "sm",
                                                    "color": "#555555",
                                                    "wrap": true,
                                                },

                                            ]
                                        },
                                    ]
                                },

                            ]

                        },
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
    function findfood() {
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
                var cs = [];
                for (var i = 0; i < data.length; i++) {
                    cs.push(

                        {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": data[i].record_food,
                                            "margin": "sm",
                                            "color": "#555555",
                                        },
                                        {
                                            "type": "text",
                                            "text": data[i].gram + "公克",
                                            "size": "sm",
                                            "color": "#111111",
                                            "align": "end"
                                        }
                                    ]
                                },
                            ]
                        })
                };
                console.log(cs);
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
                                    "text": recipe_name,
                                    "weight": "bold",
                                    "size": "xl",
                                    "margin": "md",
                                    "columns": cs,
                                },
                                
                            ]

                        },
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
            + String('0' + (currentdate.getHours() + 8)).substr(-2)
            + String('0' + currentdate.getMinutes()).substr(-2)
            + String('0' + currentdate.getSeconds()).substr(-2)
            + String('0' + currentdate.getMilliseconds()).substr(-3);
        var bmino;
        let BMI = String(Math.round(weight / ((height / 100) * (height / 100)) * 100) / 100)
        if (BMI < 18.5) {
            bmino = 'B001';
        } else if (18.5 <= BMI < 24) {
            bmino = 'B002';
        } else {
            bmino = 'B003';
        }
        console.log(bmino)
        //呼叫customer模組, 填入客戶姓名
        return information.fillheight(user_account, Math.round(height), Math.round(weight), infono, bmino).then(data => {
            console.log(user_account);
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
                                                    "text": "豆類",
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

    //----------------------- 
    // 處理活動量類別
    //-----------------------     
    function searchactive() {

        //取得會員LineID
        var user_account = request.body.originalDetectIntentRequest.payload.data.source.userId;
        return active.searchactive(user_account).then(data => {
            if (data == 0) {
                //回覆文字  
                agent.add('尚未加入會員! 可填寫以下加入會員:');
                agent.add('想加入會員');

                //加一張貼圖
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "5"
                };
                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                var lineMessage = {
                    "type": "template",
                    "altText": "this is a carousel template",
                    "template": {
                        "type": "carousel",
                        "columns": [
                            {
                                "imageBackgroundColor": "#FFFFFF",
                                "title": "輕度活動量",
                                "text": "大部分從事靜態或坐著的工作" + "\n" + "例如：家庭主婦、坐辦公室的上班族、售貨員等...",
                                "actions": [
                                    {
                                        "type": "message",
                                        "label": "輕度活動量",
                                        "text": "A001" + "輕度活動量"
                                    },
                                ]
                            },
                            {
                                "imageBackgroundColor": "#000000",
                                "title": "中度活動量",
                                "text": "從事機械操作、接待或家事等站立活動較多的工作" + "\n" + "例如：褓母、護士、服務生等...",
                                "actions": [
                                    {
                                        "type": "message",
                                        "label": "中度活動量",
                                        "text": "A002" + "中度活動量"
                                    },
                                ]
                            },
                            {
                                "imageBackgroundColor": "#000000",
                                "title": "重度活動量",
                                "text": "從事農耕、漁業、建築等的重度使用體力之工作" + "\n" + "例如：運動員、搬家工人等...",
                                "actions": [
                                    {
                                        "type": "message",
                                        "label": "重度活動量",
                                        "text": "A003" + "重度活動量"
                                    },
                                ]
                            }
                        ],

                    }


                };
                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            }
        });

    }

    //-----------------------
    // 處理選擇活動量意圖
    //-----------------------     
    function fillactive() {
        //取得會員LineID
        var user_account = request.body.originalDetectIntentRequest.payload.data.source.userId;

        //取得活動量編號
        var actno = request.body.queryResult.parameters.actno;

        //呼叫active模組, 填入活動量編號
        return active.fillactive(user_account, actno).then(data => {
            console.log(user_account);
            console.log("A001")
            if (data == -9) {
                //回覆文字             
                agent.add('喔, 填寫錯誤!');

                //回覆貼圖     
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "9"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else if (data == 0) {
                //回覆文字  
                agent.add('尚未加入會員! 可填寫以下加入會員:');
                agent.add('想加入會員');

                //加一張貼圖
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "5"
                };
            } else {
                //回覆文字             
                agent.add('已填入活動量!');

                //回覆貼圖     
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "2"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            }
        });
    }

    //----------------------- 
    // 處理今日推薦食譜意圖
    //-----------------------     
    function recrecipe() {
        //取得分類
        var user_account = request.body.originalDetectIntentRequest.payload.data.source.userId;
        //var bmino = request.body.queryResult.parameters.bmino;
        //console.log(bmino);
        //呼叫menu模組, 取出分類菜單
        return recipe.recrecipe(user_account).then(data => {
            //console.log(data);
            if (data == -9) {
                console.log('data == -9');
                //回覆文字            
                agent.add('喔, 讀取資料錯誤(程式或資料庫出錯)!');
            } else if (data.length == 0) {
                console.log('data.length == 0');
                //回覆文字              
                agent.add('喔, 目前沒有內容!');
                agent.add('請輸入健康資料!');

                //回覆貼圖   
                var lineMessage = {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "3"
                };

                var payload = new Payload('LINE', lineMessage, { sendAsMessage: true });
                agent.add(payload);
            } else {
                console.log('ccc');

                console.log('data.length');
                console.log(data.length);
                //console.log(bmino);
                var cs = []

                //回覆圖文選單 
                for (var i = 0; i < data.length; i++) {
                    cs.push({
                        "thumbnailImageUrl": "https://eat10556ntub.herokuapp.com/pic/" + data[i].pic,
                        "imageBackgroundColor": "#FFFFFF",
                        "title": data[i].recipe_name,
                        "text": "熱量:" + data[i].calories + "大卡",
                        "actions": [{
                            "type": "message",
                            "label": "查看食譜",
                            "text": "查看" + data[i].recipe_name + "完整食譜"

                        },
                        {
                            "type": "message",
                            "label": "查看食材",
                            "text": "查看" + data[i].recipe_name + "食材"

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

    //----------------------------------------
    // 可直接取用檔案的資料夾
    //----------------------------------------
    app.use(express.static('public'));

    //-----------------------------
    // 設定對話中各個意圖的函式對照
    //-----------------------------
    let intentMap = new Map();

    intentMap.set('Default Welcome Intent', welcome);  //歡迎意圖
    intentMap.set('user join', add);      //加入會員意圖
    intentMap.set('search recipe', searchrecipe);
    intentMap.set('find recipe', findrecipe);   //查看菜單意圖
    intentMap.set('find food', findfood);
    intentMap.set('show recipe', showrecipe);
    intentMap.set('check BMI and cal', BMIcal);
    intentMap.set('fill height', fillheight);
    intentMap.set('search active', searchactive);
    intentMap.set('fill active', fillactive);
    intentMap.set('recommend recipe', recrecipe);
    intentMap.set('update info', upin);

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