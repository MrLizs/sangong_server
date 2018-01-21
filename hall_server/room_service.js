var crypto = require('../utils/crypto');
var express = require('express');
var db = require('../utils/db');
var http = require('../utils/http');
var app = express();

var hallIp = null;
var config = null;
var rooms = {};
var serverMap = {};
var roomIdOfUsers = {};

//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

app.get('/register_gs',function(req,res){
	
	var ip = req.ip;
	var clientip = req.query.clientip;
	var clientport = req.query.clientport;
	var httpPort = req.query.httpPort;
	var load = req.query.load;
	var onlineCount = req.query.onlineCount;
	var roomCount = req.query.roomCount;
	var type = req.query.type;
	var id = clientip + ":" + clientport;

	if(serverMap[id]){
		var info = serverMap[id];
		if(info.clientport != clientport
			|| info.httpPort != httpPort
			|| info.ip != ip
		){
			console.log("duplicate gsid:" + id + ",addr:" + ip + "(" + httpPort + ")");
			http.send(res,1,"duplicate gsid:" + id);
			return;
		}
		info.load = load;
		info.onlineCount = onlineCount;
		info.roomCount = roomCount;
		http.send(res,0,"ok",{ip:ip});
		return;
	}
	serverMap[id] = {
		ip:ip,
		id:id,
		clientip:clientip,
		clientport:clientport,
		httpPort:httpPort,
		load:load,
		type:type,
		onlineCount:onlineCount,
		roomCount:roomCount
	};
	http.send(res,0,"ok",{ip:ip});
	console.log("game server registered.\n\tid:" + id + "\n\taddr:" + ip + "\n\thttp port:" + httpPort + "\n\tsocket clientport:" + clientport);

	var reqdata = {
		serverid:id,
		sign:crypto.md5(id+config.ROOM_PRI_KEY)
	};
	//获取服务器信息
	http.get(ip,httpPort,"/get_server_info",reqdata,function(ret,data){
		if(ret && data.errcode == 0){
			for(var i = 0; i < data.userroominfo.length; i += 2){
				var userId = data.userroominfo[i];
				var roomId = data.userroominfo[i+1];
			}
		}
		else{
			console.log(data.errmsg);
		}
	});
});

function chooseServer(type){
	var serverinfo = null;
	for(var s in serverMap){
		var info = serverMap[s];
		if (type && type != info.type) {
			continue;
		}
		if(serverinfo == null){
			serverinfo = info;			
		}
		else{
			if(serverinfo.load > info.load){
				serverinfo = info;
			}
		}
	}	
	return serverinfo;
}

exports.createRoom = function(account,userId,roomConf,fnCallback){
	var gameType = null;
	if(typeof roomConf == 'string'){
		try{
			var conf = JSON.parse(roomConf);
			gameType = conf.type;
		}catch(e){}
	}
	if(!gameType||gameType=='goldsangong'){
		fnCallback(100,null);
		return;
	}
	var serverinfo = chooseServer(gameType);
	if(serverinfo == null){
		fnCallback(101,null);
		return;
	}
	//db.get_gems(account,function(data){
	db.get_user_data(account,function(data){
		if(data != null){
			//2、请求创建房间
			var reqdata = {
				userid:userId,
				gems:data.gems,
				userInfo:data,
				conf:roomConf
			};
			reqdata.sign = crypto.md5(userId + roomConf + data.gems + config.ROOM_PRI_KEY);
			http.get(serverinfo.ip,serverinfo.httpPort,"/create_room",reqdata,function(ret,data){
				//console.log(data);
				if(ret){
					if(data.errcode == 0){
						fnCallback(0,data.roomid);
					}
					else{
						fnCallback(data.errcode,null);		
					}
					return;
				}
				fnCallback(102,null);
			});	
		}
		else{
			fnCallback(103,null);
		}
	});
};

exports.enterRoom = function(userId,name,sex,roomId,fnCallback){
	var reqdata = {
		userid:userId,
		name:name,
		sex:sex,
		roomid:roomId
	};
	reqdata.sign = crypto.md5(userId + name + roomId + config.ROOM_PRI_KEY);

	var checkRoomIsRuning = function(serverinfo,roomId,callback){
		var sign = crypto.md5(roomId + config.ROOM_PRI_KEY);
		http.get(serverinfo.ip,serverinfo.httpPort,"/is_room_runing",{roomid:roomId,sign:sign},function(ret,data){
			if(ret&&data){
				if(data.errcode == 0 && data.runing == true){
					callback(true);
				}
				else{
					callback(false);
				}
			}
			else{
				callback(false);
			}
		});
	}

	var enterRoomReq = function(serverinfo){
		http.get(serverinfo.ip,serverinfo.httpPort,"/enter_room",reqdata,function(ret,data){
			console.log(data);
			if(ret){
				if(data.errcode == 0){
					if(serverinfo.type=='goldsangong'){
						fnCallback(0,{
							ip:serverinfo.clientip,
							port:serverinfo.clientport,
							token:data.token
						});
					}else{
						db.set_room_id_of_user(userId,roomId,function(ret){
							fnCallback(0,{
								ip:serverinfo.clientip,
								port:serverinfo.clientport,
								token:data.token
							});
						});
					}
				}
				else{
					console.log(data.errmsg);
					fnCallback(data.errcode,data.roomConf);
				}
			}
			else{
				fnCallback(-1,null);
			}
		});
	};

	var chooseServerAndEnter = function(serverinfo){
		serverinfo = chooseServer();
		if(serverinfo != null){
			enterRoomReq(serverinfo);
		}
		else{
			fnCallback(-1,null);					
		}
	}

	if(roomId=='000001'){
		var goldSanGongServerInfo=null;
		for(var k in serverMap){
			if(serverMap[k].type=='goldsangong'){
				goldSanGongServerInfo=serverMap[k];
				break;
			}
		}
		if(goldSanGongServerInfo){
			enterRoomReq(goldSanGongServerInfo);
		}else{
			fnCallback(-1,null);
		}
	}else{
		db.get_room_addr(roomId,function(ret,ip,port){
			if(ret){
				var id = ip + ":" + port;
				var serverinfo = serverMap[id];
				if(serverinfo != null){
					checkRoomIsRuning(serverinfo,roomId,function(isRuning){
						if(isRuning){
							enterRoomReq(serverinfo);
						}
						else{
							//chooseServerAndEnter(serverinfo);
							fnCallback(-1,null);
						}
					});
				}
				else{
					//chooseServerAndEnter(serverinfo);
					fnCallback(-1,null);
				}
			}
			else{
				fnCallback(-2,null);
			}
		});
	}
};

exports.isServerOnline = function(ip,port,callback){
	var id = ip + ":" + port;
	var serverInfo = serverMap[id];
	if(!serverInfo){
		callback(false);
		return;
	}
	var sign = crypto.md5(config.ROOM_PRI_KEY);
	http.get(serverInfo.ip,serverInfo.httpPort,"/ping",{sign:sign},function(ret,data){
		if(ret){
			callback(true);
		}
		else{
			callback(false);
		}
	});
};

exports.getOnlineUserCount = function(){
	var count = 0;
	for(var k in serverMap){
		if(serverMap[k].onlineCount>0){
			count+=serverMap[k].onlineCount;
		}
	}
	return count;
};

exports.start = function($config){
	config = $config;
	app.listen(config.ROOM_PORT,config.FOR_ROOM_IP);
	console.log("room service is listening on " + config.FOR_ROOM_IP + ":" + config.ROOM_PORT);
};