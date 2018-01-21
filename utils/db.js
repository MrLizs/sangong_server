var mysql=require("mysql");  
var Fiber = require("fibers");
var crypto = require('./crypto');
var moment = require('../node_modules/moment');

var pool = null;

function nop(a,b,c,d,e,f,g){

}
  
function query(sql,callback){  
    pool.getConnection(function(err,conn){  
        if(err){  
            callback(err,null,null);  
        }else{  
            conn.query(sql,function(qerr,vals,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(qerr,vals,fields);  
            });  
        }  
    });  
};

function get_users_info(userids,callback){
    callback = callback == null? nop:callback;
    if(!userids ||userids.length==0){
        callback(null);
        return;
    }
    var userIdsStr = ''+userids[0];
    if(userids.length>1){
        for(var i=1;i<userids.length;i++){
            userIdsStr+=(','+userids[i]);
        }
    }
    var sql = 'SELECT * FROM t_users WHERE userid in (' + userIdsStr+')';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.init = function(config){
    pool = mysql.createPool({  
        host: config.HOST,
        user: config.USER,
        password: config.PSWD,
        database: config.DB,
        port: config.PORT,
        multipleStatements: config.multipleStatements
    });
};

exports.is_account_exist = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(false);
        return;
    }

    var sql = 'SELECT * FROM t_accounts WHERE account = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(true);
            }
            else{
                callback(false);
            }
        }
    });
};

exports.create_account = function(account,password,callback){
    callback = callback == null? nop:callback;
    if(account == null || password == null){
        callback(false);
        return;
    }

    var psw = crypto.md5(password);
    var sql = 'INSERT INTO t_accounts(account,password) VALUES("' + account + '","' + psw + '")';
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else{
            callback(true);            
        }
    });
};

exports.get_account_info = function(account,password,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }  

    var sql = 'SELECT * FROM t_accounts WHERE account = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        
        if(rows.length == 0){
            callback(null);
            return;
        }
        
        if(password != null){
            var psw = crypto.md5(password);
            if(rows[0].password == psw){
                callback(null);
                return;
            }    
        }

        callback(rows[0]);
    }); 
};

exports.is_user_exist = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(false);
        return;
    }

    var sql = 'SELECT userid FROM t_users WHERE account = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        if(rows.length == 0){
            callback(false);
            return;
        }

        callback(true);
    });  
}


exports.get_user_data = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT userid,account,name,lv,exp,coins,yuanbaos,coinsbank,yuanbaosbank,gems,roomid,sex FROM t_users WHERE account = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        //rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

exports.get_user_data_by_userid = function(userid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }

    var sql = 'SELECT userid,account,dealerid,name,lv,exp,coins,yuanbaos,coinsbank,yuanbaosbank,gems,roomid,sex FROM t_users WHERE userid = ' + userid;
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        //rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

/**获取所有玩家信息 */
exports.get_all_user_data = function(callback){
    callback = callback == null? nop:callback;

    var sql = 'SELECT userid,account,dealerid,name,lv,exp,coins,yuanbaos,coinsbank,yuanbaosbank,gems,roomid,sex FROM t_users';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        // for(var i=0;i<rows.length;i++){
        //     rows[i].name = crypto.fromBase64(rows[i].name);
        // }

        callback(rows);
    });
};

exports.usersQuery = function(searchKey,skip,limit,callback){
    if(!callback){
        return;
    }
    var whereStr = 'where 1=1 ';
    if(searchKey){
        whereStr+= 'and (userid like \'%'+searchKey+'%\' or name like \'%'+searchKey+'%\') ';
    }
    var sql = 'select * from t_users '+whereStr+' order by userid desc limit '+skip+','+limit+' ;';
    sql+='select count(*) as count from t_users '+whereStr+';'
    query(sql, function(err, tables, tablesFields) {
        if (err) {
            callback(err);
        }else{
            callback(null,{users:tables[0],count:tables[1][0].count});
        }
    });
};


/**解绑代理 */
exports.unbind_dealer = function(userid,dealerid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    
    var sql = 'UPDATE t_users SET dealerid = null  WHERE userid = ' + userid;
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows.affectedRows > 0);
            return; 
        } 
    });
};

/* 绑定代理 */
exports.bind_dealer = function(userid, dealerid, callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    
    var sql = 'UPDATE t_users SET dealerid = ' + dealerid + '  WHERE userid = ' + userid + ' AND dealerid == null';
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows.affectedRows > 0);
            return; 
        } 
    });
};

/**增加玩家房卡 */
exports.add_user_gems = function(userid,dealerid,gems,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    var sql = 'UPDATE t_users SET gems = gems +' + gems + ' WHERE userid = ' + userid;
    if(dealerid){
        sql = 'UPDATE t_users SET gems = gems +' + gems + ',dealerid = ' + dealerid + ' WHERE userid = ' + userid;
    }
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows.affectedRows > 0);
            return; 
        } 
    });
};

/**增加玩家房卡 */
exports.usersAddUserGems = function(userid,gems,callback){
    callback = callback == null? nop:callback;
    if(!(userid >0)){
        callback('invalid userid');
        return;
    }
    var sql = 'UPDATE t_users SET gems = gems +' + gems + ' WHERE userid = ' + userid+';';
    sql += 'select gems from t_users WHERE userid = ' + userid+';';
    query(sql,function(err,tables,tablesFields){
        if(err){
            callback(err);
        }
        else{
            callback(null,tables[1][0].gems);
        } 
    });
};
/**增加玩家金币 */
exports.usersAddUserCoins = function(userid,coins,callback){
    callback = callback == null? nop:callback;
    if(!(userid >0)){
        callback('invalid userid');
        return;
    }
    var sql = 'UPDATE t_users SET coins = coins +' + coins + ' WHERE userid = ' + userid+';';
    sql += 'select coins from t_users WHERE userid = ' + userid+';';
    query(sql,function(err,tables,tablesFields){
        if(err){
            callback(err);
        }
        else{
            callback(null,tables[1][0].coins);
        } 
    });
};
/**增加玩家元宝 */
exports.usersAddUserGamegold = function(userid,gamegold,callback){
    callback = callback == null? nop:callback;
    if(!(userid >0)){
        callback('invalid userid');
        return;
    }
    var sql = 'UPDATE t_users SET yuanbaos = yuanbaos +' + gamegold + ' WHERE userid = ' + userid+';';
    sql += 'select yuanbaos from t_users WHERE userid = ' + userid+';';
    query(sql,function(err,tables,tablesFields){
        if(err){
            callback(err);
        }
        else{
            callback(null,tables[1][0].yuanbaos);
        } 
    });
};
exports.get_gems = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT gems FROM t_users WHERE account = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows[0]);
    });
}; 

