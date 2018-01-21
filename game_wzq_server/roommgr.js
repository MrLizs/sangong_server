var db = require('../utils/db');

var rooms = {};
var creatingRooms = {};

var userLocation = {};
var totalRooms = 0;

var GameManager = require("./gamemgr");
var gameManager = new GameManager();

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
		userMap:{},
		conf:JSON.parse(dbdata.base_info)
	};

	roomInfo.gameMgr = gameManager;

	var roomId = roomInfo.id;

	for(var i = 0; i < dbdata.userInfos.length; ++i){
		var userInfo = dbdata.userInfos[i];
		var s = {};
		roomInfo.seats.push(s);
		s.userId = userInfo.userId;
		s.score = userInfo.score;
		s.name = userInfo.name;
		s.sex = userInfo.sex;
		s.ready = false;
		s.seatIndex = userInfo.seatNum;
		s.results = [];

		if(s.userId > 0){
			userLocation[s.userId] = {
				roomId:roomId,
				seatIndex:userInfo.seatNum
			};
		}
	}
	rooms[roomId] = roomInfo;
	totalRooms++;
	return roomInfo;
}

exports.createRoom = function(creator,roomConf,gems,ip,port,callback){
	if(roomConf.type == null){
		callback(1,null);
		return;
	}

	var fnCreate = function(config){
		var roomId = generateRoomId();
		if(rooms[roomId] != null || creatingRooms[roomId] != null){
			fnCreate(config);
		}
		else{
			creatingRooms[roomId] = true;
			db.is_room_exist(roomId, function(ret) {

				if(ret){
					delete creatingRooms[roomId];
					fnCreate(config);
				}
				else{
					var createTime = Math.ceil(Date.now()/1000);
					var roomInfo = {
						uuid:"",
						id:roomId,
						numOfGames:0,
						createTime:createTime,
						nextButton:0,
						seats:[],
						userMap:{},
						conf:{
							type:roomConf.type,
							creator:creator,
							rate:config.rate,
						}
					};
					roomInfo.gameMgr = gameManager;
					console.log(roomInfo.conf);
					var userInfos = [];
					for(var i = 0; i < 2; ++i){
						roomInfo.seats.push({
							userId:0,
							score:0,
							name:"",
							sex:0,
							ready:false,
							seatIndex:i,
							results:[]
						});
						userInfos.push({
							userId:0,
							seatNum:i,
						});
					}

					//写入数据库
					//var conf = roomInfo.conf;
					db.create_room(roomInfo.id,roomInfo.conf,ip,port,createTime,function(uuid){
						delete creatingRooms[roomId];
						if(uuid != null){
							roomInfo.uuid = uuid;
							console.log(uuid);
							rooms[roomId] = roomInfo;
							totalRooms++;
							callback(0,roomId);
						}
						else{
							callback(3,null);
						}
					},userInfos);
				}
			});
		}
	}

	db.get_config('wzqRoom',function(err,str){
		if(err||typeof str != 'string'){
			callback(500,null);
			return;
		}else{
			var config = JSON.parse(str);
			fnCreate(config);
		}
	});
};

exports.destroy = function(roomId){
	var roomInfo = rooms[roomId];
	if(roomInfo == null){
		return;
	}

	for(var i = 0; i < roomInfo.seats.length; ++i){
		var userId = roomInfo.seats[i].userId;
		if(userId > 0){
			delete userLocation[userId];
			db.set_room_id_of_user(userId,null);
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

exports.enterRoom = function(roomId,userId,userName,sex,callback){
	var fnTakeSeat = function(room,cb){
		if(exports.getUserRoom(userId) == roomId){
			//已存在
			cb(0);
			return;
		}

		db.get_user_data_by_userid(userId,function(data){
			var user = { userId: userId, name: userName, sex: sex ,coins:data.coins,yuanbaos:data.yuanbaos,coinsbank:data.coinsbank,yuanbaosbank:data.yuanbaosbank,gems:data.gems};
			room.userMap[userId]=user;
			for(var i = 0; i < room.seats.length; i++){
				var seat = room.seats[i];
				if(seat && seat.userId <= 0){
					seat.userId = userId;
					seat.name = userName;
					seat.sex = sex;
					userLocation[userId] = {
						roomId:roomId,
						seatIndex:i
					};
					//正常
					cb(0);
					return;
				}
			}
			//房间已满
			cb(1);
			return;	
		});
	}
	var room = rooms[roomId];
	if(room){
		fnTakeSeat(room,function(ret){
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
				//
				fnTakeSeat(room,function(ret){
					callback(ret);
				});
			}
		});
	}
};

exports.setReady = function(userId,value){
	var roomId = exports.getUserRoom(userId);
	if(roomId == null){
		return;
	}

	var room = exports.getRoom(roomId);
	if(room == null){
		return;
	}

	var seatIndex = exports.getUserSeat(userId);
	if(seatIndex == null){
		return;
	}

	var s = room.seats[seatIndex];
	s.ready = value;
}

exports.isReady = function(userId){
	var roomId = exports.getUserRoom(userId);
	if(roomId == null){
		return;
	}

	var room = exports.getRoom(roomId);
	if(room == null){
		return;
	}

	var seatIndex = exports.getUserSeat(userId);
	if(seatIndex == null){
		return;
	}

	var s = room.seats[seatIndex];
	return s.ready;	
}


exports.getUserRoom = function(userId){
	var location = userLocation[userId];
	if(location != null){
		return location.roomId;
	}
	return null;
};

exports.getUserSeat = function(userId){
	var location = userLocation[userId];
	//console.log(userLocation[userId]);
	if(location != null){
		return location.seatIndex;
	}
	return null;
};

exports.getUserLocations = function(){
	return userLocation;
};

exports.exitRoom = function(userId){
	var location = userLocation[userId];
	if(location == null)
		return;

	var roomId = location.roomId;
	var seatIndex = location.seatIndex;
	var room = rooms[roomId];
	delete userLocation[userId];
	if(room == null || seatIndex == null) {
		return;
	}

	var seat = room.seats[seatIndex];
	if(seat){
		seat.userId = 0;
		seat.name = "";
	}

	delete room.userMap[userId];
	var numOfPlayers = 0;
	for(var i = 0; i < room.seats.length; ++i){
		if(room.seats[i].userId > 0){
			numOfPlayers++;
		}
	}
	
	db.set_room_id_of_user(userId,null);

	if(numOfPlayers == 0){
		exports.destroy(roomId);
	}
};