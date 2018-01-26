var roomMgr = require("./roommgr");
var userMgr = require("./usermgr");
var db = require("../utils/db");
var crypto = require("../utils/crypto");

module.exports = gameManager;
function gameManager() {
    this.games = {};
    this.gameSeatsOfUsers = {};
    this.dissolvingList = [];

    setInterval(this.update, 1000, this);
}
gameManager.prototype = {
    maxX:12,
    maxY:12,

    //下注
    stake:function(userId,stake){
        var roomId = roomMgr.getUserRoom(userId);
        var roomInfo = roomMgr.getRoom(roomId);
        if(!roomInfo){
            userMgr.sendMsg(userId,'stake_notify_push',{error:'noRoom'});
            return;
        }
        var seatIndex = roomMgr.getUserSeat(userId);
        var seat = roomInfo.seats[seatIndex];
        var otherReady = false;
        for(var i=0;i<roomInfo.seats.length;i++){
            var s = roomInfo.seats[i];
            if(s.userId>0&&s.userId!=roomInfo.conf.creator&&s.ready){
                otherReady = true;
                break;
            }
        }
        if(otherReady){
            userMgr.sendMsg(userId,'stake_notify_push',{error:'otherReadied'});
            return;
        }
        if(roomInfo.conf.creator != userId){ //房主才能下注
            userMgr.sendMsg(userId,'stake_notify_push',{error:'notCreator'});
            return;
        }
        if(!roomInfo.userMap[userId]){
            userMgr.sendMsg(userId,'stake_notify_push',{error:'noUserInfo'});
            return;
        }
        if(!(stake>0)){
            userMgr.sendMsg(userId,'stake_notify_push',{error:'stake mast more than 0'});
            return;
        }
        // if(roomInfo.userMap[userId].coins < stake){
        //     userMgr.sendMsg(userId,'stake_notify_push',{error:'noCoins'});
        //     return;
        // }
        roomInfo.stake = stake;
        userMgr.broacast(roomInfo.id,'stake_notify_push', { userId: userId, stake: stake});
        return;
    },

    giveUp:function(userId){
        var seatData = this.gameSeatsOfUsers[userId];
        if(!seatData){
            userMgr.sendMsg(userId,'giveup_notify_push',{error:'noSeat'});
            return;
        }
        var game = seatData.game;
        var winnerSeatIndex = -1;
        for(var i = 0;i< game.gameSeats.length;i++){
            if(game.gameSeats[i].userId!=userId){
                winnerSeatIndex = i;
                break;
            }
        }
        userMgr.broacast(game.roomInfo.id,'giveup_notify_push',{userId:userId});
        if(winnerSeatIndex>=0){
            game.winnerSeatIndex = winnerSeatIndex;
            this.doGameOver(game,userId);
        }
    },

    // 下棋
    drop: function (userId, x,y) {
        var seatData = this.gameSeatsOfUsers[userId];
        if(!seatData){
            userMgr.sendMsg(userId,'drop_notify_push',{error:'noSeat'});
            return;
        }
        if(!(x>=0)||!(x<=this.maxX)||!(y>=0)||!(y<=this.maxY)){
            userMgr.sendMsg(userId,'drop_notify_push',{error:'pointError'});
            return;
        }
        var game = seatData.game;
        if (!seatData.canDrop) {
            userMgr.sendMsg(userId,'drop_notify_push',{error:'canNotDrop'});
            return;
        }
        if(game.goBoard[x][y]!=null){
            userMgr.sendMsg(userId,'drop_notify_push',{error:'pointDroped'});
            return;
        }
        seatData.canDrop = false;
        game.goCount++;
        game.goBoard[x][y] = seatData.seatIndex;
        userMgr.broacast(game.roomInfo.id,'drop_notify_push', { userid: seatData.userId, pointX: x,pointY:y});

        var self = this;
        this.checkResult(game.goBoard,function(winnerSeatIndex,winPoints){
            if(winnerSeatIndex>=0){
                game.winnerSeatIndex = winnerSeatIndex;
                game.winPoints = winPoints;
                self.doGameOver(game,userId);
            } else if (game.goCount >= (self.maxX + 1) * (self.maxY + 1)) { //棋盘下满了
                self.doGameOver(game,userId);
            } else { //该下个人下棋
                var nextIndex = self.getNextUser(game);
                var next = game.gameSeats[nextIndex];
                game.turn = nextIndex;
                self.doNextTurn(next);
            }
        });

    },

    checkResult: function (goBoard,callback) {
        for (var x = 0; x <= this.maxX-4; x++) {
            for (var y = 0; y <= this.maxY-4; y++) {
                if(goBoard[x][y]!=null&&goBoard[x][y]>=0){
                    var check1 = [goBoard[x][y],goBoard[x+1][y],goBoard[x+2][y],goBoard[x+3][y],goBoard[x+4][y]];
                    if(this.checkArrayIsSame(check1)){
                        callback(goBoard[x][y], [[x,y],[x+1,y],[x+2,y],[x+3,y],[x+4,y]]);
                        return;
                    }
                    var check2 = [goBoard[x][y],goBoard[x+1][y+1],goBoard[x+2][y+2],goBoard[x+3][y+3],goBoard[x+4][y+4]];
                    if(this.checkArrayIsSame(check2)){
                        callback(goBoard[x][y], [[x,y],[x+1,y+1],[x+2,y+2],[x+3,y+3],[x+4,y+4]]);
                        return;
                    }
                    var check3 = [goBoard[x][y],goBoard[x][y+1],goBoard[x][y+2],goBoard[x][y+3],goBoard[x][y+4]];
                    if(this.checkArrayIsSame(check3)){
                        callback(goBoard[x][y], [[x,y],[x,y+1],[x,y+2],[x,y+3],[x,y+4]]);
                        return;
                    }
                    var check4 = [goBoard[x][y],goBoard[x][y+1],goBoard[x][y+2],goBoard[x][y+3],goBoard[x][y+4]];
                    if(this.checkArrayIsSame(check3)){
                        callback(goBoard[x][y], [[x,y],[x,y+1],[x,y+2],[x,y+3],[x,y+4]]);
                        return;
                    }
                }
            }
        }
        for (var x = 0; x <= this.maxX; x++) {
            for (var y = 0; y <= this.maxY; y++) {
                if(goBoard[x][y]!=null&&goBoard[x][y]>=0){
                    if(x<=this.maxX-4){
                        var check1 = [goBoard[x][y],goBoard[x+1][y],goBoard[x+2][y],goBoard[x+3][y],goBoard[x+4][y]];
                        if(this.checkArrayIsSame(check1)){
                            callback(goBoard[x][y], [[x,y],[x+1,y],[x+2,y],[x+3,y],[x+4,y]]);
                            return;
                        }
                    }
                    if(y<=this.maxY-4){
                        var check3 = [goBoard[x][y],goBoard[x][y+1],goBoard[x][y+2],goBoard[x][y+3],goBoard[x][y+4]];
                        if(this.checkArrayIsSame(check3)){
                            callback(goBoard[x][y], [[x,y],[x,y+1],[x,y+2],[x,y+3],[x,y+4]]);
                            return;
                        }
                    }
                    if(x<=this.maxX-4&&y<=this.maxY-4){
                        var check2 = [goBoard[x][y],goBoard[x+1][y+1],goBoard[x+2][y+2],goBoard[x+3][y+3],goBoard[x+4][y+4]];
                        if(this.checkArrayIsSame(check2)){
                            callback(goBoard[x][y], [[x,y],[x+1,y+1],[x+2,y+2],[x+3,y+3],[x+4,y+4]]);
                            return;
                        }
                    }
                    if(x>=4){
                        var check4 = [goBoard[x][y],goBoard[x-1][y+1],goBoard[x-2][y+2],goBoard[x-3][y+3],goBoard[x-4][y+4]];
                        if(this.checkArrayIsSame(check4)){
                            callback(goBoard[x][y], [[x,y],[x-1,y+1],[x-2,y+2],[x-3,y+3],[x-4,y+4]]);
                            return;
                        }
                    }
                }
            }
        }
        callback(-1);
    },

    checkArrayIsSame:function(array){
        for(var i=1;i<array.length;i++){
            if(array[0]!=array[i]){
                return false;
            }
        }
        return true;
    },

    //发送消息，让下家开始打牌
    doNextTurn: function (next) {
        var game = next.game;
        next.canDrop = true;
        var stateData = {
            canDrop: next.canDrop,
        };
        userMgr.broacast(game.roomInfo.id,'game_turn_push', { userId: next.userId,state: stateData});
        console.log('turn to user['+next.userId+']');
    },

    getSeatIndex: function (userId) {
        var seatIndex = roomMgr.getUserSeat(userId);
        if (seatIndex == null) {
            return null;
        }
        return seatIndex;
    },

    getGameByUserID: function (userId) {
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return null;
        }
        var game = this.games[roomId];
        return game;
    },

    getNextUser: function (game) {
        //找到下一个玩家
        var turn = game.turn;
        for (var i = 1; i < game.gameSeats.length; i++) {
            turn = (turn + 1) % game.gameSeats.length;
            return turn;
        }
        return -1;
    },

    getNextButton: function (roomInfo, game) {
        return (roomInfo.nextButton + 1) % roomInfo.seats.length;
    },

    doGameOver: function (game, userId, forceEnd, gameManager) {
        var self = gameManager ? gameManager : this;
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }
        var results = [];
        for(var i=0;i<game.gameSeats.length;i++){
            var gameSeat = game.gameSeats[i];
            var roomSeat = roomInfo.seats[i];
            var userResult = {
                userId: gameSeat.userId,
                stake:game.stake,
                seatIndex: gameSeat.seatIndex,
                score : 0,
                totalScore :0,
            };
            if(game.winnerSeatIndex>=0 && i!=game.winnerSeatIndex){
                var coins = roomInfo.userMap[gameSeat.userId].coins;
                var lostMoney = coins>=game.stake?game.stake:coins;
                userResult.score = -lostMoney;
            }
            results.push(userResult);
        }

        if(game.winnerSeatIndex>=0){
            var winnerResult = results[game.winnerSeatIndex];
            for (var i = 0; i < game.gameSeats.length; i++) {
    
                if (results[i]!=winnerResult) {
                    winnerResult.score+=(-results[i].score);
                }
            }
            var rate = game.roomInfo.conf.rate ? game.roomInfo.conf.rate : 0;//系统抽成
            winnerResult.score = parseInt(winnerResult.score * (1 - rate));
        }
        var commission = winnerResult.stake - winnerResult.score;
        if(!commission){
            commission = 0
        }
        db.add_commissionhistory(winnerResult.userId,'coins',commission,function(err,row){if(row){console.log(row);};});

        for(var i=0;i<game.gameSeats.length;i++){
            var gameSeat = game.gameSeats[i];
            var roomSeat = roomInfo.seats[i];
            var userResult = results[i];
            roomSeat.score += userResult.score;
            userResult.totalScore = roomSeat.score;
            roomSeat.results.push({
                score:userResult.score,
            });
            var user = game.roomInfo.userMap[gameSeat.userId];
            if (user) {
                user.coins += userResult.score;
                userMgr.broacast(roomId, 'user_coins_notify_push', {userId:gameSeat.userId, coins: user.coins, coinsbank: user.coinsbank });
            }
        }

        if (!forceEnd) {
            userMgr.broacast(roomId, 'game_over_push', { winnerSeatIndex: game.winnerSeatIndex, winPoints: game.winPoints, results: results });
        }
        db.balanceGame([{ userId: results[0].userId, money: results[0].score, moneyType: 'coin', roomUuid: game.roomInfo.uuid, gameIndex: game.gameIndex, gameType: game.conf.type },
            { userId: results[1].userId, money: results[1].score, moneyType: 'coin', roomUuid: game.roomInfo.uuid, gameIndex: game.gameIndex, gameType: game.conf.type }],
            function () {});

        roomInfo.stake = 0;
        for(var i=0;i<roomInfo.seats.length;i++){
            roomInfo.seats[i].ready = false;
            delete this.gameSeatsOfUsers[roomInfo.seats[i].userId];
        }
        delete this.games[roomId];
        //如果局数已够，则进行整体结算，并关闭房间
        if (forceEnd) {
            setTimeout(function () {
                // if (roomInfo.numOfGames > 1) {
                //     self.store_history(roomInfo);
                // }
                userMgr.kickAllInRoom(roomId);
                roomMgr.destroy(roomId);
                db.archive_games(roomInfo.uuid);
            }, 1000);
        }
    },

    setReady: function (userId) {
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            userMgr.sendMsg(userId,'setReady_notify_push',{error:'noRoomId'});
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            userMgr.sendMsg(userId,'setReady_notify_push',{error:'noRoom'});
            return;
        }

        var game = this.games[roomId];
        if (game) {
            //游戏已经开始，忽略ready消息
            userMgr.sendMsg(userId,'setReady_notify_push',{error:'gameIsBegin'});
            return;
        }
        if(!(roomInfo.stake>0)){
            userMgr.sendMsg(userId,'setReady_notify_push',{error:'noStake'});
            return;
        }

        roomMgr.setReady(userId, true);
        userMgr.broacast(roomId,'setReady_notify_push',{userId:userId,ready:true});

        var readyCnt = 0, onlineCnt = 0;
        var newSeats = [];
        for (var i = 0; i < roomInfo.seats.length; ++i) {
            var s = roomInfo.seats[i];
            if (s.userId > 0) {
                if (s.ready == true) readyCnt++;
                if (userMgr.isOnline(s.userId) == true) {
                    onlineCnt++;
                    newSeats.push(s);
                }
            }
        }
        if (readyCnt==2 && readyCnt == onlineCnt) {
            //人到齐了，并且都准备好了，则开始新的一局
            roomInfo.seats = newSeats;
            this.begin(roomId);
        }
    },

    enterGame: function (userId) {
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }
        var game = this.games[roomId];
        if (!game) {
            var data = {
                roomType:roomInfo.conf.type,
                state: 'idle',
                goCount: 0,
                button: 0,
                stake:roomInfo.stake,
            };
            data.seats = [];
            var seatData = null;
            for (var i = 0; i < 2; ++i) {
                var rs = roomInfo.seats[i];
                if(rs.userId>0){
                    var s = {
                        userid: rs.userId,
                        name:roomInfo.userMap[rs.userId].name,
                        seatIndex: i,
                        canDrop: false,
                        coins:roomInfo.userMap[rs.userId].coins,
                    }
                    data.seats.push(s);
                }
            }
            //同步整个信息给客户端
            userMgr.sendMsg(userId, 'game_sync_push', data);
            console.log('game_sync_push to ' + userId);
            console.log(data);
        }
        else {
            var data = {
                roomType:roomInfo.conf.type,
                state: game.state,
                goCount: game.goCount,
                button: game.button,
                turn: game.turn,
                goBoard:game.goBoard,
                stake:roomInfo.stake,
            };
            data.seats = [];
            var seatData = null;
            for (var i = 0; i < 2; ++i) {
                if(!game.gameSeats[i]){
                    continue;
                }
                var sd = game.gameSeats[i];
                var s = {
                    userid: sd.userId,
                    name:roomInfo.userMap[sd.userId].name,
                    seatIndex: sd.seatIndex,
                    canDrop: sd.canDrop,
                    coins:roomInfo.userMap[sd.userId].coins,
                }
                data.seats.push(s);
            }
            //同步整个信息给客户端
            userMgr.sendMsg(userId, 'game_sync_push', data);
            console.log('game_sync_push to ' + userId);
            console.log(data);
        }
    },

    store_single_history: function (userId, history) {
        db.get_user_history(userId, function (data) {
            if (data == null) {
                data = [];
            }
            while (data.length >= 10) {
                data.shift();
            }
            data.push(history);
            db.update_user_history(userId, data);
        });
    },

    store_history: function (roomInfo) {
        var seats = roomInfo.seats;
        var history = {
            uuid: roomInfo.uuid,
            id: roomInfo.id,
            time: roomInfo.createTime,
            seats: []
        };

        for (var i = 0; i < seats.length; ++i) {
            var rs = seats[i];
            var hs = history.seats[i] = {};
            hs.userid = rs.userId;
            hs.name = crypto.toBase64(rs.name);
            hs.score = rs.score;
        }

        for (var i = 0; i < seats.length; ++i) {
            var s = seats[i];
            this.store_single_history(s.userId, history);
        }
    },

    construct_game_base_info: function (game) {
        var baseInfo = {
            type: game.conf.type,
            button: game.button,
            index: game.gameIndex,
            game_seats: []
        }
        for (var i = 0; i < game.gameSeats.length; ++i) {
            baseInfo.game_seats[i] = game.gameSeats[i].holds;
        }
        game.baseInfoJson = JSON.stringify(baseInfo);
    },

    store_game: function (game, callback) {
        db.create_game(game.roomInfo.uuid, game.gameIndex, game.baseInfoJson, callback);
        console.log('db.create_game roomId:'+game.roomInfo.uuid+' index:'+game.gameIndex);
    },

    //开始新的一局
    begin: function (roomId) {
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }
        var seats = roomInfo.seats;

        var game = {
            conf: roomInfo.conf,
            roomInfo: roomInfo,
            gameIndex: roomInfo.numOfGames,
            button: roomInfo.nextButton,
            goCount:0,
            gameSeats: [],
            turn: 0,
            state: "idle",
            stake:roomInfo.stake,
        };
        //初始化棋盘
        game.goBoard = [];
        for (var i = 0; i <= this.maxX; i++) {
            game.goBoard.push([]);
            for (var j = 0; j < this.maxY; j++) {
                game.goBoard[i].push(null);
            }
        }

        roomInfo.numOfGames++;

        for (var i = 0; i < 2; ++i) {
            if (seats[i] && seats[i].userId > 0) {
                var data = {};
                game.gameSeats[i] = data;
                data.game = game;
                data.seatIndex = i;
                data.userId = seats[i].userId;
                data.canDrop = false;
                this.gameSeatsOfUsers[data.userId] = data;
            }
        }

        this.games[roomId] = game;

        //通知游戏开始
        userMgr.broacast(roomInfo.id,'game_begin_push', game.button);

        game.state = "playing";
        userMgr.broacast(roomInfo.id,'game_playing_push', null);

        this.construct_game_base_info(game);

        console.log('game begin');
        game.turn = game.button;
        var nextIndex =  game.button;
        var next = game.gameSeats[nextIndex];
        game.turn = nextIndex;
        this.doNextTurn(next);
    },

    hasBegan: function (roomId) {
        var game = this.games[roomId];
        if (game != null) {
            return game.state == 'playing';
        }
        return false;
    },

    doDissolve: function (roomId, gameManager) {
        var self = gameManager ? gameManager : this;
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return null;
        }

        var game = self.games[roomId];
        self.doGameOver(game, roomInfo.seats[0].userId, true, self);
    },
    dissolveUpdate : function(roomId, userId, online) {
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return null;
        }
    
        var seatIndex = roomMgr.getUserSeat(userId);
        if (seatIndex == null) {
            return null;
        }
    
        var dr = roomInfo.dr;
    
        if (dr == null) {
            if (!online) {
                return this.dissolveRequest(roomId, userId, true);
            } else {
                return null;
            }
        }
    
        dr.online[seatIndex] = online;
    
        var found = false;
        var reject = -1;
        for (var i = 0; i < dr.online.length; i++) {
            if (!dr.online[i]) {
                found = true;
            }
    
            if (dr.states[i] == 1) {
                reject = roomInfo.seats[i].userId;
            }
        }
    
        if (!found) {
            if (dr.reason == 'offline' || reject >= 0) {
                if (reject >= 0) {
                    roomInfo.rejectUser = reject;
                }
    
                roomInfo.dr = null;
                var idx = this.dissolvingList.indexOf(roomId);
                if (idx != -1) {
                        this.dissolvingList.splice(idx, 1);           
                }
            }
        }
    
        return roomInfo;
    },

    dissolveRequest: function(roomId, userId, offline) {
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return null;
        }
    
        var seatIndex = roomMgr.getUserSeat(userId);
        if (seatIndex == null) {
            return null;
        }
    
        var dr = roomInfo.dr;
    
        if (dr != null) {
            if (dr.reason == 'offline' && !offline) {
                dr.endTime = Date.now() + 600000;
                dr.reason = 'request';
                dr.states[seatIndex] = 3;
            } else {
                return null;
            }
        } else {
            dr = {endTime: Date.now() + 600000,states:[],online:[]};
            for (var i = 0; i < roomInfo.seats.length; i++) {
                dr.states.push(0);
                dr.online.push(true);
            }
    
            if (offline) {
                dr.reason = 'offline';
                dr.online[seatIndex] = false;
            } else {
                dr.reason = 'request';
                dr.states[seatIndex] = 3;
            }
            roomInfo.dr = dr;
            this.dissolvingList.push(roomId);
        }
    
        return roomInfo;
    },

    dissolveAgree: function (roomId, userId, agree) {
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return null;
        }

        if (roomInfo.dr == null) {
            return null;
        }

        var seatIndex = roomMgr.getUserSeat(userId);
        if (seatIndex == null) {
            return null;
        }

        if (agree) {
            roomInfo.dr.states[seatIndex] = 2;
            var count = 0;
            for (var i = 0; i < roomInfo.dr.states.length; i++) {
                if (roomInfo.dr.states[i] >= 2) {
                    count++;
                }
            }
            if (count == roomInfo.dr.states.length - 1) {
                roomInfo.dr.endTime = Date.now() + 300000;
            }
        }
        else {
            roomInfo.dr.states[seatIndex] = 1;

            var found = false;
            for (var i = 0; i < roomInfo.dr.online.length; i++) {
                if (!roomInfo.dr.online[i]) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                roomInfo.dr = null;
                var idx = this.dissolvingList.indexOf(roomId);
                if (idx != -1) {
                    this.dissolvingList.splice(idx, 1);
                }
            }
        }
        return roomInfo;
    },

    update: function (gameManager) {
        if (gameManager.dissolvingList && gameManager.doDissolve) {
            for (var i = gameManager.dissolvingList.length - 1; i >= 0; --i) {
                var roomId = gameManager.dissolvingList[i];

                var roomInfo = roomMgr.getRoom(roomId);
                if (roomInfo != null && roomInfo.dr != null) {
                    if (Date.now() > roomInfo.dr.endTime) {
                        console.log("delete room and games");
                        gameManager.doDissolve(roomId,gameManager);
                        gameManager.dissolvingList.splice(i, 1);
                    }
                }
                else {
                    gameManager.dissolvingList.splice(i, 1);
                }
            }
        }
    }
}