exports.get_user_history = function(userId,callback){
    callback = callback == null? nop:callback;
    if(userId == null){
        callback(null);
        return;
    }

    var sql = 'SELECT history FROM t_users WHERE userid = "' + userId + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        var history = rows[0].history;
        if(history == null || history == ""){
            callback(null);    
        }
        else{
            console.log(history.length);
            history = JSON.parse(history);
            callback(history);
        }        
    });
};

exports.update_user_history = function(userId,history,callback){
    callback = callback == null? nop:callback;
    if(userId == null || history == null){
        callback(false);
        return;
    }

    history = JSON.stringify(history);
    var sql = 'UPDATE t_users SET roomid = null, history = \'' + history + '\' WHERE userid = "' + userId + '"';
    //console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }

        if(rows.length == 0){
            callback(false);
            return;
        }

        callback(true);
    });
};

exports.get_games_of_room = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(null);
        return;
    }

    var sql = 'SELECT game_index,create_time,result FROM t_games_archive WHERE room_uuid = "' + room_uuid + '"';
    //console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows);
    });
};

exports.get_detail_of_game = function(room_uuid,index,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null || index == null){
        callback(null);
        return;
    }
    var sql = 'SELECT base_info,action_records FROM t_games_archive WHERE room_uuid = "' + room_uuid + '" AND game_index = ' + index ;
    //console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows[0]);
    });
}

exports.create_user = function(account,name,coins,yuanbaos,gems,sex,headimg,callback){
    callback = callback == null? nop:callback;
    if(account == null || name == null || coins==null||yuanbaos==null|| gems==null){
        callback(false);
        return;
    }
    if(headimg){
        headimg = '"' + headimg + '"';
    }
    else{
        headimg = 'null';
    }
    //name = crypto.toBase64(name);
    var sql = 'INSERT INTO t_users(account,name,coins,yuanbaos,gems,sex,headimg) VALUES("{0}","{1}",{2},{3},{4},{5},{6})';
    sql = sql.format(account,name,coins,yuanbaos,gems,sex,headimg);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            //throw err;
            callback(false);
        }
        callback(true);
    });
};

exports.update_user_info = function(userid,name,headimg,sex,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }
 
    if(headimg){
        headimg = '"' + headimg + '"';
    }
    else{
        headimg = 'null';
    }
    //name = crypto.toBase64(name);
    var sql = 'UPDATE t_users SET name="{0}",headimg={1},sex={2} WHERE account="{3}"';
    sql = sql.format(name,headimg,sex,userid);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

exports.get_user_base_info = function(userid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }
    var sql = 'SELECT name,sex,headimg FROM t_users WHERE userid={0}';
    sql = sql.format(userid);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        //rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

exports.is_room_exist = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

exports.cost_gems = function(userid,cost,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_users SET gems = gems -' + cost + ' WHERE userid = ' + userid;
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

//批量更新元宝数量并记录玩家成绩
exports.update_users_yuanbaos = function(userMap,game,callback){
    callback = callback == null? nop:callback;
    var sql ='';
    for(var userId in userMap){
        if(userMap[userId]){
            var yuanbaos = userMap[userId].result;
            sql += 'UPDATE t_users SET yuanbaos = yuanbaos +(' + yuanbaos + ') WHERE userid = ' + userId + '; ';
            //sql += build_sql_create_user_game_result(userId,game.roomInfo.uuid,game.gameIndex,game.conf.type,'yuanbao',yuanbaos);
        }
    }
    if(sql.length>0){
        console.log(sql);
        query(sql, function(err, rows, fields) {
            if(err){
                callback(err);
            }
            else{
                callback();
            }
        });
    }else{
        callback();
    }
};

//更新元宝数量并记录玩家成绩
exports.update_user_yuanbaos = function (userId, result, callback) {
    callback = callback == null ? nop : callback;
    var sql = 'UPDATE t_users SET yuanbaos = (yuanbaos +(' + result + ')) WHERE userid = ' + userId + '; ';
    console.log(sql);
    query(sql, function (err, rows, fields) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
};

//更新金币数量
exports.update_user_coins = function (userId, result, callback) {
    callback = callback == null ? nop : callback;
    var sql = 'UPDATE t_users SET coins = (coins +(' + result + ')) WHERE userid = ' + userId + '; ';
    console.log(sql);
    query(sql, function (err, rows, fields) {
        if (err) {
            callback(err);
        }
        else {
            callback();
        }
    });
};

//银行取金币
exports.bank_draw_coins = function(userid,coins,callback){
    exports.get_user_data_by_userid(userid,function(user){
        if(user){
            if(user.coinsbank>=coins){
                var sql = 'UPDATE t_users SET coinsbank = coinsbank -' + coins + ',coins=coins+'+coins+' WHERE userid = ' + userid;
                console.log(sql);
                query(sql, function(err, rows, fields) {
                    if(err){
                        callback(err);
                    }
                    else{
                        user.coins+=coins;
                        user.coinsbank-=coins;
                        callback(null,user);
                    }
                });
            }else{
                callback('no enough coins in the bank.');
            }
        }else{
            callback('no user finded by userid.');
        }
    });
};

//银行存金币
exports.bank_save_coins = function(userid,coins,callback){
    exports.get_user_data_by_userid(userid,function(user){
        if(user){
            if(user.coins>=coins){
                var sql = 'UPDATE t_users SET coinsbank = coinsbank +' + coins + ',coins=coins-'+coins+' WHERE userid = ' + userid;
                console.log(sql);
                query(sql, function(err, rows, fields) {
                    if(err){
                        callback(err);
                    }
                    else{
                        user.coins-=coins;
                        user.coinsbank+=coins;
                        callback(null,user);
                    }
                });
            }else{
                callback('no enough coins to save.');
            }
        }else{
            callback('no user finded by userid.');
        }
    });
};

//银行取元宝
exports.bank_draw_yuanbaos = function(userid,yuanbaos,callback){
    exports.get_user_data_by_userid(userid,function(user){
        if(user){
            if(user.yuanbaosbank>=yuanbaos){
                var sql = 'UPDATE t_users SET yuanbaosbank = yuanbaosbank -' + yuanbaos + ',yuanbaos=yuanbaos+'+yuanbaos+' WHERE userid = ' + userid;
                console.log(sql);
                query(sql, function(err, rows, fields) {
                    if(err){
                        callback(err);
                    }
                    else{
                        user.yuanbaos+=yuanbaos;
                        user.yuanbaosbank-=yuanbaos;
                        callback(null,user);
                    }
                });
            }else{
                callback('no enough yuanbaos in the bank.');
            }
        }else{
            callback('no user finded by userid.');
        }
    });
};

//银行存元宝
exports.bank_save_yuanbaos = function(userid,yuanbaos,callback){
    exports.get_user_data_by_userid(userid,function(user){
        if(user){
            if(user.yuanbaos>=yuanbaos){
                var sql = 'UPDATE t_users SET yuanbaosbank = yuanbaosbank +' + yuanbaos + ',yuanbaos=yuanbaos-'+yuanbaos+' WHERE userid = ' + userid;
                console.log(sql);
                query(sql, function(err, rows, fields) {
                    if(err){
                        callback(err);
                    }
                    else{
                        user.yuanbaos-=yuanbaos;
                        user.yuanbaosbank+=yuanbaos;
                        callback(null,user);
                    }
                });
            }else{
                callback('no enough yuanbaos to save.');
            }
        }else{
            callback('no user finded by userid.');
        }
    });
};

exports.set_room_id_of_user = function(userId,roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId != null){
        roomId = '"' + roomId + '"';
    }
    var sql = 'UPDATE t_users SET roomid = '+ roomId + ' WHERE userid = "' + userId + '"';
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if(err){
            console.log(err);
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

exports.get_room_id_of_user = function(userId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT roomid FROM t_users WHERE userid = "' + userId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0].roomid);
            }
            else{
                callback(null);
            }
        }
    });
};

