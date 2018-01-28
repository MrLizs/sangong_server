var roomMgr = require("./roommgr");
var userMgr = require("./usermgr");
var db = require("../utils/db");
var crypto = require("../utils/crypto");
var robotMgr = require("../robotService/robotManager");

module.exports = goldSanGongManager;
function goldSanGongManager() {

    this.games = {};

    //发牌张数
    this.dealCount = 3;

    setInterval(function (gameManager) {
        for (var k in gameManager.games) {
            var game = gameManager.games[k];
            if (game.isRunning) {
                if (game.time == 5) {//下注
                    console.log(new Date()+'game[roomid:'+k+'] Stake');
                    gameManager.gameStake(game);
                } else if (game.time == 20) {//开牌
                    console.log(new Date()+'game[roomid:'+k+'] TurnOverCard');
                    gameManager.gameTurnOverCard(game);
                } else if (game.time == 25) {//亮牌
                    console.log(new Date()+'game[roomid:'+k+'] ShowCard');
                    gameManager.gameShowCard(game);
                } else if (game.time == 41) {//结算
                    console.log(new Date()+'game[roomid:'+k+'] ShowResult');
                    gameManager.gameShowResult(game);
                } else if (game.time == 51) {//新的一局
                    console.log(new Date()+'game[roomid:'+k+'] Begin');
                    gameManager.gameBegin(game.roomInfo.id);
                    game.time = -1;
                }
                game.time++;
            }
        }
    }, 1000, this);
}
goldSanGongManager.prototype = {
    states:['idle','stake','turnOverCard','showCard','showResult'],

    stateTimes:[5,15,5,16,10],


    /**
     * 金币场游戏历史管理
     */
    gameHistoryManager:function(roomid,resultObj){
        var roomInfo = roomMgr.getRoom(roomid);
        if (roomInfo == null) {
            return;
        }
        if(roomInfo.gameHistory){
            if(roomInfo.gameHistory.length >= 3){
                var oo = roomInfo.gameHistory.shift();
            }
        }
        else{
            roomInfo.gameHistory = [];
        }
        roomInfo.gameHistory.push(resultObj);
    },

    getNextState:function(state){
        var index = this.states.indexOf(state);
        if(index>=0){
            nextIndex = (index+1)%this.states.length;
            return this.states[nextIndex];
        }
        return null;
    },
    
    getNextStateTimeLeft: function (state, usedTime) {
        var index = this.states.indexOf(state);
        if (index >= 0) {
            var nextTime = 0;
            for (var i = 0; i <= index; i++) {
                nextTime += this.stateTimes[i];
            }
            return nextTime - usedTime;
        }
        return null;
    },
    
    getStateTime: function (state) {
        var index = this.states.indexOf(state);
        if (index >= 0) {
            return this.stateTimes[index];
        }
        return null;
    },

    getStatePushData:function(game){
        return {
            state:game.state,
            stateTime:this.getStateTime(game.state),
            gameIndex: game.roomInfo.numOfGames,
            gameTime:game.time,
            isRunning:game.isRunning
        };
    },

    getPaiXings: function (game) {
        //基本牌型  方块A、梅花A、红桃A、黑桃A、方块2、梅花2、红桃2、黑桃2……方块K、梅花K、红桃K、黑桃K
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
            34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
    },
    
    hasBegan: function (roomId) {
        var game = this.games[roomId];
        if (game != null) {
            return true;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo != null) {
            return roomInfo.numOfGames > 0;
        }
        return false;
    },

    // 获取牌值
    getPaiValue: function (pai) {
        var value = parseInt(pai / 4) + 1;
        return value;
    },

    // 获取花色
    getSuit: function (pai) {
        return pai % 4;
    },
    
    getPaisTotalValue: function (pais) {
        var result = 0;
        if(pais&&pais.length>0){
            for(var i = 0;i<pais.length;i++){
                var value = this.getPaiValue(pais[i]);
                if(value > 9){
                    value = 0;
                }
                result+=value;
            }
        }
        return result;
    },

    getMax:function(nums){
        if(nums&&nums.length>0){
            var max = nums[0];
            for(var i = 1;i<nums.length;i++){
                if(max<nums[i]){
                    max=nums[i];
                }
            }
            return max;
        }
        return null;
    },

    //获取所有牌的数量
    getPaisValueCountMap: function (pais) {
        var countMap = {};
        for (var i = 0; i < pais.length; i++) {
            var value = this.getPaiValue(pais[i]);
            if (!(countMap[value] > 0)) {
                countMap[value] = 0;
            }
            countMap[value]++;
        }
        return countMap;
    },

    //获取排序后的牌值，从小到大
    getSortPaiValues: function (pais) {
        var values = [];
        for (var i = 0; i < pais.length; i++) {
            values.push(this.getPaiValue(pais[i]));
        }
        return values.sort(function (a, b) { return a - b; });
    },

    // 获取牌的结果信息
    getPaisResult: function (pais) {
        var countMap = this.getPaisValueCountMap(pais);
        var result = {
            type: 0,//单牌=1，特性数=2，混三公=4，小三公=8，大三公=16
            value: 0, //用来比较大小
            points:0
        };
        var gongPaiCount = 0;
        for (var k in countMap) {
            if (countMap[k] == 3) { //大三公或小三公
                if(k>10){ //大三公
                    result.type=16;
                    result.value=result.type+k*0.001;
                    return result;
                }else{ //小三公
                    result.type=8;
                    result.value=result.type+k*0.001;
                    return result;
                }
            }
            if(k>10){
                gongPaiCount+=countMap[k];
            }
        }
        if (gongPaiCount == 3) { //混三公
            result.type = 4;
            result.value = result.type+ this.getPaiValue(this.getMax(pais)) * 0.01+this.getSuit(this.getMax(pais)) * 0.001;
            return result;
        }
        var point = this.getPaisTotalValue(pais) % 10;
        if (point == 8 || point == 9) {
            result.type = 2;
            result.points = point;
        } else {
            result.type = 1;
            result.points = point;
        }
        result.value = result.type + point * 0.01 + this.getPaiValue(this.getMax(pais)) * 0.001+this.getSuit(this.getMax(pais)) * 0.0001;
        return result;
    },

    // 下注
    stake: function (userId, stakeInfo) {
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }
        var game = this.games[roomId];
        if(!game||game.state!='stake'){
            return;
        }
        var stake = stakeInfo.stake;
        var seatIndex = stakeInfo.seatIndex;
        if(!(stake>0)||!(seatIndex>=0)||!(seatIndex<game.gameSeats.length)){
            return;
        }
        if(!(seatIndex>=0&&seatIndex<game.gameSeats.length)){
            return;
        }
        if(!game.roomInfo.userMap[userId]){
            return;
        }
        var gameSeat = game.gameSeats[seatIndex];
        if(!gameSeat.stakeMap[userId]){
            gameSeat.stakeMap[userId] = {total:0,details:[]};
        }
        var staked = game.userStakeMap[userId]?game.userStakeMap[userId]:0;
        if(game.roomInfo.userMap[userId].coins<staked+stake){
            userMgr.sendMsg(userId,'stake_notify_push', {error:'noCoins'});
            return;
        }
        if (game.roomInfo.userMap[userId].coins > 0 && game.roomInfo.userMap[userId].coins >= staked + stake) {
            gameSeat.stakeMap[userId].total += stake;
            gameSeat.stakeMap[userId].details.push(stake);
            gameSeat.totalStake += stake;
            if (!(game.userStakeMap[userId] >= 0)) {
                game.userStakeMap[userId] = 0;
            }
            game.userStakeMap[userId] += stake;
            userMgr.broacast(roomId, 'stake_notify_push', { userid: userId, stake: stake, userStake: gameSeat.stakeMap[userId].total, seatStake: gameSeat.totalStake, seatIndex: seatIndex });
            userMgr.broacast(roomId, 'user_coins_notify_push', { userid: userId, coins: game.roomInfo.userMap[userId].coins - game.userStakeMap[userId], coinsbank: game.roomInfo.userMap[userId].coinsbank });
        }
    },

    //洗牌
    shuffle: function (game) {
        var paiXings = this.getPaiXings(game);
        var pais = [];
        for (var i = 0; i < paiXings.length; i++) {
            pais.push(paiXings[i]);
        }

        var count = pais.length;
        var getPai = function (pai) {
            var index = pais.indexOf(pai);
            if (index >= 0) {
                pais.splice(index, 1);
                return pai;
            }
            return -1;
        }
        var getRandomPai = function () {
            var index = Math.floor(Math.random() * pais.length);
            var pai = pais[index];
            pais.splice(index, 1);
            return pai;
        }

        for (var i = 0; i < count; i++) {
            if (game.pokers[i] == null) {
                game.pokers[i] = getRandomPai();
            }
        }
        return;
    },

    //发牌
    deal: function (game) {
        //强制清0
        game.currentIndex = 0;

        for (var i = 0; i < this.dealCount; ++i) {
            for (var j = 0; j < game.conf.seatNum; j++) {
                var seat = game.gameSeats[j];
                if (!seat.holds) {
                    seat.holds = [];
                }
                this.draw(game,j);
            }
        }
    },

    //摸牌
    draw: function (game, seatIndex) {
        if (game.currentIndex == game.pokers.length) {
            return -1;
        }
        var data = game.gameSeats[seatIndex];
        var pokers = data.holds;
        var pai = game.pokers[game.currentIndex];
        pokers.push(pai);

        game.currentIndex++;
        return pai;
    },

    getGameByUserID: function (userId) {
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return null;
        }
        var game = this.games[roomId];
        return game;
    },

    enterGame: function (userId) {
        var self = this;
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }
        if(!roomInfo.userMap[userId]){
            return;
        }

        var game = self.games[roomId];
        self.startGame(userId);
        if (!game) {
            var data = {
                roomType:roomInfo.conf.type,
                state: 'stop',
                seatNum: roomInfo.conf.seatNum,
                users: roomInfo.users,
            };
            data.seats = [];
            for (var i = 0; i < roomInfo.seats.length; i++) {
                var sd = roomInfo.seats[i];
                var s = {
                    seatIndex: sd.seatIndex,
                    stakeMap:{},
                    totalStake:0,
                    seatUserId:sd.seatUserId,
                    holds:[]
                }
                data.seats.push(s);
            }

            //同步整个信息给客户端
            userMgr.sendMsg(userId, 'game_sync_push', data);
            console.log('game_sync_push to ' + userId);
            console.log(data);

            db.user_online_log(userId,2,function(res){//zyh
                if(!res) console.log(" user_online_log has err");
            }); 
        }
        else {
            var data = {
                roomType:game.roomInfo.conf.type,
                state: game.state,
                seatNum:roomInfo.conf.seatNum,
                users:roomInfo.users,
                nextGameState: self.getNextState(game.state),
                getNextStateTimeLeft: self.getNextStateTimeLeft(game.state, game.time) 
            };
            data.seats = [];
            data.seatsPaisResults = [];
            for (var i = 0; i < game.conf.seatNum; i++) {
                var sd = game.gameSeats[i];
                var s = {
                    seatIndex: sd.seatIndex,
                    stakeMap:sd.stakeMap,
                    seatUserId:roomInfo.seats[i].seatUserId,
                    totalStake:sd.totalStake,
                }
                if (game.state=='stake') {
                    s.holds = [];
                } else {
                    s.holds = sd.holds;
                }
                if(sd.paisResult){
                    s.paisResult={type:sd.paisResult.type,points:sd.paisResult.points};
                }
                data.seats.push(s);
            }

            //同步整个信息给客户端
            userMgr.sendMsg(userId, 'game_sync_push', data);
            console.log('game_sync_push to ' + userId);
            console.log(data);
        }
        userMgr.broacastToOthers(userId,'user_enter_push',roomInfo.userMap[userId]);
        console.log('EnterGame room['+roomId+'] user['+userId+']')
    },

    startGame: function (userId) {
        var self = this;
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }

        var game = self.games[roomId];
        if (game) {
            if (game.isRunning === false) {
                game.isRunning = true;
                var pushData = { 
                    state: game.stake, 
                    nextGameState: self.getNextState(game.state),
                    getNextStateTimeLeft: self.getNextStateTimeLeft(game.state, game.time),
                };
                userMgr.broacast(roomId,'game_start_push',pushData);
            }
        }else{
            userMgr.broacast(roomId,'game_start_push',null);
            self.gameBegin(roomId);
        }
    },
    
    stopGame: function (userId) {
        var self = this;
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }

        var game = self.games[roomId];
        if (game) {
            if (game.isRunning === true) {
                game.isRunning = false;
                userMgr.broacast(roomId,'game_stop_push', null);
            }
        }
    },
    
    stopGameByRoomId: function (roomId) {
        var self = this;
        if (roomId == null) {
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }

        var game = self.games[roomId];
        if (game) {
            if (game.isRunning === true) {
                game.isRunning = false;
                userMgr.broacast(roomId,'game_stop_push', null);
            }
        }
    },

    //开始新的一局
    gameBegin: function (roomId) {
        var self = this;
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            return;
        }
        var seats = roomInfo.seats;
        var game = {
            conf: roomInfo.conf,
            roomInfo: roomInfo,
            gameIndex: roomInfo.numOfGames,
            pokers: [],
            currentIndex: 0,
            gameSeats: [],
            state: "idle",//idle 空闲，stake 下注，turnOverCard 开牌，showCard 亮牌，showResult 结算
            time:0,
            isRunning:true,
            userStakeMap:{},
        };
        for (var i = 0; i < game.conf.seatNum; ++i) {
            var data = {};
            game.gameSeats[i] = data;
            data.game = game;
            data.seatIndex = i;
            
            data.holds = [];//持有的牌
            data.stakeMap={};
            data.totalStake = 0;//这堆牌的总下注
        }
        self.games[roomId] = game;
        var pushData = self.getStatePushData(game);
        userMgr.broacast(game.roomInfo.id,'state_idle_notify_push',pushData);
        robotMgr.addedRobot(roomInfo,roomId);
    },
    
    gameStake: function (game) {
        var self = this;
        game.state = "stake";
        var pushData = self.getStatePushData(game);
        userMgr.broacast(game.roomInfo.id, 'state_stake_notify_push', pushData);
    },

    gameTurnOverCard: function (game) {
        var self = this;
        game.state = "turnOverCard";
        //洗牌
        self.shuffle(game);
        //发牌
        self.deal(game);
        var seatsData = [];
        for (var i = 0; i < game.gameSeats.length; i++) {
            seatsData.push(game.gameSeats[i].holds);
        }
        var pushData = self.getStatePushData(game);
        pushData.seats = seatsData;
        var mostStake = null;
        var mostStakeUserId = null;
        for(var userId in game.userStakeMap){
            if(!mostStake||mostStake<game.userStakeMap[userId]){
                mostStake = game.userStakeMap[userId];
                mostStakeUserId = userId;
            }
        }
        pushData.mostStakeUserId = mostStakeUserId;
        var mostStakeSeatIndex = 0;
        var mostSeatStake = 0;
        for(var i=0;i<game.gameSeats.length;i++){
            var iSeat = game.gameSeats[i];
            if(mostSeatStake < iSeat.totalStake){
                mostSeatStake = iSeat.totalStake;
                mostStakeSeatIndex = i;
            }
        }
        pushData.mostStakeSeatIndex=mostStakeSeatIndex;
        userMgr.broacast(game.roomInfo.id,'state_turnOverCard_notify_push', pushData);
        console.log('room['+game.roomInfo.id+'] state_turnOverCard_notify_push :');
        console.log(pushData);
    },
    
    gameShowCard: function (game) {
        var self = this;
        game.state = "showCard";
        var seatsData = [];
        var seatsPaisResults = [];
        for (var i = 0; i < game.gameSeats.length; i++) {
            var paisResult = self.getPaisResult(game.gameSeats[i].holds);
            game.gameSeats[i].paisResult = paisResult;
            seatsPaisResults.push({type:paisResult.type,points:paisResult.points});
            seatsData.push(game.gameSeats[i].holds);
        }
        var pushData = self.getStatePushData(game);
        pushData.seats = seatsData;
        pushData.seatsPaisResults = seatsPaisResults;
        userMgr.broacast(game.roomInfo.id, 'state_showCard_notify_push', pushData);
    },

    gameShowResult: function (game) {
        var self = this;
        game.state = "showResult";
        var seatsData = [];
        for (var i = 0; i < game.gameSeats.length; i++) {
            //game.gameSeats[i].paisResult = self.getPaisResult(game.gameSeats[i].holds);
            game.gameSeats[i].haveStake = game.gameSeats[i].totalStake;
            seatsData.push(game.gameSeats[i]);
        }

        seatsData.sort(function(a,b){
            return b.paisResult.value - a.paisResult.value;
        });

        //对牌堆的筹码进行结算，加分扣分
        for(var i=0; i<seatsData.length; i++){
            var needStake = seatsData[i].totalStake;
            var winnerSeat = seatsData[i];
            for(var j=seatsData.length-1;j>i;j--){
                if(seatsData[j].haveStake>0){
                    var loserSeat = seatsData[j];
                    if(needStake>=loserSeat.haveStake){
                        winnerSeat.haveStake+=loserSeat.haveStake;
                        needStake-=loserSeat.haveStake;
                        loserSeat.haveStake=0;
                    }else{
                        winnerSeat.haveStake+=needStake;
                        loserSeat.haveStake-=needStake;
                        needStake=0;
                    }
                }
            }
        }

        // console.error(seatsData);
        var historyData = [];
        for(let i = 0 ; i < seatsData.length ; i++){
            var _history = {
                holds:seatsData[i].holds,
                paisResult:seatsData[i].paisResult,
                seatIndex:seatsData[i].seatIndex,
                haveStake:seatsData[i].haveStake,
                totalStake:seatsData[i].totalStake,
            };
            historyData.push(_history);
        }
        this.gameHistoryManager(game.roomInfo.id,historyData);

        var userScoreMap={};
        var rate = game.roomInfo.conf.rate?game.roomInfo.conf.rate:0;//系统抽成
        //对所有牌堆的投注进行结算
        for (var i = 0; i < seatsData.length; i++) {
            var seatData = seatsData[i];
            seatData.rank = i;//排名赋值
            for (var userId in seatData.stakeMap) {
                var stakeInfo = seatData.stakeMap[userId];
                if (stakeInfo && stakeInfo.total > 0) {
                    stakeInfo.haveStake = parseInt(seatData.haveStake * stakeInfo.total / seatData.totalStake);
                    //计算总分
                    if (!userScoreMap[userId]) {
                        userScoreMap[userId] = { result: 0, stake: 0 };
                    }
                    userScoreMap[userId].stake += stakeInfo.total;
                    var scoreResult = stakeInfo.haveStake - stakeInfo.total;
                    if (scoreResult > 0) {
                        db.add_commissionhistory(userId,'coins',scoreResult * rate ,function(err,row){if(row){console.log(row);};});
                        scoreResult = parseInt(scoreResult * (1 - rate));
                    }
                    userScoreMap[userId].result += scoreResult;
                }
            }
        }

        //准备发送给前端的消息参数
        var pushSeats = [];
        var pushSeats2 = [];
        for (var i = 0; i < seatsData.length; i++) {
            var seatData = seatsData[i];
            var pushSeatData = {
                seatIndex:seatData.seatIndex,
                rank:seatData.rank,
                pais:seatData.holds,
                paisType:seatData.paisResult.type,
                totalStake:seatData.totalStake,
            };
            pushSeats.push(pushSeatData);
            pushSeats2.push(pushSeatData);
        }
        pushSeats2.sort(function(a,b){
            return a.seatIndex - b.seatIndex;
        });
        
        var pushData = self.getStatePushData(game);
        pushData.result = pushSeats2;
        pushData.myResult = 0;
        //userMgr.broacast(game.roomInfo.id, 'state_showResult_notify_push', pushData);
        for (var i = 0; i < game.roomInfo.users.length; ++i) {
            pushData.myResult = 0;
            var user = game.roomInfo.users[i];
            var userId = user.userId;
            for(var j=0;j<seatsData.length;j++){
                pushSeats[j].myTotalStake = 0;
                pushSeats[j].myHaveStake = 0;
                pushSeats[j].mySeatResult = 0;
                if(seatsData[j].stakeMap[userId]){
                    pushSeats[j].myTotalStake = seatsData[j].stakeMap[userId].total;
                    pushSeats[j].myHaveStake = seatsData[j].stakeMap[userId].haveStake;
                    pushSeats[j].mySeatResult = seatsData[j].stakeMap[userId].haveStake - seatsData[j].stakeMap[userId].total;
                    if(rate&&pushSeats[j].mySeatResult>0){
                        pushSeats[j].mySeatResult=parseInt(pushSeats[j].mySeatResult*(1-rate));
                    }
                    if(pushSeats[j].mySeatResult>0){
                        pushData.myResult+=pushSeats[j].mySeatResult;
                    }
                }
            }
            if(!pushData.myResult){
                pushData.myResult=0;
            }
            userMgr.sendMsg(userId,'state_showResult_notify_push',pushData);
            console.log('room['+game.roomInfo.id+'] user['+userId+'] myResult = '+pushData.myResult);
        }
        console.warn('GAME OVER room['+game.roomInfo.id+'] results==>>');
            console.warn(JSON.stringify(pushSeats2));
        console.warn('-----------------------------');
        var balanceInfos=[];
        for(var userId in userScoreMap){
            var user = game.roomInfo.userMap[userId];
            if (user) {
                user.coins += userScoreMap[userId].result;
                userMgr.broacast(game.roomInfo.id, 'user_coins_notify_push', {userid:userId, coins: user.coins, coinsbank: user.coinsbank }); 
                var balanceInfo = {
                    userId: userId, 
                    money: userScoreMap[userId].result, 
                    moneyType: 'coin',
                    roomUuid: game.roomInfo.uuid, 
                    gameIndex: game.gameIndex, 
                    gameType: game.conf.type
                };
                balanceInfos.push(balanceInfo);
            }
        }
        db.balanceGame(balanceInfos, function () { });

        game.roomInfo.numOfGames++;
        //存档游戏
        if(balanceInfos.length>0){
            db.create_archive_game(game.roomInfo.uuid, game.gameIndex, self.buildGameBaseInfoStr(game),userScoreMap, function(ret){
            });
        }
        if(!game.roomInfo.users||!game.roomInfo.users.length){
            self.stopGameByRoomId(game.roomInfo.id);
        }
    },

    buildGameBaseInfoStr: function (game) {
        var baseInfo = {
            type: game.conf.type,
            index: game.gameIndex,
            conf:game.conf,
        }
        return JSON.stringify(baseInfo);
    },
    
    bankSaveYuanbaos: function (userId, yuanbaos) {
        var self = this;
        var user = null;
        var roomId = roomMgr.getUserRoom(userId);
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo && roomInfo.userMap && roomInfo.userMap[userId]) {
            user = roomInfo.userMap[userId];
        }
        if (user) {
            var game = self.games[roomId];
            var staked = 0;
            // if (game && game.userStakeMap && game.userStakeMap[userId]) {
            //     staked = game.userStakeMap[userId];
            // }
            var canSaveYuanbaos = user.yuanbaos - staked;
            if (yuanbaos > canSaveYuanbaos) {
                userMgr.sendMsg(userId, 'bank_saveyuanbaos_notify_push', { err: 'no enough yuanbaos' });
                return;
            }
            db.bank_save_yuanbaos(userId, yuanbaos, function (err, userInfo) {
                if (err) {
                    userMgr.sendMsg(userId, 'bank_saveyuanbaos_notify_push', { err: err });
                }
                else {
                    user.yuanbaos = userInfo.yuanbaos;
                    user.yuanbaosbank = userInfo.yuanbaosbank;
                    user.coins = userInfo.coins;
                    user.coinsbank = userInfo.coinsbank;
                    userMgr.broacast(roomId, 'bank_saveyuanbaos_notify_push', { userId: userId, yuanbaos: userInfo.yuanbaos, yuanbaosbank: user.yuanbaosbank });
                    userMgr.broacast(roomId, 'user_yuanbaos_notify_push', { userid: userId, yuanbaos: user.yuanbaos, yuanbaosbank: user.yuanbaosbank });
                }
            });
        } else {
            userMgr.sendMsg(userId, 'bank_saveyuanbaos_notify_push', { err: 'cannot find user' });
            return;
        }
    },

    bankDrawYuanbaos: function (userId, yuanbaos) {
        var self = this;
        db.bank_draw_yuanbaos(userId, yuanbaos, function (err, userInfo) {
            if (err) {
                userMgr.sendMsg(userId, 'bank_drawyuanbaos_notify_push', { userId: userId, err: err });
            }
            else {
                var user = null;
                var roomId = roomMgr.getUserRoom(userId);
                var roomInfo = roomMgr.getRoom(roomId);
                if (roomInfo && roomInfo.userMap && roomInfo.userMap[userId]) {
                    user = roomInfo.userMap[userId];
                }
                if (user) {
                    var game = self.games[roomId];
                    var staked = 0;
                    // if (game && game.userStakeMap && game.userStakeMap[userId]) {
                    //     staked = game.userStakeMap[userId];
                    // }
                    user.yuanbaos = userInfo.yuanbaos;
                    user.yuanbaosbank = userInfo.yuanbaosbank;
                    user.coins = userInfo.coins;
                    user.coinsbank = userInfo.coinsbank;
                    userMgr.broacast(roomId, 'bank_drawyuanbaos_notify_push', { userId: userId, yuanbaos: userInfo.yuanbaos, yuanbaosbank: user.yuanbaosbank });
                    userMgr.broacast(roomId, 'user_yuanbaos_notify_push', { userid: userId, yuanbaos: user.yuanbaos, yuanbaosbank: user.yuanbaosbank });
                } else {
                    userMgr.sendMsg(userId, 'bank_drawyuanbaos_notify_push', { err: 'cannot find user' });
                }
            }
        });
    },

    bankSaveCoins: function (userId, coins) {
        var self = this;
        var user = null;
        var roomId = roomMgr.getUserRoom(userId);
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo && roomInfo.userMap && roomInfo.userMap[userId]) {
            user = roomInfo.userMap[userId];
        }
        if (user) {
            var game = self.games[roomId];
            var staked = 0;
            if (game && game.userStakeMap && game.userStakeMap[userId]) {
                staked = game.userStakeMap[userId];
            }
            var canSaveCoins = user.coins - staked;
            if (coins > canSaveCoins) {
                userMgr.sendMsg(userId, 'bank_savecoins_notify_push', { err: 'no enough coins' });
                return;
            }
            db.bank_save_coins(userId, coins, function (err, userInfo) {
                if (err) {
                    userMgr.sendMsg(userId, 'bank_savecoins_notify_push', { err: err });
                }
                else {
                    user.yuanbaos = userInfo.yuanbaos;
                    user.yuanbaosbank = userInfo.yuanbaosbank;
                    user.coins = userInfo.coins;
                    user.coinsbank = userInfo.coinsbank;
                    userMgr.broacast(roomId, 'bank_savecoins_notify_push', { userid: userId, coins: user.coins - staked, coinsbank: user.coinsbank });
                    userMgr.broacast(roomId, 'user_coins_notify_push', { userid: userId, coins: user.coins - staked, coinsbank: user.coinsbank });
                }
            });
        } else {
            userMgr.sendMsg(userId, 'bank_savecoins_notify_push', { err: 'cannot find user' });
            return;
        }
    },

    bankDrawCoins: function (userId, coins) {
        var self = this;
        db.bank_draw_coins(userId, coins, function (err, userInfo) {
            if (err) {
                userMgr.sendMsg(userId, 'bank_drawcoins_notify_push', { userId: userId, err: err });
            }
            else {
                var user = null;
                var roomId = roomMgr.getUserRoom(userId);
                var roomInfo = roomMgr.getRoom(roomId);
                if (roomInfo && roomInfo.userMap && roomInfo.userMap[userId]) {
                    user = roomInfo.userMap[userId];
                }
                if (user) {
                    var game = self.games[roomId];
                    var staked = 0;
                    if (game && game.userStakeMap && game.userStakeMap[userId]) {
                        staked = game.userStakeMap[userId];
                    }
                    user.yuanbaos = userInfo.yuanbaos;
                    user.yuanbaosbank = userInfo.yuanbaosbank;
                    user.coins = userInfo.coins;
                    user.coinsbank = userInfo.coinsbank;
                    userMgr.broacast(roomId, 'bank_drawcoins_notify_push',{ userid: userId, coins: user.coins - staked, coinsbank: user.coinsbank });
                    userMgr.broacast(roomId, 'user_coins_notify_push', { userid: userId, coins: user.coins - staked, coinsbank: user.coinsbank });
                } else {
                    userMgr.sendMsg(userId, 'bank_drawcoins_notify_push', { err: 'cannot find user' });
                }
            }
        });
    },

    tip:function(userId){
        var roomId = roomMgr.getUserRoom(userId);
        if (roomId == null) {
            userMgr.sendMsg(userId,'tip_notify_push',{error:'cannot find room by userid'});
            return;
        }
        var roomInfo = roomMgr.getRoom(roomId);
        if (roomInfo == null) {
            userMgr.sendMsg(userId,'tip_notify_push',{error:'cannot find room'});
            return;
        }
        if (!(roomInfo.conf.tipCoins>0)) {
            userMgr.sendMsg(userId,'tip_notify_push',{error:'tip closed'});
            return;
        }
        var tip = roomInfo.conf.tipCoins;
        var user = roomInfo.userMap[userId];
        if(!user){
            userMgr.sendMsg(userId,'tip_notify_push',{error:'cannot find user'});
            return;
        }
        var game = this.games[roomId];
        var staked = 0;
        if(game&&game.userStakeMap&&game.userStakeMap[userId]){
            staked = game.userStakeMap[userId];
        }
        if(user.coins-staked<tip){
            userMgr.sendMsg(userId,'tip_notify_push',{error:'no enough coins'});
            return;
        }
        if (user.coins - staked >= tip) {
            db.update_user_coins(userId, -tip, function (err) {
                if (err) {
                    userMgr.sendMsg(userId, 'tip_notify_push', { error: 'update_user_coins err' });
                    return;
                } else {
                    user.coins -= tip;
                    userMgr.broacast(roomId, 'tip_notify_push', { tip: tip,userId:userId });
                    //userMgr.broacast(roomId, 'user_coins_notify_push', { userid: userId, coins: user.coins, coinsbank: user.coinsbank });
                    return;
                }
            });
        }
    },
}