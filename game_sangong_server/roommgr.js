var db = require('../utils/db');
var userMgr = require("./usermgr");

var rooms = {};
var creatingRooms = {};

var userLocation = {};
var totalRooms = 0;

//三公金币场
var freeSgSeatNum = 8;

//var FreeSgManager = require("./gamemgr_freeSG");
var freeSgManager = null;//new FreeSgManager();

//三公私房模式
var SG_Ju_Shu = [12,24,120];
var SG_Seat_Num = [6,8];

var SanGongManager = require("./gamemgr");
var sanGongManager = new SanGongManager();

function generateRoomId(){
	var roomId = "";
	for(var i = 0; i < 6; ++i){
		roomId += Math.floor(Math.random()*10);
	}
	return roomId;
}

function constructRoomFromDb(dbdata){
	var roomInfo = {
		uuid:dbdata.uuid,
		id:dbdata.id,
		numOfGames:dbdata.num_of_turns,
		createTime:dbdata.create_time,
		nextButton:dbdata.next_button,
		seats:[],
		conf:JSON.parse(dbdata.base_info),
		userMap:{},
		users:[],
		results:[]//用于存放每局的userScoreMap,记录每局每个user的得分
	};

	if(roomInfo.conf.type == "sangong"){
		roomInfo.gameMgr = sanGongManager;
		for(var i=0;i<roomInfo.conf.seatNum;i++){
			roomInfo.seats.push({
				seatIndex:i,
				seatUserId:0
			});
		}
	}
	else{
		roomInfo.gameMgr = freeSgManager;
	}

	var roomId = roomInfo.id;
	rooms[roomId] = roomInfo;
	totalRooms++;
	return roomInfo;
}

function create(creator,cost,ip,port,roomConf,config,callback) {
	var roomId = generateRoomId();
	if (rooms[roomId] != null || creatingRooms[roomId] != null) {
		create(roomConf,config,callback);
	}
	else {
		creatingRooms[roomId] = true;
		db.is_room_exist(roomId, function (ret) {

			if (ret) {
				delete creatingRooms[roomId];
				create(roomConf,config,callback);
			}
			else {
				var createTime = Math.ceil(Date.now() / 1000);
				var roomInfo = {
					uuid: "",
					id: roomId,
					numOfGames: 0,
					createTime: createTime,
					seats: [],
					userMap: {},
					users: [],
					results: []//用于存放每局的userScoreMap,记录每局每个user的得分
				};
				if (roomConf.type == "sangong") {
					var yuanbaosLimit = config.yuanbaosLimit[roomConf.yuanbao];
					roomInfo.conf = {
						type: roomConf.type,
						minYuanbaos: yuanbaosLimit,
						stakes:[yuanbaosLimit,yuanbaosLimit*5,yuanbaosLimit*10,yuanbaosLimit*20,yuanbaosLimit*50],
						maxGames: SG_Ju_Shu[roomConf.jushu],
						seatNum: SG_Seat_Num[roomConf.zuowei],
						creator: creator,
						cost:cost,
						tipYuanbaos:config.tipYuanbaos,
						rate:config.rate,
					}
					roomInfo.gameMgr = sanGongManager;
				} else {
					roomInfo.conf = {
						type: roomConf.type,
						seatNum: freeSgSeatNum,
					}
					roomInfo.gameMgr = freeSgManager;
				}

				console.log(roomInfo.conf);

				for (var i = 0; i < roomInfo.conf.seatNum; ++i) {
					roomInfo.seats.push({
						seatIndex: i,
						seatUserId: 0
					});
				}

				//写入数据库
				//var conf = roomInfo.conf;
				db.create_room(roomInfo.id, roomInfo.conf, ip, port, createTime, function (uuid) {
					delete creatingRooms[roomId];
					if (uuid != null) {
						roomInfo.uuid = uuid;
						console.log(uuid);
						rooms[roomId] = roomInfo;
						totalRooms++;
						callback(0, roomId);
					}
					else {
						callback(3, null);
					}
				});
			}
		});
	}
}

exports.createRoom = function(creator,roomConf,gems,ip,port,callback){
	if(roomConf.type == null){
		callback(1,null);
		return;
	}
	if(roomConf.type=='sangong'){
		db.get_config('sanGongRoom',function(err,str){
			if(err||typeof str != 'string'){
				callback(500,null);
				return;
			}else{
				var config = JSON.parse(str);
				if (!(roomConf.jushu >= 0 && roomConf.jushu < SG_Ju_Shu.length)) {
					roomConf.jushu = 0;
				}
				if (!(roomConf.zuowei >= 0 && roomConf.zuowei < SG_Seat_Num.length)) {
					roomConf.zuowei = 0;
				}
				if(!(roomConf.yuanbao >= 0 && roomConf.yuanbao < config.yuanbaosLimit.length)){
					roomConf.yuanbao = 0;
				}
		
				var cost = SG_Ju_Shu[roomConf.jushu]==12?config.costGems12:config.costGems24;
				if(cost > gems){
					callback(2222,null);
					return;
				}
				create(creator,cost,ip,port,roomConf,config,callback);
			}
		});
	}
};