exports.clear_room_id_of_user = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_users SET roomid = null WHERE roomid = "' + roomId + '"';
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if(err){
            callback(err);
        }
        else{
            callback(null);
        }
    });
};


// exports.create_room = function(roomId,conf,ip,port,create_time,callback){
//     callback = callback == null? nop:callback;
//     var sql = "INSERT INTO t_rooms(uuid,id,base_info,ip,port,create_time) VALUES('{0}','{1}','{2}','{3}',{4},{5});";
//     var uuid = Date.now() + roomId;
//     var baseInfo = JSON.stringify(conf);
//     sql = sql.format(uuid,roomId,baseInfo,ip,port,create_time);
//     console.log(sql);
//     query(sql,function(err,row,fields){
//         if(err){
//             callback(null);
//             throw err;
//         }
//         else {
//             callback(uuid);
//         }
//     });
// };

exports.create_room = function(roomId,conf,ip,port,create_time,callback,userInfos){
    callback = callback == null? nop:callback;
    
    var uuid = Date.now() + roomId;
    var baseInfo = JSON.stringify(conf);
    if (userInfos && userInfos.length > 0) {
        var sql = "INSERT INTO t_rooms(uuid,id,base_info,ip,port,create_time,user_infos) VALUES('{0}','{1}','{2}','{3}',{4},{5},'{6}');";
        var uuid = Date.now() + roomId;
        var baseInfo = JSON.stringify(conf);
        sql = sql.format(uuid, roomId, baseInfo, ip, port, create_time, JSON.stringify(userInfos));
    } else {
        var sql = "INSERT INTO t_rooms(uuid,id,base_info,ip,port,create_time) VALUES('{0}','{1}','{2}','{3}',{4},{5});";
        sql = sql.format(uuid, roomId, baseInfo, ip, port, create_time);
    }
    console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(null);
            throw err;
        }
        else {
            callback(uuid);
        }
    });
};

exports.get_room_uuid = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT uuid FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows[0].uuid);
        }
    });
};

exports.update_num_of_turns = function(roomId,numOfTurns,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_rooms SET num_of_turns = {0} WHERE id = "{1}"'
    sql = sql.format(numOfTurns,roomId);
    //console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};


exports.update_next_button = function(roomId,nextButton,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_rooms SET next_button = {0} WHERE id = "{1}"'
    sql = sql.format(nextButton,roomId);
    //console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.get_room_addr = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(false,null,null);
        return;
    }

    var sql = 'SELECT ip,port FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false,null,null);
            throw err;
        }
        if(rows.length > 0){
            callback(true,rows[0].ip,rows[0].port);
        }
        else{
            callback(false,null,null);
        }
    });
};

exports.get_room_data = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql, function (err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if (rows.length > 0) {
            var roomData = rows[0];
            if (roomData.user_infos && roomData.user_infos.length > 0) {
                roomData.userInfos = JSON.parse(roomData.user_infos);
                var userIds = [];
                for (var i = 0; i < roomData.userInfos.length; i++) {
                    userIds.push(roomData.userInfos[i].userId);
                }
                get_users_info(userIds, function (userRows) {
                    if (userRows && userRows.length > 0) {
                        for (var i = 0; i < roomData.userInfos.length; i++) {
                            for (var j = 0; i < userRows.length; j++) {
                                if (roomData.userInfos[i].userId == userRows[j].userid) {
                                    roomData.userInfos[i].headimg = userRows[j].headimg;
                                    roomData.userInfos[i].name = userRows[j].name;
                                    roomData.userInfos[i].sex = userRows[j].sex;
                                    break;
                                }
                            }
                        }
                    }
                    callback(roomData);
                });
            } else {
                callback(roomData);
            }
        }
        else {
            callback(null);
        }
    });
};

exports.delete_room = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(false);
    }
    var sql = "DELETE FROM t_rooms WHERE id = '{0}'";
    sql = sql.format(roomId);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}

exports.create_game = function(room_uuid,index,base_info,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_games(room_uuid,game_index,base_info,create_time) VALUES('{0}',{1},'{2}',unix_timestamp(now()))";
    sql = sql.format(room_uuid,index,base_info);
    //console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows.insertId);
        }
    });
};

exports.delete_games = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(false);
    }    
    var sql = "DELETE FROM t_games WHERE room_uuid = '{0}'";
    sql = sql.format(room_uuid);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}

exports.archive_games = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(false);
    }
    var sql = "INSERT INTO t_games_archive(SELECT * FROM t_games WHERE room_uuid = '{0}')";
    sql = sql.format(room_uuid);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            exports.delete_games(room_uuid,function(ret){
                callback(ret);
            });
        }
    });
}

