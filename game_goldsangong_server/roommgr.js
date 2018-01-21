var db = require('../utils/db');
var userMgr = require("./usermgr");
var config = require('./configs');

var rooms = {};

var userLocation = {};
var totalRooms = 0;

var GoldSanGongManager = require("./gamemgr");
var goldSanGongManager = new GoldSanGongManager();

function buildUuid (){
	var now=new Date();
	var str ='A'+now.getFullYear()+(now.getMonth()>8?(now.getMonth()+1):('0'+(now.getMonth()+1)))+(now.getDate()>9?now.getDate():('0'+now.getDate()))
	+(now.getHours()>9?now.getHours():('0'+now.getHours()))+(now.getMinutes()>9?now.getMinutes():('0'+now.getMinutes()))
	+(now.getSeconds()>9?now.getSeconds():('0'+now.getSeconds()))
	+(now.getMilliseconds()>99?now.getMilliseconds():(now.getMilliseconds()>9?('0'+now.getMilliseconds()):('00'+now.getMilliseconds())))
	+parseInt(Math.random()*10)+parseInt(Math.random()*10);
	return str;
}

function create(ip, port, gameConfig) {
	var roomId = gameConfig.roomId;
	var createTime = Math.ceil(Date.now() / 1000);
	var roomInfo = {
		uuid: buildUuid(),
		id: roomId,
		numOfGames: 0,
		createTime: createTime,
		seats: [],
		userMap: {},
		users: [],
	};
	roomInfo.conf = {
		type: 'goldsangong',
		stakes: gameConfig.stakeCoins,
		seatNum: gameConfig.seatNum,
		tipCoins: gameConfig.tipCoins,
		rate: gameConfig.rate,
	}
	roomInfo.gameMgr = goldSanGongManager;

	for (var i = 0; i < roomInfo.conf.seatNum; ++i) {
		roomInfo.seats.push({
			seatIndex: i,
			seatUserId: 0
		});
	}
	rooms[roomId] = roomInfo;
}

var createRoom = function (ip, port) {
	db.get_config('goldSanGongRoom', function (err, str) {
		if (err || typeof str != 'string') {
			throw 'get game config ERROR'
		} else {
			var gameConfig = JSON.parse(str);
			create(ip, port, gameConfig);
		}
	});
};

exports.init = function(){
	createRoom(config.CLIENT_IP,config.CLIENT_PORT);
}

exports.getTotalRooms = function () {
	return totalRooms;
}

exports.getRoom = function (roomId) {
	return rooms[roomId];
};

function takeSeat(userId, userName, sex, room, cb) {
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

exports.enterRoom = function (roomId, userId, userName, sex, callback) {
	var room = rooms[roomId];
	if (room) {
		takeSeat(userId, userName, sex, room, function (ret) {
			callback(ret);
		});
	}
	else {
		//找不到房间
		callback(2);
	}
};

exports.getUserRoom = function (userId) {
	var location = userLocation[userId];
	if (location != null) {
		return location.roomId;
	}
	return null;
};

exports.seatDown = function (userId, seatIndex) {
	var roomId = exports.getUserRoom(userId);
	if (!roomId) {
		return;
	}
	var room = rooms[roomId];
	if (!room) {
		return;
	}
	if (seatIndex < 0 || seatIndex >= room.seats.length) {
		return;
	}

	var mySeat = null;
	for (var i = 0; i < room.seats.length; i++) {
		if (room.seats[i].seatUserId == userId) {
			mySeat = room.seats[i];
			break;
		}
	}

	var downSeat = room.seats[seatIndex];

	if (downSeat.seatUserId == 0) {//座位上没有人，直接坐下
		if (mySeat) {
			mySeat.seatUserId = 0;
		}
		downSeat.seatUserId = userId;
		userMgr.broacast(roomId, 'room_seatdown_notify_push', { userId: userId, seatIndex: seatIndex });
	} else { //座位上有人，比较谁有钱
		if (mySeat == downSeat) {
			return;
		}
		var seatUser = room.userMap[downSeat.seatUserId];
		var myUser = room.userMap[userId];
		var myMoney = myUser.coins;
		var seatMoney = seatUser.coins;
		if (myMoney > seatMoney) { //更有钱的可以坐下
			downSeat.seatUserId = userId;
			userMgr.broacast(roomId, 'room_seatdown_notify_push', { userId: userId, seatIndex: seatIndex });
			if (mySeat) { //如果要求者已经有座位，则换作
				mySeat.seatUserId = seatUser.userId;
				userMgr.broacast(roomId, 'room_seatdown_notify_push', { userId: seatUser.userId, seatIndex: mySeat.seatIndex });
			}
		} else {
			userMgr.sendMsg(userId, 'room_seatdown_notify_push', { error: 'needMoreMoney' });
		}
	}
};

exports.getUserLocations = function () {
	return userLocation;
};

exports.exitRoom = function (userId) {
	var location = userLocation[userId];
	if (location == null)
		return;

	var roomId = location.roomId;
	var room = rooms[roomId];
	delete userLocation[userId];
	if (room == null) {
		return;
	}
	room.users.splice(room.users.indexOf(room.userMap[userId]), 1);
	delete room.userMap[userId];
	for(var i = 0;i<room.seats.length;i++){
		var seat = room.seats[i];
		if(seat.seatUserId==userId){
			seat.seatUserId = 0;
		}
	}
};