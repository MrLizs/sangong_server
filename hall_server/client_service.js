var crypto = require('../utils/crypto');
var express = require('express');
var db = require('../utils/db');
var http = require('../utils/http');
var room_service = require("./room_service");
var moment = require('moment');
var configs = require('../configs');

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

app.get('/login',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	
	var ip = req.ip;
	if(ip.indexOf("::ffff:") != -1){
		ip = ip.substr(7);
	}
	
	var account = req.query.account;
	db.get_user_data(account,function(data){
		if(data == null){
			http.send(res,0,"ok");
			return;
		}

		var ret = {
			account:data.account,
			userid:data.userid,
			name:data.name,
			lv:data.lv,
			exp:data.exp,
			coins:data.coins,
			yuanbaos:data.yuanbaos,
			coinsbank:data.coinsbank,
			yuanbaosbank:data.yuanbaosbank,
			gems:data.gems,
			ip:ip,
			sex:data.sex,
		};

		db.get_room_id_of_user(data.userid,function(roomId){
			//如果用户处于房间中，则需要对其房间进行检查。 如果房间还在，则通知用户进入
			if(roomId != null){
				//检查房间是否存在于数据库中
				db.is_room_exist(roomId,function (retval){
					if(retval){
						ret.roomid = roomId;
					}
					else{
						//如果房间不在了，表示信息不同步，清除掉用户记录
						db.set_room_id_of_user(data.userid,null);
					}
					http.send(res,0,"ok",ret);
				});
			}
			else {
				http.send(res,0,"ok",ret);
			}
		});
	});
});

app.get('/create_user',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var account = req.query.account;
	var name = req.query.name;
	var coins = 1000;
	var yuanbaos = 1000;
	var gems = 100;
	console.log(name);

	db.is_user_exist(account,function(ret){
		if(!ret){
			db.create_user(account,name,coins,yuanbaos,gems,0,null,function(ret){
				if (ret == null) {
					http.send(res,2,"system error.");
				}
				else{
					http.send(res,0,"ok");					
				}
			});
		}
		else{
			http.send(res,1,"account have already exist.");
		}
	});
});

app.get('/create_private_room',function(req,res){
	//验证参数合法性
	var data = req.query;
	//验证玩家身份
	if(!check_account(req,res)){
		return;
	}

	var account = data.account;

	data.account = null;
	data.sign = null;
	var conf = data.conf;
	db.get_user_data(account,function(data){
		if(data == null){
			http.send(res,1,"system error");
			return;
		}
		var userId = data.userid;
		var name = data.name;
		var sex = data.sex;
		//验证玩家状态
		db.get_room_id_of_user(userId,function(roomId){
			if(roomId != null){
				http.send(res,-1,"user is playing in room now.");
				return;
			}
			db.get_punish_list(function(row){//zyh
				if(row){
					for(var i=0;i<row.length;++i){
						if(userId == row[i].punish_id){
							console.log(" in punish list !!!");
							return;
						}
					}
				}
				//创建房间
				room_service.createRoom(account,userId,conf,function(err,roomId){
					if(err == 0 && roomId != null){
						room_service.enterRoom(userId,name,sex,roomId,function(errcode,enterInfo){
							if(enterInfo){
								var ret = {
									roomid:roomId,
									ip:enterInfo.ip,
									port:enterInfo.port,
									token:enterInfo.token,
									time:Date.now()
								};
								ret.sign = crypto.md5(ret.roomid + ret.token + ret.time + config.ROOM_PRI_KEY);
								console.log('hall client_service create_private_room success');
								http.send(res,0,"ok",ret);
							}
							else{
								http.send(res,errcode,"room doesn't exist.");
							}
						});
					}
					else{
						http.send(res,err,"create failed.");					
					}
				});
			});
		});
	});
});

app.get('/enter_private_room',function(req,res){
	var data = req.query;
	var roomId = data.roomid;
	if(roomId == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}

	var account = data.account;

	db.get_user_data(account,function(data){
		if(data == null){
			http.send(res,-1,"system error");
			return;
		}
		var userId = data.userid;
		var name = data.name;
		var sex = data.sex;

		db.get_punish_list(function(row){//zyh
			if(row){
				for(var i=0;i<row.length;++i){
					if(userId == row[i].punish_id){
						console.log(" in punish list !!!");
						return;
					}
				}
			}
			//验证玩家状态
			//todo
			//进入房间
			room_service.enterRoom(userId,name,sex,roomId,function(errcode,enterInfo){
				if(errcode==0&&enterInfo){
					var ret = {
						roomid:roomId,
						ip:enterInfo.ip,
						port:enterInfo.port,
						token:enterInfo.token,
						time:Date.now()
					};
					ret.sign = crypto.md5(roomId + ret.token + ret.time + config.ROOM_PRI_KEY);
					http.send(res,0,"ok",ret);
				}
				else{
					http.send(res,errcode,"enter room failed.",enterInfo);
				}
			});
		});
	});
});