exports.create_archive_game = function(room_uuid,index,base_info,result,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_games_archive(room_uuid,game_index,base_info,create_time,result) VALUES('{0}',{1},'{2}',unix_timestamp(now()),'{3}')";
    sql = sql.format(room_uuid,index,base_info,JSON.stringify(result));
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows.insertId);
        }
    });
};

exports.update_game_action_records = function(room_uuid,index,actions,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_games SET action_records = '"+ actions +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    //console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.update_game_result = function(room_uuid,index,result,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null || result){
        callback(false);
    }
    
    result = JSON.stringify(result);
    var sql = "UPDATE t_games SET result = '"+ result +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    //console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.get_message = function(type,version,callback){
    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM t_message WHERE type = "'+ type + '"';
    
    if(version == "null"){
        version = null;
    }
    
    if(version){
        version = '"' + version + '"';
        sql += ' AND version != ' + version;   
    }
     
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0]);    
            }
            else{
                callback(null);
            }
        }
    });
};

exports.get_user_game_result_count = function(userId,moneyType,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT count(1) FROM t_user_game_results WHERE result_type = "'+ moneyType + '" and userid = '+userId;
    query(sql, function(err, rows, fields) {
        if(err){
            callback(err);
        }
        else{
            if(rows.length > 0){
                callback(null,rows[0][0]);    
            }
            else{
                callback(null,null);
            }
        }
    });
};

exports.get_user_game_results = function(userId,moneyType,skip,limit,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_user_game_results WHERE result_type = "'+ moneyType + '" and userid = '+userId+' ORDER BY id DESC limit '+skip+','+limit;
    query(sql, function(err, rows, fields) {
        if(err){
            callback(err);
        }
        else{
            if(rows.length > 0){
                callback(null,rows);    
            }
            else{
                callback(null,null);
            }
        }
    });
};

exports.create_user_game_yuanbao_results = function(userMap,game,callback){
    callback = callback == null? nop:callback;
    var sql='';
    for(var userId in userMap){
        if(userMap[userId]){
            var yuanbaos = userMap[userId].result;
            sql += build_sql_create_user_game_result(userId,game.roomInfo.uuid,game.gameIndex,game.conf.type,'yuanbao',yuanbaos);
        }
    }
    if(sql.length>0){
        console.log(sql);
        query(sql,function(err,rows,fields){
            if(err){
                callback(err);
            }
            else{
                callback();
            }
        });
    }
};

exports.create_user_game_result = function(userId,roomUuid,gameIndex,gameType,moneyName,money,callback){
    callback = callback == null? nop:callback;
    sql = build_sql_create_user_game_result(userId,roomUuid,gameIndex,gameType,moneyName,money);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(err);
        }
        else{
            callback(null,rows.insertId);
        }
    });
};

function build_sql_create_user_game_result(userId,roomUuid,gameIndex,gameType,moneyName,money){
    var sql = "INSERT INTO t_user_game_results(userid,room_uuid,game_index,game_type,create_time,result_type,result_value) VALUES(?,?,?,?,?,?,?);";
    sql = mysql.format(sql,[userId,roomUuid,gameIndex,gameType,new Date(),moneyName,money]);
    return sql;
};

exports.get_config = function(id,callback){
    var sql = 'select str from t_configs where id=?';
    sql=mysql.format(sql,[id]);
    query(sql,function(err,rows,fields){
        if(err){
            callback(err);
        }
        else{
            if(rows.length>0){
                callback(null,rows[0].str);
            }else{
                callback(null,null);
            }

        }
    });
};

exports.set_config = function(id,str,callback){
    var sql = 'UPDATE t_configs SET str = ? WHERE id = ? ;';
    sql = mysql.format(sql,[str,id]);
    query(sql,function(err,rows,fields){
        if(err){
            callback(err);
        }else if(rows.affectedRows > 0){
            callback();
        }else{
            callback('no data updated');
        }
    });
};

exports.get_admin_info = function(userName,password,callback){
    callback = callback == null? nop:callback;
    if(!userName||!password){
        callback('no userName or password');
        return;
    }
    var sql = 'SELECT * FROM t_admins WHERE userName = ? and password = ?';
    sql = mysql.format(sql,[userName,crypto.md5(password)]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows[0]);
    }); 
};

exports.auth_admin = function(userName,passwordStr,callback){
    callback = callback == null? nop:callback;
    if(!userName||!passwordStr){
        callback('no userName or passwordStr');
        return;
    }
    var sql = 'SELECT * FROM t_admins WHERE userName = ? and password = ?';
    sql = mysql.format(sql,[userName,passwordStr]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows[0]);
    }); 
};

exports.create_admin = function(userName,password,callback){
    callback = callback == null? nop:callback;
    if(!userName || !password){
        callback('no userName or no password');
        return;
    }
    password = crypto.md5(password);
    var sql = 'INSERT INTO t_admins(userName,password) VALUES(?,?)';
    sql = mysql.format(sql,[userName,password]);
    query(sql, function(err, rows, fields) {
        callback(err);
    });
};

/**获取最新的用户获取奖品信息 */
exports.get_last_user_get_gift = function(userId, type, callback){
    callback = callback == null? nop:callback;
    var sql = 'select * from t_user_get_gift where userId=? and type=? order by id desc limit 1;';
    sql = mysql.format(sql,[userId,type]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback(null,null);
            return;
        }
        if(rows[0].giftInfo){
            rows[0].giftInfo=JSON.parse(rows[0].giftInfo);
        }
        callback(null,rows[0]);
    }); 
}

/**创建用户获取奖品信息 */
exports.create_user_get_gift = function(userId, type, seriesNo, giftInfo, callback){
    callback = callback == null? nop:callback;
    if(!userId || !type||!(seriesNo>=0)||!giftInfo){
        callback('Wrong Params');
        return;
    }
    var sql = 'INSERT INTO t_user_get_gift(userId,createTime,type,seriesNo,giftInfo) VALUES(?,?,?,?,?)';
    sql = mysql.format(sql,[userId,new Date(),type, seriesNo, JSON.stringify(giftInfo)]);
    query(sql, function(err, rows, fields) {
        callback(err);
    });
}

var getMoneyField = function(moneyType){
    switch(moneyType){
        case 'coin':return 'coins';
        case 'yuanbao':return 'yuanbaos';
        case 'gem': return 'gems';
    }
    return null;
}

