var express = require('express');
var db = require('../../utils/db');

var router = express.Router();
router.caseSensitive = true;
//var url = require('url');
//var fs = require('fs');
var moment = require('../node_modules/moment');

var config = require('../../configs.js');

// var tenpay = require('tenpay');
// var api = new tenpay(config.wxPaymentConfig);
// var middleware = api.middlewareForExpress();

// var WePayService = require('../service/wePay');
// var wePayService = new WePayService();

var https = require('https');
var iconv = require("iconv-lite");
var signature = require('wx_jsapi_sign');

router.post('/api/sign', function (req, res) {
    var url = req.body.url;
    console.log(url);
    signature.getSignature(config.wxJsapiSignConfig)(url, function (error, result) {
        if (error) {
            res.json({
                'error': error
            });
        } else {
            res.json(result);
        }
    });
});

var getWxUserToken = function (code, callback) {
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.wxConfig.wxAppid + '&secret=' + config.wxConfig.wxAppSecret + '&code=' + code + '&grant_type=authorization_code';
    https.get(url, function (httpRes) {
        var datas = [];
        var size = 0;
        httpRes.on('data', function (data) {
            datas.push(data);
            size += data.length;
        });
        httpRes.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring
            var resultObj = JSON.parse(result);
            if (resultObj) {
                if (resultObj.access_token) {
                    callback(null, resultObj);
                } else {
                    callback(resultObj);
                }
            }
            else
                callback('未获取到json数据');
        });
    }).on('error', function (e) {
        callback(e);
    });
}

var getWxUserInfo = function (userToken, callback) {
    var url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + userToken.access_token + '&openid=' + userToken.openid + '&lang=zh_CN';
    https.get(url, function (httpRes) {
        var datas = [];
        var size = 0;
        httpRes.on('data', function (data) {
            datas.push(data);
            size += data.length;
        });
        httpRes.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring
            var resultObj = JSON.parse(result);
            if (resultObj) {
                if (resultObj.openid) {
                    callback(null, resultObj);
                } else {
                    callback(resultObj, null);
                }
            }
            else
                callback('未获取到json数据', null);
        });
    }).on('error', function (e) {
        callback(e, null);
    });
}

router.get('/api/wxUserOpenid/:code', function (req, res) {
    var code = req.params.code;
    getWxUserToken(code, function (err, tokenObj) {
        if (err) {
            res.json(500, err);
        } else {
            res.json(tokenObj.openid);
        }
    });
});

router.get('/api/wxUserInfo/:code', function (req, res) {
    var code = req.params.code;
    getWxUserToken(code, function (err, tokenObj) {
        console.log("getWxUserToken  err:" + err + " \n tokenObj:"+tokenObj);
        if (err) {
            res.json(500, err);
        } else {
            getWxUserInfo(tokenObj, function (err, userInfo) {
                console.log("getWxUserInfo  err:" + err + " \n userInfo:"+userInfo);
                if (err) {
                    res.json(500, err);
                } else {
                    var account = "wx_" + userInfo.openid;
                    var name = userInfo.nickname;
                    var coins = 0;
                    var yuanbaos = 0;
                    var gems = 100;
                    db.is_user_exist(account,function(ret){
                        if(!ret){
                            db.create_user(account,name,coins,yuanbaos,gems,userInfo.sex,userInfo.headimgurl,function(ret){
                                if (ret == null) {
                                    console.log("system error.");
                                    res.json(500,'system error.');
                                    // res.json("system error.");
                                }
                                else{
                                    res.json(userInfo);
                                }
                            });
                        }
                        else{
                            console.log("account have already exist.");
                            res.json(userInfo);
                            // res.json("account have already exist.");
                        }
                    });
                }
            });
        }
    });
});

// router.post('/api/orders', function (req, res) {
//     var openid = req.body.openid;

//     var orderNum =moment().format('YYYYMMDDHHmmssSSS')+parseInt(Math.random()*10,10)+parseInt(Math.random()*10,10)+parseInt(Math.random()*10,10)+parseInt(Math.random()*10,10);
//     var params = {
//         out_trade_no: orderNum,//订单号
//         body: 'test',
//         total_fee: 1,//钱数，单位：分
//         openid: openid
//     };
//     wePayService.getPayParams(params, function (err, payParams) {
//         if (err) {
//             res.statusCode = 500;
//             res.json('获取支付参数出错：' + err);
//         } else {
//             res.json({ payParams: payParams, orderNum: orderNum });
//         }
//     });
// });

//微信支付回调
// router.post('/api/payCallback', middleware, function (req, res) {
//     res.send('SUCCESS');
//     console.log(req.weixin);
//     // if (req.weixin.return_code == 'SUCCESS') {
//     // }
// });

module.exports = router;