app.get('/get_history_list',function(req,res){
	var data = req.query;
	if(!check_account(req,res)){
		return;
	}
	var account = data.account;
	db.get_user_data(account,function(data){
		if(data == null){
			http.send(res,-1,"system error");
			return;
		}
		var userId = data.userid;
		db.get_user_history(userId,function(history){
			http.send(res,0,"ok",{history:history});
		});
	});
});

app.get('/get_games_of_room',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	if(uuid == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	db.get_games_of_room(uuid,function(data){
		console.log(data);
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_detail_of_game',function(req,res){
	var data = req.query;
	var uuid = data.uuid;
	var index = data.index;
	if(uuid == null || index == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	if(!check_account(req,res)){
		return;
	}
	db.get_detail_of_game(uuid,index,function(data){
		http.send(res,0,"ok",{data:data});
	});
});

app.get('/get_user_status',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var account = req.query.account;
	//db.get_gems(account,function(data){
	db.get_user_data(account,function(data){
		if(data != null){
			http.send(res,0,"ok",{gems:data.gems,coins:data.coins,yuanbaos:data.yuanbaos,coinsbank:data.coinsbank,yuanbaosbank:data.yuanbaosbank});	
		}
		else{
			http.send(res,1,"get gems failed.");
		}
	});
});

app.get('/get_user_game_results',function(req,res){
	if(!check_account(req,res)){
	 http.send(res,-1,"check account failed.");
		return;
	}
	var userId = req.query.userId;
	var moneyType = req.query.moneyType;
	var skip = req.query.skip;
	var limit = req.query.limit;
	if(!userId||!moneyType){
		http.send(res,-2,"wrong params");
		return;
	}
	if(!(skip>-1))
		skip=0;
	if(!(limit>-1))
		limit=10;
	db.get_user_game_result_count(userId,moneyType,function(err0,count){
		if(!err0){
			db.get_user_game_results(userId,moneyType,skip,limit,function(err1,datas){
				if(!err1){
					http.send(res,0,"ok",{results:datas,skip:skip,limit:limit,count:count});
				}else{
					http.send(res,1,"get user game results failed.");
				}
			});
		}else{
			http.send(res,1,"get user game result count failed.");
		}
	});
});

app.get('/bank_save_coins',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var userId = req.query.userId;
	var money = req.query.money;
	db.bank_save_coins(userId,money,function(err){
		if(err){
			http.send(res,1,err);
		}
		else{
			http.send(res,0,"ok");	
		}
	});
});

app.get('/bank_save_yuanbaos',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var userId = req.query.userId;
	var money = req.query.money;
	db.bank_save_yuanbaos(userId,money,function(err){
		if(err){
			http.send(res,1,err);
		}
		else{
			http.send(res,0,"ok");	
		}
	});
});

app.get('/bank_draw_coins',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var userId = req.query.userId;
	var money = req.query.money;
	db.bank_draw_coins(userId,money,function(err){
		if(err){
			http.send(res,1,err);
		}
		else{
			http.send(res,0,"ok");	
		}
	});
});

app.get('/bank_draw_yuanbaos',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var userId = req.query.userId;
	var money = req.query.money;
	db.bank_draw_yuanbaos(userId,money,function(err){
		if(err){
			http.send(res,1,err);
		}
		else{
			http.send(res,0,"ok");	
		}
	});
});

app.get('/get_message',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var type = req.query.type;
	
	if(type == null){
		http.send(res,-1,"parameters don't match api requirements.");
		return;
	}
	
	var version = req.query.version;
	db.get_message(type,version,function(data){
		if(data != null){
			http.send(res,0,"ok",{msg:data.msg,version:data.version});	
		}
		else{
			http.send(res,1,"get message failed.");
		}
	});
});

app.get('/get_marquee_message',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed.");
		return;
	}
	db.get_config('marqueeMessage',function(err,str){
		if(err||!str){
			http.send(res,1,"get message failed.");
		}
		else{
			http.send(res,0,"ok",{msg:str});
		}
	});
});