//同步更新金币数量
var addUserMoney = function (userId, money,moneyType) {
    var moneyField = getMoneyField(moneyType);
    var sql = 'UPDATE t_users SET '+moneyField+' = ('+moneyField+' +(?)) WHERE userid = ?;';
    sql = mysql.format(sql,[money,userId]);
    var fiber = Fiber.current;  
    query(sql, function (err, rows, fields) {
        if(err||!(rows.affectedRows > 0)){
            fiber.run({err:err});
        }else if(rows.affectedRows > 0){
            fiber.run({msg:'addUserMoney success'});
        }else{
            fiber.run({err:'no record updated'});
        }
    });
    var ret = Fiber.yield();
    return ret;
};

//同步加入游戏结果
var addGameResult = function (userId,roomUuid,gameIndex,gameType, money,moneyType) {
    var sql = "INSERT INTO t_user_game_results(userid,room_uuid,game_index,game_type,create_time,result_type,result_value) VALUES(?,?,?,?,?,?,?);";
    sql = mysql.format(sql,[userId,roomUuid,gameIndex,gameType,new Date(),moneyType,money]);
    var fiber = Fiber.current;  
    query(sql, function (err, rows, fields) {
        if(err){
            fiber.run({err:err});
        }else{
            fiber.run({msg:'addGameResult success'});
        }
    });
    var ret = Fiber.yield();
    return ret;
};

//同步加入领奖信息
var addUserGetGift = function (userId,type,seriesNo,giftInfo) {
    var sql = 'INSERT INTO t_user_get_gift(userId,createTime,type,seriesNo,giftInfo) VALUES(?,?,?,?,?)';
    sql = mysql.format(sql,[userId,new Date(),type, seriesNo, JSON.stringify(giftInfo)]);
    var fiber = Fiber.current;  
    query(sql, function (err, rows, fields) {
        if(err){
            fiber.run({err:err});
        }else{
            fiber.run({msg:'addUserGetGift success'});
        }
    });
    var ret = Fiber.yield();
    return ret;
};

exports.balanceGame = function(balanceInfos,callback) {
    callback = callback == null? nop:callback;
    Fiber(function() {
        console.log('balanceGame begin:')
        for(var i = 0;i<balanceInfos.length;i++){
            var balance = balanceInfos[i];
            var ret1 = addUserMoney(balance.userId,balance.money,balance.moneyType);
            console.log(ret1);
            var ret2 = addGameResult(balance.userId,balance.roomUuid,balance.gameIndex,balance.gameType,balance.money,balance.moneyType);
            console.log(ret2);
        }
        console.log('balanceGame end')
        callback();
    }).run();
}

exports.sendGiftToUser=function(userId,type,seriesNo,gift,callback){
    callback = callback == null? nop:callback;
    Fiber(function() {
        if(gift.gems>0){
            var ret1 = addUserMoney(userId,gift.gems,'gem'); 
            console.log(ret1);
        }
        if(gift.coins>0){
            var ret2 = addUserMoney(userId,gift.coins,'coin'); 
            console.log(ret2);
        }
        if(gift.yuanbaos>0){
            var ret3 = addUserMoney(userId,gift.yuanbaos,'yuanbao'); 
            console.log(ret3);
        }
        var ret = addUserGetGift(userId,type,seriesNo,gift);
        console.log(ret);
        callback();
    }).run();
}

exports.create_order = function (money, good, userId, callback) {
    callback = callback == null ? nop : callback;
    if (!(money >= 0) || !good) {
        callback(null);
        return;
    }
    var sql = "INSERT INTO orders(orderNum,money,goodInfo,createTime,userId,detailInfo) values(?,?,?,?,?,?)";
    var orderNum = moment().format('YYYYMMDDHHmmssSSS') + parseInt(Math.random() * 10, 10) + parseInt(Math.random() * 10, 10) + parseInt(Math.random() * 10, 10) + parseInt(Math.random() * 10, 10);
    var insert = [orderNum, money, good.type + '_' + good.index, new Date(), userId, JSON.stringify({ good: good })];
    sql = mysql.format(sql, insert);
    query(sql, function (err, rows, fields) {
        if (err) {
            if (err.code == 'ER_DUP_ENTRY') {
                callback(null);
                return;
            }
            callback(null);
        }
        else {
            callback(orderNum);
        }
    });
};

exports.pay_order = function (orderNum, paidMoney, callback) {
    callback = callback == null ? nop : callback;
    if (!orderNum || !(paidMoney >= 0)) {
        callback('params error');
        return;
    }
    exports.get_order(orderNum,function(order){
        if(order){
            order.state = 'paid';
            order.payTime = new Date();
            order.paidMoney = paidMoney;
            var sql = 'UPDATE orders SET state = ?,payTime=?,paidMoney=? where orderNum = ? and state=?';
            var insert = [order.state, order.payTime, order.paidMoney, orderNum,'noPay'];
            sql = mysql.format(sql, insert);
            query(sql, function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    callback(err);
                    return;
                }else {
                    if(rows.affectedRows>=1){
                        callback(null,order);
                    }else{
                        callback(null,null);
                    }
                }
            });
        }else{
            callback('Can not find order by ordernum.');
        }
    });

};

exports.get_order = function (orderNum, callback) {
    callback = callback == null ? nop : callback;
    if (!orderNum) {
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM orders where orderNum = ?';
    var params = [orderNum];

    sql = mysql.format(sql, params);

    query(sql, function (err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if (rows.length == 0) {
            callback(null);
            return;
        }
        var order = rows[0];
        if(typeof order.detailInfo == 'string'){
            order.detailInfo = JSON.parse(order.detailInfo);
        }
        callback(order);
    });
};
//---------------------------
function create_user_log(userid){//玩家登陆记录  status ：1登陆
    exports.get_user_data_by_userid(userid,function(user){
        var status=1;
        var sql = 'INSERT INTO t_users_log(userid,name,status,first_login_time,last_login_time,last_logout_time) VALUES({0},"{1}",{2},unix_timestamp(now()),unix_timestamp(now()),unix_timestamp(now()))';
        sql = sql.format(userid,user.name,status);
        console.log(sql);
        query(sql, function(err, rows, fields) {
            if (err) {
                throw err;
                return false;
            }
            return true;
        });
    });
};

exports.user_online_log = function(userid,online,callback){//玩家是否在线 0 不在线 1三公 2三公金币场 3五子棋
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    if(online==0)var sql = 'UPDATE t_users_log SET status = "'+0+'" AND last_logout_time = unix_timestamp(now()) WHERE userid = ' + userid;
    else         var sql = 'UPDATE t_users_log SET status = "'+online+'" AND last_login_time = unix_timestamp(now()) WHERE userid = ' + userid;
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            if(rows.affectedRows == 0){
                create_user_log(userid);
                callback(true);
                return;
            }else if(rows.affectedRows >= 0){
                callback(true);
                return;
            }
            callback(false);
            return; 
        } 
    });
    //name = crypto.toBase64(name);
};

