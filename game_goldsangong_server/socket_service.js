var crypto = require('../utils/crypto');
var db = require('../utils/db');

var tokenMgr = require('./tokenmgr');
var roomMgr = require('./roommgr');
var userMgr = require('./usermgr');
var io = null;
exports.start = function(config,mgr){
	io = require('socket.io')(config.CLIENT_PORT, {pingInterval: 15000, pingTimeout: 2500});
	
	io.sockets.on('connection',function(socket){

		socket.on('login', function (data) {
			if (typeof data === 'string') {
				try {
					data = JSON.parse(data);
				} catch (e) {
					console.warn('login ERROR :JSON.parse(data)');
					return;
				}
			}else{
				return;
			}
			if (socket.userId != null) {
				//已经登陆过的就忽略
				return;
			}
			var token = data.token;
			var roomId = data.roomid;
			var time = data.time;
			var sign = data.sign;

			console.log(roomId);
			console.log(token);
			console.log(time);
			console.log(sign);

			
			//检查参数合法性
			if(token == null || roomId == null || sign == null || time == null){
				console.log(1);
				socket.emit('login_result',{errcode:1,errmsg:"invalid parameters"});
				return;
			}
			
			//检查参数是否被篡改
			var md5 = crypto.md5(roomId + token + time + config.ROOM_PRI_KEY);
			if(md5 != sign){
				console.log(2);
				socket.emit('login_result',{errcode:2,errmsg:"login failed. invalid sign!"});
				return;
			}
			
			//检查token是否有效
			if(tokenMgr.isTokenValid(token)==false){
				console.log(3);
				socket.emit('login_result',{errcode:3,errmsg:"token out of time."});
				return;
			}
			
			//检查房间合法性
			var userId = tokenMgr.getUserID(token);
			if(!userId){
				return;
			}
			var roomId = roomMgr.getUserRoom(userId);

			userMgr.bind(userId,socket);
			socket.userId = userId;

			//返回房间信息
			var roomInfo = roomMgr.getRoom(roomId);

			roomInfo.userMap[userId].ip = socket.handshake.address;

			//通知前端
			var ret = {
				errcode:0,
				errmsg:"ok",
				data:{
					roomid:roomInfo.id,
					conf:roomInfo.conf,
					numofgames:roomInfo.numOfGames,
					//users:roomInfo.users
				}
			};
			socket.emit('login_result',ret);
			socket.gameMgr = roomInfo.gameMgr;
			socket.conf = roomInfo.conf;

			socket.emit('login_finished',{gameType:roomInfo.conf.type});
			console.log('login_finished user['+userId+'] room['+roomId+']')

		});
		
		socket.on('enterGame',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			if(!socket.gameMgr){
				return;
			}
			socket.gameMgr.enterGame(userId);
		});

		socket.on('startGame',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			socket.gameMgr.startGame(userId);
		});
		
		socket.on('stopGame', function (data) {
			var userId = socket.userId;
			if(userId == null){
				return;
			}
			socket.gameMgr.stopGame(userId);
		});
		
		//聊天
		socket.on('chat',function(data){
			if(socket.userId == null){
				return;
			}
			var chatContent = data;
			userMgr.broacastInRoom('chat_push',{sender:socket.userId,content:chatContent},socket.userId,true);
		});
		
		//快速聊天
		socket.on('quick_chat',function(data){
			if(socket.userId == null){
				return;
			}
			var chatId = data;
			userMgr.broacastInRoom('quick_chat_push',{sender:socket.userId,content:chatId},socket.userId,true);
		});
		
		//语音聊天
		socket.on('voice_msg',function(data){
			if(socket.userId == null){
				return;
			}
			console.log(data.length);
			userMgr.broacastInRoom('voice_msg_push',{sender:socket.userId,content:data},socket.userId,true);
		});
		
		//表情
		socket.on('emoji',function(data){
			if(socket.userId == null){
				return;
			}
			var phizId = data;
			userMgr.broacastInRoom('emoji_push',{sender:socket.userId,content:phizId},socket.userId,true);
		});
		
		//语音使用SDK不出现在这里
		
		//退出房间
		socket.on('exit',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			// //如果游戏已经开始，则不可以
			// if(socket.gameMgr.hasBegan(roomId)){
			// 	return;
			// }

			// //如果是房主，则只能走解散房间
			// if(roomMgr.isCreator(userId)){
			// 	return;
			// }
			
			//通知其它玩家，有人退出了房间
			userMgr.broacastInRoom('exit_notify_push',userId,userId,false);
			
			roomMgr.exitRoom(userId);
			userMgr.del(userId);
			
			socket.emit('exit_result');
			socket.disconnect();
		});

		//断开链接
		socket.on('disconnect',function(){
			var userId = socket.userId;
			if(!userId){
				return;
			}
			var data = {
				userid:userId,
				online:false
			};

			//通知房间内其它玩家
			userMgr.broacastInRoom('user_state_push',data,userId);

			//清除玩家的在线信息
			roomMgr.exitRoom(userId);
			userMgr.del(userId);
			socket.userId = null;
		});
		
		socket.on('game_ping',function(data){
			var userId = socket.userId;
			if(!userId){
				return;
			}
			//console.log('game_ping');
			socket.emit('game_pong');
		});

		//下注
		socket.on('stake',function(data){
			if(socket.userId == null){
				return;
			}
			if(typeof(data)=='string'){
				data = JSON.parse(data);
			}

			socket.gameMgr.stake(socket.userId,data);
		});

		//存金币
		socket.on('bank_save_coins',function(data){
			if(socket.userId == null){
				return;
			}
			var coins = parseInt(data);
			if(!coins){
				return;
			}
			socket.gameMgr.bankSaveCoins(socket.userId,coins);
		});
		//取金币
		socket.on('bank_draw_coins',function(data){
			if(socket.userId == null){
				return;
			}
			var coins = parseInt(data);
			if(!coins){
				return;
			}
			socket.gameMgr.bankDrawCoins(socket.userId,coins);
		});
		//存元宝
		socket.on('bank_save_yuanbaos',function(data){
			if(socket.userId == null){
				return;
			}
			var yuanbaos = parseInt(data);
			if(!yuanbaos){
				return;
			}
			socket.gameMgr.bankSaveYuanbaos(socket.userId,yuanbaos);
		});
		//取元宝
		socket.on('bank_draw_yuanbaos',function(data){
			if(socket.userId == null){
				return;
			}
			var yuanbaos = parseInt(data);
			if(!yuanbaos){
				return;
			}
			socket.gameMgr.bankDrawYuanbaos(socket.userId,yuanbaos);
		});

		//找个椅子坐下
		socket.on('seat_down', function (data) {
			if (socket.userId == null) {
				return;
			}
			var roomId = roomMgr.getUserRoom(socket.userId);
			if(roomId == null){
				return;
			}

			var seatIndex = parseInt(data);
			if(!(seatIndex>=0)){
				return;
			}

			roomMgr.seatDown(socket.userId, seatIndex);
		});

		//踢人出房间
		socket.on('kick',function(data){
			var userId = socket.userId;
			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}
			//如果不是房主，则不能踢人
			if(roomMgr.isCreator(roomId,userId) == false){
				return;
			}
			
			var kickUserId = parseInt(data);
			var kickSocket = userMgr.get(kickUserId);
			if(kickSocket){
				//通知其它玩家，有人被踢出了房间
				userMgr.broacast(roomId,'kick_notify_push',{kickedUserId:kickUserId});
				roomMgr.exitRoom(kickUserId);
				userMgr.del(kickUserId);
				kickSocket.emit('exit_result');
				kickSocket.disconnect();
			}else{
				userMgr.sendMsg(userId,'kick_notify_push',{error:'can not find user'});
			}
		});

		//打赏
		socket.on('tip',function(data){
			if(socket.userId == null){
				return;
			}
			socket.gameMgr.tip(socket.userId);
		});

		socket.on('get_room_history',function(data){
			if(socket.userId == null){
				return;
			}
			if(typeof(data)=='string'){
				data = JSON.parse(data);
			}
			// console.log("roomid" + data.roomid);
			if(!data.roomid){
				return;
			}
			console.log('get_room_history')
			var history = roomMgr.getRoomHistory(data.roomid);
			userMgr.sendMsg(socket.userId,'getRoomHistory_push',{'historyData':history});
		});
	});

	console.log("game server is listening on " + config.CLIENT_PORT);	
};