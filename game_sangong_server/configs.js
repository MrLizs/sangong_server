var HALL_IP = "47.104.88.251";
var HALL_ROOM_PORT = 9022;

var ROOM_PRI_KEY = "shidianban!%*";

var LOCAL_IP = '127.0.0.1';

exports.mysql = function(){
	return {
		HOST:'47.104.88.251',
		USER:'root',
		PSWD:'miduo181818',
		DB:'sangong',
		PORT:3306,
	}
};

//游戏服配置
exports.game_server = function(){
	return {
		SERVER_ID:"001",
		SERVER_TYPE:"sangong",
		//暴露给大厅服的HTTP端口号
		HTTP_PORT:9023,
		//HTTP TICK的间隔时间，用于向大厅服汇报情况
		HTTP_TICK_TIME:5000,
		//大厅服IP
		HALL_IP:LOCAL_IP,
		FOR_HALL_IP:LOCAL_IP,
		//大厅服端口
		HALL_PORT:HALL_ROOM_PORT,
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
		
		//暴露给客户端的接口
		CLIENT_IP:HALL_IP,
		CLIENT_PORT:10020,
	};
};