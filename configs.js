// var HALL_IP = "103.60.166.3";
// var HALL_IP = "192.168.1.107";
var HALL_IP = "127.0.0.1";
var HALL_CLIENT_PORT = 9021;
var HALL_ROOM_PORT = 9022;

var ACCOUNT_PRI_KEY = "shidianban!%*345789";
var ROOM_PRI_KEY = "shidianban!%*";

var LOCAL_IP = '127.0.0.1';

// exports.mysql = function(){
// 	return {
// 		HOST:'localhost',
// 		USER:'root',
// 		PSWD:'1234',
// 		DB:'sangong',
// 		PORT:3306,
// 		multipleStatements:true
// 	}
// };

// exports.mysql = function(){
// 	return {
// 		HOST:'103.60.166.3',
// 		USER:'root',
// 		PSWD:'CC166.123456',
// 		DB:'sangong',
// 		PORT:3306,
// 	}
// };
exports.mysql = function(){
	return {
		HOST:'127.0.0.1',
		USER:'root',
		PSWD:'1234',
		DB:'sangong',
		PORT:3306,
	}
};

//账号服配置
exports.account_server = function(){
	return {
		CLIENT_PORT:9020,
		HALL_IP:HALL_IP,
		HALL_CLIENT_PORT:HALL_CLIENT_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		
		//
		DEALDER_API_IP:LOCAL_IP,
		DEALDER_API_PORT:9024,
		VERSION:'20171111',
		APP_WEB:'http://fir.im/c2ry',
	};
};

//大厅服配置
exports.hall_server = function(){
	return {
		HALL_IP:HALL_IP,
		CLEINT_PORT:HALL_CLIENT_PORT,
		FOR_ROOM_IP:LOCAL_IP,
		ROOM_PORT:HALL_ROOM_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		ROOM_PRI_KEY:ROOM_PRI_KEY
	};	
};

//游戏服配置
exports.game_server = function(){
	return {
		SERVER_ID:"001",
		
		//暴露给大厅服的HTTP端口号
		HTTP_PORT:9023,
		//HTTP TICK的间隔时间，用于向大厅服汇报情况
		HTTP_TICK_TIME:5000,
		//大厅服IP
		HALL_IP:LOCAL_IP,
		FOR_HALL_IP:HALL_IP,
		//大厅服端口
		HALL_PORT:HALL_ROOM_PORT,
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
		
		//暴露给客户端的接口
		CLIENT_IP:HALL_IP,
		CLIENT_PORT:10020,
	};
};

//web_server
exports.web_server = function(){
	return {
		PORT:80,//9029,
		serverRootUrl:'http://sangong.diandg.com',
		addGemsUrl:'http://127.0.0.1:9024/add_user_gems'
	};
};
exports.qianYiFuConfig = function(){
	return {
		//id:'1000',
		id:'48879',
		//key:'uy6UJer7Gerijq2lIY7kasD41HD44Sddg6',
		key:'6bagyIvh6dzVventgvassHzTwgDlGHn5MxEeGoF9',
		//bankId:'zhifubao',
		bankId:'weixin',
		returnUrl:exports.web_server().serverRootUrl+'/payment/result',
		callbackUrl:exports.web_server().serverRootUrl+'/payment/callback'
	};
};

exports.wxConfig = {
		wxAppid:'wx250293b64cbb120d',
		wxAppSecret:'d445da8279ab8546eb3054b156f46b4d',
}

exports.wxJsapiSignConfig={
    appId: exports.wxConfig.wxAppid,
    appSecret: exports.wxConfig.wxAppSecret,
    appToken: 'SHANG',
    cache_json_file:'tmp'
}

exports.wxPaymentConfig = function(){
	return {
    appid: exports.wxConfig.wxAppid,
    mchid: exports.wxConfig.wxMchid,
    partnerKey: config.wxPartnerKey,
    //pfx: require('fs').readFileSync('cert/apiclient_cert.p12'),
	notify_url: config.serverRootUrl+'/wechat/api/payCallback',
	};
}