exports.get_user_log = function(callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_user_log';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows);    
            }
            else{
                callback(null);
            }
        }
    });
}

exports.get_money_log = function(callback){//所有的金额记录
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_user_game_results';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows);    
            }
            else{
                callback(null);
            }
        }
    });
}

exports.add_user_money=function(userId,money,callback){//跟玩家加物品
    callback = callback == null? nop:callback;
    Fiber(function() {
        if(money.gems>0){
            var ret1 = addUserMoney(userId,money.gems,'gem'); 
            console.log(ret1);
        }
        if(money.coins>0){
            var ret2 = addUserMoney(userId,money.coins,'coin'); 
            console.log(ret2);
        }
        if(money.yuanbaos>0){
            var ret3 = addUserMoney(userId,money.yuanbaos,'yuanbao'); 
            console.log(ret3);
        }
        callback();
    }).run();
}

var add_dealer_money_type = function (userId, money,moneyType) {
    var moneyField = getMoneyField(moneyType);
    var sql = 'UPDATE t_dealer_manage SET '+moneyField+' = ('+moneyField+' +(?)) WHERE dealerid = ?;';
    sql = mysql.format(sql,[money,userId]);
    var fiber = Fiber.current;  
    query(sql, function (err, rows, fields) {
        if(err||!(rows.affectedRows > 0)){
            fiber.run({err:err});
        }else if(rows.affectedRows > 0){
            fiber.run({msg:'addUserMoney success'});
        }else{
            fiber.run({err:'no record updated'});
        }
    });
    var ret = Fiber.yield();
    return ret;
};

exports.add_dealer_money=function(userId,money,callback){//增加代理物品
    callback = callback == null? nop:callback;
    Fiber(function() {
        if(money.gems>0){
            var ret1 = add_dealer_money_type(userId,money.gems,'gem'); 
            console.log(ret1);
        }
        if(money.coins>0){
            var ret2 = add_dealer_money_type(userId,money.coins,'coin'); 
            console.log(ret2);
        }
        if(money.yuanbaos>0){
            var ret3 = add_dealer_money_type(userId,money.yuanbaos,'yuanbao'); 
            console.log(ret3);
        }
        callback();
    }).run();
}

exports.create_dealer = function(dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins,callback){
    callback = callback == null? nop:callback;
    if(!dealerid||!name ||!dealer_tel||!yuanbaos_dis||
       !gems_dis||!coins_dis||!coins_dis||!level||!gems||!coins){
        callback(false);
        return;
    }
    //name = crypto.toBase64(name);
    var sql = 'INSERT INTO t_dealer_manage(dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins,create_time) VALUES({0},"{1}",{2},{3},{4},{5},{6},{7},{8},{9},Date.now())';
    sql = sql.format(dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(true);
    });
};
exports.delete_dealer = function(dealerid,callback){
    callback = callback == null? nop:callback;
    if(dealerid == null){
        callback(false);
    }
    var sql = "DELETE FROM t_dealer_manage WHERE id = {0}";
    sql = sql.format(dealerid);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}
exports.get_all_dealer_data = function(callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_dealer_manage';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.update_dealer_data = function(oldid,dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins,callback){
    callback = callback == null? nop:callback;
    if( ! oldid        || ! dealerid || ! name      ||! dealer_tel||
        ! yuanbaos_dis || ! gems_dis || ! coins_dis ||! coins_dis ||
        ! level        || ! gems     || ! coins ){
        callback(false);
        return;
    }
    var sql = 'UPDATE t_dealer_manage SET dealerid={0},name="{1}",dealer_tel={2},yuanbaos_dis={3},gems_dis={4},coins_dis={5},level={6},yuanbaos={7},gems={8},coins={9} WHERE dealerid='+oldid;
    sql = sql.format(dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

exports.add_deal_log = function(dealerid,action,count,userid,dealer_gems,dealer_coins,dealer_yuanbaos,user_yuanbaos,user_gems,user_coins,callback){
    callback = callback == null? nop:callback;
    if( !dealerid     || !type       || !action      || !count|| 
        !userid       || !dealer_gems|| !dealer_coins||
        !user_yuanbaos|| !user_gems  || !user_coins  ){
        callback(false);
        return;
    }
    var sql = 'INSERT INTO t_deal_log(dealerid,time,type,action,count,userid,dealer_gems,dealer_coins,dealer_yuanbaos,user_yuanbaos,user_gems,user_coins) VALUES({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11})';
    sql = sql.format(dealerid,Date.now(),type,action,count,userid,dealer_gems,dealer_coins,dealer_yuanbaos,user_yuanbaos,user_gems,user_coins);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(true);
    });
};

exports.add_user_online_payment_log = function(userid,name,type,count,callback){
    callback = callback == null? nop:callback;
    if( !userid || !name|| !type|| !count){
        callback(false);
        return;
    }
    var sql = 'INSERT INTO t_user_online_payment(userid,name,time,type,count) VALUES({0},"{1}",{2},{3},{4})';
    sql = sql.format(dealerid,name,Date.now(),type,count);
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(true);
    });
};

exports.get_user_online_payment_log = function(userid,name,type,count,callback){
    callback = callback == null? nop:callback;
    // userid,name,time,type,count
    if( !userid || !name|| !type|| !count){
        callback(false);
        return;
    }
    //name = crypto.toBase64(name);
    var sql = 'SELECT * FROM t_user_online_payment';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.set_punish_list = function(userid,callback){//加入黑名单
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    //name = crypto.toBase64(name);
    var sql = 'INSERT INTO t_punish_list(punish_id) VALUES({0})';
    sql = sql.format(userid);
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else{
            callback(true);            
        }
    });
};