app.get('/is_server_online',function(req,res){
	if(!check_account(req,res)){
		return;
	}
	var ip = req.query.ip;
	var port = req.query.port;
	room_service.isServerOnline(ip,port,function(isonline){
		var ret = {
			isonline:isonline
		};
		http.send(res,0,"ok",ret);
	}); 
});

app.get('/daily_sign_in_infos',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	var userId = req.query.userId;
	
	if(!userId){
		http.send(res,-1,"no userid");
		return;
	}
	db.get_config('dailySignIn', function (err,str) {
		var dailySignIn = JSON.parse(str);
		db.get_last_user_get_gift(userId, 'dailySignIn', function (err0, signInInfo) {
			if (err0) {
				http.send(res, -2, "get last user sign in failed.");
			}
			else {
				var signedNo =-1;//已经签过的号
				var seriesNo =-1;//现在可以签的号
				if (signInInfo) {
					var startMoment = moment(signInInfo.createTime).add(1, 'days').startOf('day');
					var endMoment = moment(signInInfo.createTime).add(1, 'days').endOf('day');
					var nowMoment = moment();
					if(signInInfo.seriesNo==dailySignIn.gifts.length-1){ //之前已经签满了
						if(nowMoment>=startMoment){ //现在可以签了，从头开始签
							signedNo = -1;
							seriesNo = 0;
						}else{//还没到可签日期，显示已经签满
							signedNo = dailySignIn.gifts.length-1;
							seriesNo = -1;
						}
					}else{
						if(nowMoment<startMoment){//之前已经签到，现在还没到新的签到时间
							signedNo = signInInfo.seriesNo;
							seriesNo = -1;
						}else if(nowMoment>endMoment){ //之前已经签到，但是超过了一天，现在要从头开始
							signedNo = -1;
							seriesNo = 0;
						}else{ //正常接着签到
							signedNo = signInInfo.seriesNo;
							seriesNo = signInInfo.seriesNo + 1;
						}
					}
				} else {
					//从来没有签到的
					signedNo = -1;
					seriesNo = 0;
				}
				http.send(res, 0, "ok", {config:dailySignIn,signedNo:signedNo, seriesNo:seriesNo });
				return;
			}
		});
	});
});

