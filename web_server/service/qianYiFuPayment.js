module.exports = QianYiFuPaymentService;
var crypto = require('../../utils/crypto');
var configs = require('../../configs');
var qianYiFuConfig = configs.qianYiFuConfig();

// var HTTPClass = require("../util/http_utils");
// var http = new HTTPClass();
var http = require("../../utils/http");

var queryUrl = 'http://wangguan.qianyifu.com/gateway/query.asp';
//var payUrl = 'http://wangguan.qianyifu.com:8881/gateway/pay.asp';
var payUrl = 'http://gateway.qianyifu.com:8881/gateway/pay_test.asp';

function QianYiFuPaymentService() {

    this.queryUrl = queryUrl;
    this.payUrl = payUrl;
    //查询订单状态
    this.query = function (orderId, callback) {
        if (callback) {
            http.get2(queryUrl, { userid: userid, orderid: orderId, sign: this.buildQuerySign(orderId) }, function (state, result) {
                if (state) {
                    callback(null, result);
                } else {
                    callback(result);
                }
            }, false);
        }
    }

    this.buildQuerySign = function (orderId) {
        var str = 'userid=' + qianYiFuConfig.id + '&orderid=' + orderId + '&keyvalue=' + qianYiFuConfig.key;
        return crypto.md5(str);
    }

    this.buildPaySign = function (orderId) {
        var str = 'userid=' + qianYiFuConfig.id + '&orderid=' + orderId +'&bankid=' + qianYiFuConfig.bankId + '&keyvalue=' + qianYiFuConfig.key;
        return crypto.md5(str);
    }
    
    this.buildPayUrlQuery = function (orderId,money,ext) {
        if(!ext){
            ext='';
        }
        var sign = this.buildPaySign(orderId);
        var str = 'userid=' + qianYiFuConfig.id +'&orderid=' + orderId + '&money=' + money 
            + '&hrefurl=' + qianYiFuConfig.returnUrl +'&url=' + qianYiFuConfig.callbackUrl 
            +'&bankid=' + qianYiFuConfig.bankId + '&sign=' + sign +'&ext=' + ext;
        return str;
    }

    this.getPayCallbackSign = function(returncode,orderNum,money){
        var str = 'returncode='+returncode+'&userid='+qianYiFuConfig.id+'&orderid='+orderNum+'&money='+money+'&keyvalue='+qianYiFuConfig.key;
        return crypto.md5(str);
    }

    this.checkPayCallbaclSign = function (sign, returncode, orderNum, money) {
        var str = this.getPayCallbackSign(returncode,orderNum,money);
        return str==sign;
    }
}