exports.delete_punish_list = function(userid,callback){//删除黑名单
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }

    var sql = "DELETE FROM t_punish_list WHERE id = '{0}'";
    sql = sql.format(userid);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.get_punish_list = function(callback){
    callback = callback == null? nop:callback;
    //name = crypto.toBase64(name);
    var sql = 'SELECT * FROM t_punish_list';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.get_shop_list = function(callback){
    callback = callback == null? nop:callback;
    //name = crypto.toBase64(name);
    var sql = 'SELECT * FROM t_shop_list';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.set_shop_list = function(type_1,price_1,count_1,type_2,price_2,count_2,type_3,price_3,count_3,callback){
    callback = callback == null? nop:callback;
    //name = crypto.toBase64(name);
    var sql = 'UPDATE t_shop_list SET type_1="{0}",price_1={1},count_1={2},type_2="{3}",price_2={4},count_2={5},type_3="{6}",price_3={7},count_3={8}';
    sql = sql.format(type_1,price_1,count_1,type_2,price_2,count_2,type_3,price_3,count_3);
    console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows.affectedRows > 0);
            return; 
        } 
    });
};

exports.get_dealer_user_list = function(dealerid,callback){
    callback = callback == null? nop:callback;
    //name = crypto.toBase64(name);
    var sql = 'SELECT userid,name FROM t_users WHERE dealerid = "' + dealerid + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        if(rows.length == 0){
            callback(false);
            return;
        }
        callback(true);
    });  
};


exports.get_username = function(userid,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT name FROM t_users WHERE userid="'+userid+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.get_user_log = function(userid,begintime,endtime,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_user_game_results WHERE userid="'+userid+'" AND create_time>"'+ begintime +'" AND create_time<"'+endtime+'"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows);
    });
};

exports.update_Shop = function(shopStr,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_configs SET str='"+shopStr+"' WHERE id='shop'";

    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows);
            return; 
        } 
    });
};

exports.get_orders = function(callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `orders` WHERE state != 'noPay'";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        // if(rows.length == 0){
        //     callback(null);
        //     return;
        // }
        callback(rows);
    });
};

exports.get_Agency = function(callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_agencyManager`";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        // if(rows.length == 0){
        //     callback(null);
        //     return;
        // }
        callback(rows);
    });
};

exports.get_AgencyByID = function(username,callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_agencyManager` WHERE userName=?";
    sql = mysql.format(sql,[username]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        // if(rows.length == 0){
        //     callback(null);
        //     return;
        // }
        callback(rows);
    });
};


exports.add_Agencvy = function(account,password,realname,contactway,coinsdiscount,gamegolddiscount,gamsdiscount,level,upid,callback){
    var psw = crypto.md5(password);
    var sql = 'INSERT INTO t_agencyManager(userName,password,realname,contactway,accountbalance,coinsdiscount,gamegolddiscount,gamsdiscount,createTime,level,uplevelID) VALUES(?,?,?,?,?,?,?,?,?,?,?);';
    sql = mysql.format(sql,[account,psw,realname,contactway,0,coinsdiscount,gamegolddiscount,gamsdiscount,new Date(),level,upid]);
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;
            }
            callback(false);
            throw err;
        }
        else{
            callback(true);            
        }
    });
};

exports.get_SelectAgency = function(param,value,callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_agencyManager` WHERE "+param+"='"+value+"'";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        else if(rows.length > 0){
            callback(rows[0]);
            return;
        }
    });
};

exports.update_agencyLock = function(value,username,callback){
    callback = callback == null? nop:callback;

    var sql = "UPDATE t_agencyManager SET accountlock=? WHERE userName=?";

    sql = mysql.format(sql,[value,username]);

    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            if(rows.affectedRows > 0){
                callback("ok");
            }
            else{
                callback("失败");
            }
        } 
    });
};

exports.update_agencyPay = function(type,value,username,callback){
    callback = callback == null? nop:callback;

    var sql = "";
    if(type == 0){
        sql = "UPDATE t_agencyManager SET coins=? WHERE userName=?";
    }
    else if(type == 1){
        sql = "UPDATE t_agencyManager SET gamegold=? WHERE userName=?";
    }
    else if(type == 2){
        sql = "UPDATE t_agencyManager SET gams=? WHERE userName=?";
    }
    sql = mysql.format(sql,[value,username]);

    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows);
            return; 
        } 
    });
};

exports.get_brokerageHistory = function(callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_brokerageHistory`";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        else if(rows.length > 0){
            callback(rows);
            return;
        }
    });
};
exports.get_brokerageHistoryByID = function(username,callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_brokerageHistory` WHERE userName=?";
    sql = mysql.format(sql,[username]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        else if(rows.length > 0){
            callback(rows);
            return;
        }
    });
};

exports.get_controlHistory = function(callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_controlHistory`";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        if(rows.length == 0){
            callback(null);
            return;
        }
        else if(rows.length > 0){
            callback(rows);
            return;
        }
    });
};

exports.add_controlHistory = function(id,type,value,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_controlHistory(addtime,objectID,ControlType,ControlValue) VALUES(?,?,?,?)";
    sql = mysql.format(sql,[new Date(),id,type,value]);
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;
            }
            callback(false);
            throw err;
        }
        else{
            callback(true);            
        }
    });
};

exports.get_agency_info = function(userName,password,callback){
    callback = callback == null? nop:callback;
    if(!userName || !password){
        callback('no userName or password');
        return;
    }
    var sql = 'SELECT * FROM t_agencyManager WHERE userName = ? and password = ?';
    sql = mysql.format(sql,[userName,crypto.md5(password)]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows[0]);
    }); 
};
exports.get_agency_Info_ByID = function(userName,callback){
    callback = callback == null? nop:callback;
    if(!userName){
        callback('no userName or password');
        return;
    }
    var sql = 'SELECT * FROM t_agencyManager WHERE userName = ? ';
    sql = mysql.format(sql,[userName]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows[0]);
    }); 
};

exports.auth_agency = function(userName,passwordStr,callback){
    callback = callback == null? nop:callback;
    if(!userName||!passwordStr){
        callback('no userName or passwordStr');
        return;
    }
    var sql = 'SELECT userName,password FROM t_agencyManager WHERE userName = ? and password = ?';
    sql = mysql.format(sql,[userName,passwordStr]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows[0]);
    }); 
};

exports.update_AgencyPW = function(value,username,callback){
    callback = callback == null? nop:callback;

    var sql = "UPDATE t_agencyManager SET password=? WHERE userName=?";
    sql = mysql.format(sql,[crypto.md5(value),username]);

    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(err,null);
        }
        else{
            callback(null,rows);
        } 
    });
};

exports.get_agency_Orders = function(username,callback){
    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM `t_agencyOrders` WHERE userName = ?";
    sql = mysql.format(sql,[username]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err,null);
            throw err;
        }
        // if(rows.length == 0){
        //     callback('null',null);
        //     return;
        // }
        else if(rows.length >= 0){
            callback(null,rows);
            return;
        }
    });
};