app.get('/daily_sign_in',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	var userId = req.query.userId;
	
	if(!userId){
		http.send(res,-1,"no userid");
		return;
	}
	db.get_config('dailySignIn', function (err,str) {
		if(err||typeof str!='string'){
			http.send(res,-3,"get dailySignIn config error");
			return;
		}
		var dailySignIn = JSON.parse(str);
		db.get_last_user_get_gift(userId, 'dailySignIn', function (err0, signInInfo) {
			if (err0) {
				http.send(res, -2, "get last user sign in failed.");
			}
			else {
				var seriesNo = -1;
				if (signInInfo) {
					var startMoment = moment(signInInfo.createTime).add(1, 'days').startOf('day');
					var endMoment = moment(signInInfo.createTime).add(1, 'days').endOf('day');
					var nowMoment = moment();
					if (nowMoment >= startMoment && nowMoment <= endMoment) {//正常签到
						seriesNo = (signInInfo.seriesNo + 1)%dailySignIn.gifts.length;
					}else if(nowMoment > endMoment){//错过签到的从头开始签
						seriesNo = 0;
					}
				} else {
					seriesNo = 0;
				}
				if (seriesNo >= 0&&seriesNo<dailySignIn.gifts.length) {
					http.send(res, 0, "ok", { seriesNo:seriesNo,gift:dailySignIn.gifts[seriesNo]});
					//发放奖品
					db.sendGiftToUser(userId,'dailySignIn',seriesNo,dailySignIn.gifts[seriesNo],function(){});
				}else{
					http.send(res,1,"have signined.");
				}
			}
		});
	});
});
//获取救济金信息
app.get('/dailyJiuJiJinInfo',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	db.get_user_data(req.query.account,function(user){
		var userId = user.userid;
		db.get_config('dailyJiuJiJin', function (err,str) {
			if(err||typeof str!='string'){
				http.send(res,-3,"get dailyJiuJiJin config error");
				return;
			}
			var dailyJiuJiJin = JSON.parse(str);
			db.get_last_user_get_gift(userId, 'dailyJiuJiJin', function (err0, lastJiujiJin) {
				if (err0) {
					http.send(res, -2, "get last user sign in failed.");
				}
				else {
					var count = -1;
					var leftTime = 0;
					if (lastJiujiJin) {//以前有领取过
						var startMoment = moment().startOf('day');
						var lastMoment = moment(lastJiujiJin.createTime);
						if (lastMoment >= startMoment) {//今天有领取过
							count = lastJiujiJin.seriesNo + 1;
							if (count<dailyJiuJiJin.maxCount && moment() < lastMoment.add(dailyJiuJiJin.limitTime, 'seconds')) { //时间间隔没达到
								leftTime = dailyJiuJiJin.limitTime - parseInt((new Date().getTime() - lastJiujiJin.createTime.getTime()) / 1000);
								if (leftTime < 0) {
									leftTime = 0;
								}
							}
						}else{//今天还没有领取过
							count = 0;
						}
					} else {//从来都没有领取过
						count = 0;
					}
					var userTotalCoins = user.coins+user.coinsbank;
					var isEnabled = count<dailyJiuJiJin.maxCount && userTotalCoins<dailyJiuJiJin.limitCoins && leftTime == 0; 
					http.send(res, 0, "ok", {isEnabled:isEnabled, count: count,leftTime:leftTime,userTotalCoins:userTotalCoins,config:dailyJiuJiJin});
				}
			});
		});
	});
	
});
//领取救济金
app.get('/getDailyJiuJiJin',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	db.get_user_data(req.query.account,function(user){
		var userId = user.userid;
		db.get_config('dailyJiuJiJin', function (err,str) {
			if(err||typeof str!='string'){
				http.send(res,-3,"get dailyJiuJiJin config error");
				return;
			}
			var dailyJiuJiJin = JSON.parse(str);
			if((user.coins+user.coinsbank)>=dailyJiuJiJin.limitCoins){
				http.send(res,1,"coins must less than "+dailyJiuJiJin.limitCoins,{config:dailyJiuJiJin});
				return;
			}
			db.get_last_user_get_gift(userId, 'dailyJiuJiJin', function (err0, lastJiujiJin) {
				if (err0) {
					http.send(res, -2, "get last user sign in failed.");
				}
				else {
					var seriesNo = -1;
					if (lastJiujiJin) {//以前有领取过
						var startMoment = moment().startOf('day');
						var lastMoment = moment(lastJiujiJin.createTime);
						if (lastMoment >= startMoment) {//今天有领取过
							seriesNo = lastJiujiJin.seriesNo + 1;
							if(seriesNo>=dailyJiuJiJin.maxCount){ //领取次数超过限制
								http.send(res,1,"get count more than max count.",{config:dailyJiuJiJin});
								return;
							}
							if(moment()<lastMoment.add(dailyJiuJiJin.limitTime,'seconds')){ //时间间隔没达到
								http.send(res,5,'time limit '+dailyJiuJiJin.limitTime+' seconds',{config:dailyJiuJiJin});
								return;
							}
						}else{//今天还没有领取过
							seriesNo = 0;
						}
					} else {//从来都没有领取过
						seriesNo = 0;
					}
					http.send(res, 0, "ok", { seriesNo: seriesNo ,config:dailyJiuJiJin});
					//发放奖品
					db.sendGiftToUser(userId,'dailyJiuJiJin',seriesNo,dailyJiuJiJin.gift,function(){});
				}
			});
		});
	});
	
});

//获取抽奖设置
app.get('/chouJiangInfo',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	db.get_config('chouJiang', function (err, str) {
		if (err || typeof str != 'string') {
			http.send(res, -3, "get chouJiang config error");
			return;
		}
		var chouJiang = JSON.parse(str);
		http.send(res, 0, "ok", chouJiang);
	});
});