exports.destroy = function(roomId){
	var roomInfo = rooms[roomId];
	if(roomInfo == null){
		return;
	}

	for(var i = 0; i < roomInfo.users.length; i++){
		var userId = roomInfo.users[i].userId;
		if(userId > 0){
			delete userLocation[userId];
		}
	}
	delete rooms[roomId];
	totalRooms--;
	db.delete_room(roomId,function(){
		db.clear_room_id_of_user(roomId);
	});
}

exports.getTotalRooms = function(){
	return totalRooms;
}

exports.getRoom = function(roomId){
	return rooms[roomId];
};

exports.isCreator = function(roomId,userId){
	var roomInfo = rooms[roomId];
	if(roomInfo == null){
		return false;
	}
	return roomInfo.conf.creator == userId;
};

function takeSeat(userId,userName, sex,room, cb) {
	if (exports.getUserRoom(userId) == room.id) {
		//已存在
		cb(0);
		return;
	}
	//房间已满（暂时没有限制房间人数）
	//cb(1);	
	//return;
	db.get_user_data_by_userid(userId, function (data) {
		if (data) {
			var user = { userId: userId, name: userName, sex: sex, coins: data.coins, yuanbaos: data.yuanbaos, coinsbank: data.coinsbank, yuanbaosbank: data.yuanbaosbank, gems: data.gems };
			if (user.yuanbaos < room.conf.minYuanbaos) {
				//元宝不够
				cb(3);
				return;
			}
			room.userMap[userId] = user;
			room.users.push(user);
			userLocation[userId] = { roomId: room.id };
			cb(0);
			return;
		} else {
			cb(1);
			return;
		}
	});
}

exports.enterRoom = function(roomId,userId,userName,sex,callback){
	var room = rooms[roomId];
	if(room){
		takeSeat(userId,userName, sex,room,function(ret){
			callback(ret);
		});
	}
	else{
		db.get_room_data(roomId,function(dbdata){
			if(dbdata == null){
				//找不到房间
				callback(2);
			}
			else{
				//construct room.
				room = constructRoomFromDb(dbdata);
				rooms[roomId]=room;
				//
				takeSeat(userId,userName, sex,room, function (ret) {
					callback(ret);
				});
			}
		});
	}
};

exports.getUserRoom = function(userId){
	var location = userLocation[userId];
	if(location != null){
		return location.roomId;
	}
	return null;
};

exports.seatDown = function(userId,seatIndex){
	var roomId = exports.getUserRoom(userId);
	if(!roomId){
		return;
	}
	var room = rooms[roomId];
	if(!room){
		return;
	}
	if(seatIndex<0||seatIndex>=room.seats.length){
		return;
	}

	var mySeat = null;
	for(var i = 0;i<room.seats.length;i++){
		if(room.seats[i].seatUserId == userId){
			mySeat = room.seats[i];
			break;
		}
	}

	var downSeat = room.seats[seatIndex];
	
	if(downSeat.seatUserId==0){//座位上没有人，直接坐下
		if(mySeat){
			mySeat.seatUserId = 0;
		}
		downSeat.seatUserId=userId;
		userMgr.broacast(roomId,'room_seatdown_notify_push',{userId:userId,seatIndex:seatIndex});
	}else{ //座位上有人，比较谁有钱
		if(mySeat==downSeat){
			return;
		}
		var seatUser = room.userMap[downSeat.seatUserId];
		var myUser = room.userMap[userId];
		var myMoney = room.conf.type=='sangong'?myUser.yuanbaos:myUser.coins;
		var seatMoney = room.conf.type=='sangong'?seatUser.yuanbaos:seatUser.coins;
		if(myMoney>seatMoney){ //更有钱的可以坐下
			downSeat.seatUserId=userId;
			userMgr.broacast(roomId,'room_seatdown_notify_push',{userId:userId,seatIndex:seatIndex});
			if(mySeat){ //如果要求者已经有座位，则换作
				mySeat.seatUserId=seatUser.userId;
				userMgr.broacast(roomId,'room_seatdown_notify_push',{userId:seatUser.userId,seatIndex:mySeat.seatIndex});
			}
		}else{
			userMgr.sendMsg(userId,'room_seatdown_notify_push',{error:'needMoreMoney'});
		}
	}
};

exports.getUserLocations = function(){
	return userLocation;
};

exports.exitRoom = function(userId){
	var location = userLocation[userId];
	if(location == null)
		return;

	var roomId = location.roomId;
	var room = rooms[roomId];
	delete userLocation[userId];
	if(room == null) {
		return;
	}
	room.users.splice(room.users.indexOf(room.userMap[userId]),1);
	delete room.userMap[userId];
	for(var i = 0;i<room.seats.length;i++){
		var seat = room.seats[i];
		if(seat.seatUserId==userId){
			seat.seatUserId = 0;
		}
	}
	db.set_room_id_of_user(userId,null,function(result){
		if(result){
			console.log('EXIT ROOM: user['+userId+'] room['+roomId+']');
		}
	});
};