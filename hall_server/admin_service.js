var crypto = require('../utils/crypto');
var express = require('express');
var db = require('../utils/db');
var http = require('../utils/http');
var room_service = require("./room_service");

var app = express();
var config = null;

function check_account(req,res){
	var account = req.query.account;
	var sign = req.query.sign;
	if(account == null || sign == null){
		http.send(res,1,"unknown error");
		return false;
	}
	/*
	var serverSign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
	if(serverSign != sign){
		http.send(res,2,"login failed.");
		return false;
	}
	*/
	return true;
}

//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});


app.get('/get_online_user_count',function(req,res){
	return room_service.getOnlineUserCount();
});

exports.start = function($config){
	config = $config;
	app.listen(config.ADMIN_PORT);
	console.log("client service is listening on port " + config.CLEINT_PORT);
};