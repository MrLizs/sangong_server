var db = require("../../utils/db");

var express = require('express');
var router = express.Router();

//var HTTPClass = require("../util/http_utils");
//var http = new HTTPClass();
var http = require("../../utils/http");
var configs = require('../../configs');
var config = configs.web_server();

var QianYiFuPaymentService = require("../service/qianYiFuPayment");
var qianYiFuPaymentService = new QianYiFuPaymentService();

//准备跳转到支付页面
router.get('/gotoPay', function (req, res, next) {
    var type = req.query.type;
    var index = parseInt(req.query.index);
    var userId = req.query.userId;
    var ext = userId;
	db.get_config('shop', function (err, str) {
		if (err || typeof str != 'string') {
			http.send(res, -3, "get shop config error");
			return;
		}
		var shop = JSON.parse(str);
		var good = null;
		for(var i=0;i<shop.length;i++){
			var goodType = shop[i];
			if(goodType.type!='gems2coins'&&goodType.type==type){
				good = goodType.items[index];
				break;
			}
		}
        if (good) {
            good.type = type;
            good.index = index;
            db.create_order(good.price, good, userId,function (orderNum) {
                if (orderNum) {
                    var payUrlStr = qianYiFuPaymentService.payUrl + '?' + qianYiFuPaymentService.buildPayUrlQuery(orderNum, good.price, userId);
                    res.redirect(payUrlStr);
                } else {
                    res.send('create order ERROR');
                }
            });
        } else {
            res.send('can not find good');
        }
    });
});

//支付接口同步通知页面，显示支付结果
router.get('/result', function (req, res, next) {

    console.log('Payment result');
    console.log(req.query);

    var returncode = req.query.returncode;
    var orderNum = req.query.orderid;
    var money = parseFloat(req.query.money);
    var sign = req.query.sign;

    if (qianYiFuPaymentService.checkPayCallbaclSign(sign, returncode, orderNum, req.query.money)) {
        var str = returncode == 1 ? '支付成功！' : '支付失败！';
        str += '  订单号：' + orderNum;
        str += '  金额:' + money + '元';
        res.send(str);
    } else {
        res.send('sign ERROR');
    }
    // res.render('payment/result', { payStr: payStr });
});

//支付接口异步通知api，更新订单状态
router.get('/callback', function (req, res, next) {
    res.send('success');

    console.log('Payment callback');
    console.log(req.query);

    var returncode = req.query.returncode;
    var orderNum = req.query.orderid;
    var money = parseFloat(req.query.money);
    var sign = req.query.sign;
    var userId = req.query.ext;

    if (qianYiFuPaymentService.checkPayCallbaclSign(sign, returncode, orderNum, req.query.money)) {
        if (returncode == 1) {
            db.pay_order(orderNum, money, function (err, order) {
                if (err) {
                    console.error('Pay Order ERROR! OrderNum:' + orderNum + ' returncode:' + returncode);
                } else {
                    if (order) {
                        console.log('Pay Order SUCCESS! OrderNum:' + orderNum + ' returncode:' + returncode);
                        if(order.detailInfo.good.gamegold>0){
                            db.update_user_yuanbaos(order.userId,order.detailInfo.good.gamegold,function(err){
                                console.error('Add gamegold ERROR! UserId:' + userId + ' OrderNum:' + orderNum + ' gamegold:' + order.detailInfo.good.gamegold);
                            });
                        }
                        if(order.detailInfo.good.gems>0){
                            db.add_user_gems(order.userId,null,order.detailInfo.good.gems,function(isSuccess){
                                if(!isSuccess){
                                    console.error('Add Gems ERROR! UserId:' + userId + ' OrderNum:' + orderNum + ' gems:' + order.detailInfo.good.gems);
                                }
                            });
                        }
                    } else {
                        console.warn('Pay Order SKIP! This order has paid. OrderNum:' + orderNum + ' returncode:' + returncode);
                    }
                }
            });
        } else {
            console.error('Pay ERROR! OrderNum:' + orderNum + ' returncode:' + returncode);
        }
    } else {
        console.warn('Pay Callback Sign Check Fail ! OrderNum:' + orderNum + ' returncode:' + returncode);
    }
});

module.exports = router;