exports.add_agency_Orders = function(username,value,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_agencyOrders(ordersID,userName,startTime,money,status) VALUES(?,?,?,?,?)";
    sql = mysql.format(sql,[(new Date()).getTime(),username,new Date(),value,'create']);
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false,null);
                return;
            }
            callback(false,null);
            throw err;
        }
        else{
            if(rows.affectedRows > 0){
                callback(null,rows);
            }
        }
    });
};

exports.get_useragency = function(userid,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT agency_userName FROM t_users WHERE userid = ?';
    sql = mysql.format(sql,[userid]);
    query(sql,function(err,rows,fields){
        if(rows){
            callback(rows[0]);
        }
    });
}

exports.add_useragency = function(userid,agencyname,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_users SET agency_userName=? WHERE userid=?";
    sql = mysql.format(sql,[agencyname,userid]);

    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(err,null);
        }
        else{
            if(rows.affectedRows > 0)
            {
                callback(null,true);
            }
        } 
    });
};

exports.get_userAgencyID = function(userid,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT agency_userName FROM t_users WHERE userid = ?';
    sql = mysql.format(sql,[userid]);
    query(sql,function(err,rows,fields){
        if(rows){
            callback(rows);
        }
    });
};

exports.get_agencyLevel = function(agencyname,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_agencymanager WHERE userName = ?';
    sql = mysql.format(sql,[agencyname]);
    query(sql,function(err,rows,fields){
        if(rows){
            callback(rows[0]);
        }
    });
};

exports.add_commissionhistory = function(userid,type,value,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_commissionhistory(ordersTime,userID,agency_userName,agency_commission_gamegold,agency_commission_coins,agencys_userName,agencys_commission_gamegold,agencys_commission_coins) VALUES(?,?,?,?,?,?,?,?)";
    var agency1name = '';
    var agency2name = '';
    exports.get_userAgencyID(userid,function(row){
            agency1name = row[0].agency_userName;
            console.log('agencyname: '+agency1name);
            exports.get_agencyLevel(agency1name,function(row){
                if(row.level != ''){
                    if(row.level == 2){
                        agency2name = agencyrow.uplevelID;
                    }
                    
                    if(type == 'coins'){
                        sql = mysql.format(sql,[new Date(),userid,agency1name,0,value*0.6,agency2name,0,value*0.1]);
                    }
                    else{
                        sql = mysql.format(sql,[new Date(),userid,agency1name,value*0.6,0,agency2name,value*0.1,0]);
                    }
                    query(sql, function(err, rows, fields) {
                        if (err) {
                            if(err.code == 'ER_DUP_ENTRY'){
                                callback(false,null);
                                return;
                            }
                            callback(false,null);
                            throw err;
                        }
                        else{
                            if(rows.affectedRows > 0){
                                callback(null,true);
                                if(agency1name != ''){
                                    exports.updateAgencyValue(agency1name,type,value*0.6,function(err,row){
                                        console.log("增加上级代理");
                                    });
                                }
                                if(agency2name != ''){
                                    exports.updateAgencyValue(agency2name,type,value*0.1,function(err,row){
                                        console.log("增加总代理");
                                    });
                                }
                            }
                        }
                    });
                }
            });
    });
};

exports.updateAgencyValue = function(userName,addType,addValue,callback){
    callback = callback == null? nop:callback;
    var sql = "";
    
    exports.get_agency_Info_ByID(userName,function(err,row){
		if(err){
			http.send(res, -2, "没有这个代理");
		}
        else{
            if(addType == 'coins'){
                sql = "UPDATE t_agencymanager SET coins=? WHERE userName=?";
                sql = mysql.format(sql,[row.coins+addValue,userName]);
            }
            else{
                sql = "UPDATE t_agencymanager SET gamegold=? WHERE userName=?";
                sql = mysql.format(sql,[row.gamegold+addValue,userName]);
            }
        
            query(sql,function(err,rows,fields){
                if(err){
                    console.log(err);
                    callback(err,null);
                }
                else{
                    if(rows.affectedRows > 0)
                    {
                        callback(null,true);
                    }
                } 
            });
        }
    });
};

exports.get_commissionhistory = function(callback){
    callback = callback == null? nop:callback;
    // if(!userName){
    //     callback('no userName or password');
    //     return;
    // }
    var sql = 'SELECT * FROM t_commissionhistory ';
    // sql = mysql.format(sql,[userName]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows);
    });
};

exports.get_agency_player = function(username,callback){
    callback = callback == null? nop:callback;
    if(!username){
        callback('no userName');
        return;
    }
    var sql = 'SELECT * FROM t_users WHERE agency_userName = ?';
    sql = mysql.format(sql,[username]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find admin');
            return;
        }
        callback(null,rows);
    });
};

exports.update_agencyCoins = function(username,value,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_agencyManager SET coins=(coins-?) WHERE userName=?";
    sql = mysql.format(sql,[value,username]);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            if(rows.affectedRows > 0){
                callback("ok");
            }
            else{
                callback("失败");
            }
        } 
    });
};
exports.update_agencyGamegold = function(username,value,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_agencyManager SET gamegold=(gamegold-?) WHERE userName=?";
    sql = mysql.format(sql,[value,username]);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            if(rows.affectedRows > 0){
                callback("ok");
            }
            else{
                callback("失败");
            }
        } 
    });
};


exports.update_user_lock = function(userid,value,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    
    var sql = 'UPDATE t_users SET userelock=? WHERE userid=?';
    sql = mysql.format(sql,[value,userid]);
    query(sql,function(err,rows,fields){
        if(err){
            console.log(err);
            callback(false);
            return;
        }
        else{
            if(rows.affectedRows > 0){
                callback("ok");
            }
            else{
                callback(false);
            }
        } 
    });
};

exports.get_agency_accountlock = function(username,callback){
    callback = callback == null? nop:callback;
    if(username == null){
        callback(false);
        return;
    }
    var sql = 'SELECT accountlock FROM t_agencymanager WHERE userName=?'
    sql = mysql.format(sql,[username]);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        if(rows.length == 0){
            callback('can not find username');
            return;
        }
        if(rows[0].accountlock == 0){
            callback(null,true);
        }
        else if(rows[0].accountlock == 1){
            callback(null,false);
        }
    });
};
//---------------------------
exports.query = query;