//抽奖
app.get('/chouJiang',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	db.get_user_data(req.query.account,function(user){
		var userId = user.userid;
		db.get_config('chouJiang', function (err,str) {
			if(err||typeof str!='string'){
				http.send(res,-3,"get chouJiang config error");
				return;
			}
			var chouJiangConfig = JSON.parse(str);
			if(chouJiangConfig.price.gems>0&&user.gems<chouJiangConfig.price.gems){
				http.send(res,1,"gems must more than "+chouJiangConfig.price.gems);
				return;
			}
			if(chouJiangConfig.price.coins>0&&user.coins<chouJiangConfig.price.coins){
				http.send(res,1,"coins must more than "+chouJiangConfig.price.coins);
				return;
			}
			if(chouJiangConfig.price.yuanbaos>0&&user.yuanbaos<chouJiangConfig.price.yuanbaos){
				http.send(res,1,"yuanbaos must more than "+chouJiangConfig.price.yuanbaos);
				return;
			}
			//扣钱
			if(chouJiangConfig.price.gems>0){
				db.add_user_gems(userId,null,-chouJiangConfig.price.gems,function(isSuccess){});
			}
			if(chouJiangConfig.price.coins>0){
				db.update_user_coins(userId,-chouJiangConfig.price.coins,function(err){});
			}
			if(chouJiangConfig.price.yuanbaos>0){
				db.update_user_yuanbaos(userId,-chouJiangConfig.price.yuanbaos,function(err){});
			}
			//抽奖
			var maxNum = 0;
			for(var i=0;i<chouJiangConfig.gifts.length;i++){
				maxNum += chouJiangConfig.gifts[i].rate;
			}
			var num = parseInt(Math.random()*maxNum);
			for(var i=0;i<chouJiangConfig.gifts.length;i++){
				num -= chouJiangConfig.gifts[i].rate;
				if(num<=0){ //中奖了
					var gift = chouJiangConfig.gifts[i];
					//发放奖品
					db.sendGiftToUser(userId,'chouJiang',0,gift,function(){});
					http.send(res, 0, "ok", {price:chouJiangConfig.price,giftIndex:i,gift:gift});
					return;
				}
			}
			http.send(res,1,"no gift");
			return;
		});
	});
	
});

//获取三公设置
app.get('/songGongRoomInfo',function(req,res){
	// if(!check_account(req,res)){
	// 	http.send(res,-1,"check account failed");
	// 	return;
	// }
	db.get_config('sanGongRoom', function (err, str) {
		if (err || typeof str != 'string') {
			http.send(res, -3, "get sanGongRoom config error");
			return;
		}
		var sanGongRoom = JSON.parse(str);
		http.send(res, 0, "ok", sanGongRoom);
	});
});

//获取商城信息
app.get('/shop',function(req,res){
	db.get_config('shop', function (err, str) {
		if (err || typeof str != 'string') {
			http.send(res, -3, "get shop config error");
			return;
		}
		var shop = JSON.parse(str);
		for(var i=0;i<shop.length;i++){
			for(var j=0;j<shop[i].items.length;j++){
				shop[i].items[j].index=j;
			}
		}
		http.send(res, 0, "ok", {goodTypes:shop,url:configs.web_server().serverRootUrl+'/payment/gotoPay'});
	});
});

//钻石兑换金币
app.get('/gems2coins',function(req,res){
	if(!check_account(req,res)){
		http.send(res,-1,"check account failed");
		return;
	}
	var index = req.query.index;
	db.get_config('shop', function (err, str) {
		if (err || typeof str != 'string') {
			http.send(res, -3, "get shop config error");
			return;
		}
		var shop = JSON.parse(str);
		var exchangeInfo = null;
		for(var i=0;i<shop.length;i++){
			var goodType = shop[i];
			if(goodType.type=='gems2coins'){
				exchangeInfo = goodType.items[index];
				break;
			}
		}
		if (!exchangeInfo) {
			http.send(res, -2, "invalid params: index");
			return;
		}

		db.get_user_data(req.query.account, function (user) {
			var userId = user.userid;
			if (user.gems < exchangeInfo.price) {
				http.send(res, -4, "have no enough gems.");
				return;
			}
			//扣钱
			db.add_user_gems(userId, null, -exchangeInfo.price, function (isSuccess) {
				if (isSuccess) {
					db.update_user_coins(userId, exchangeInfo.coins, function (err) {
						if (err) {
							http.send(res, -5, "add coins failed.");
							return;
						} else {
							http.send(res, 0, "ok");
							return;
						}
					});
				} else {
					http.send(res, -6, "cut gems failed.");
					return;
				}
			});
		});
	});
});

app.get('/add_agency',function(req,res){
	var userid = req.query.userid;
	var agencyname = req.query.agencyname;
	db.get_agency_Info_ByID(agencyname,function(err,row){
		if(err){
			http.send(res, -2, "没有这个代理");
		}
		else{
			db.get_useragency(userid,function(row){
				if(row.agency_userName == null){
					db.add_useragency(userid,agencyname,function(err,rows){
						if(err){
							http.send(res, -3, "出现未知的错误");
							return;
						}
						if(rows){
							http.send(res, 0, "ok");
						}
					});
				}
				else{
					http.send(res, -1, "you have agency");
				}
			});
		}
	});

});

exports.start = function($config){
	config = $config;
	app.listen(config.CLEINT_PORT);
	console.log("client service is listening on port " + config.CLEINT_PORT);
};