var express = require('express');
var router = express.Router();
var db = require('../../../../utils/db');
var crypto = require('../../../../utils/crypto');
var adminService = require('../../../service/adminService');

/**
* @api {post} /api/admin/users/query 玩家列表查询
* @apiDescription 玩家列表查询
* @apiName query
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} searchKey 搜索关键词(userid、name)
* @apiParam {int} skip 分页跳过记录数
* @apiSuccess {object} result 查询结果
* @apiSuccess {array} result.users 玩家列表
* @apiSuccess {int} result.count 总数
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 查询错误
* @apiVersion 1.0.0
*/
router.post('/query', function (req, res, next) {
  var token = req.headers.authorization;
  var searchKey = req.body.searchKey;
  var skip = req.body.skip;
  var limit = req.body.limit;
  if(!(skip>0)){
    skip = 0;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.usersQuery(searchKey,skip,limit,function (err,result) {
      if (err) {
        res.json(410, err);
      } else {
        res.json(result);
      }
    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/users/update_user_lock 停封玩家帐号
* @apiDescription 停封玩家帐号
* @apiName update_user_lock
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} userid 玩家id
* @apiParam {string} value 是否封号(0:否,1:是)
* @apiSuccess {string} data 'true'
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 查询错误
* @apiVersion 1.0.0
*/
router.post('/update_user_lock', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.userid;
  var value = parseInt(req.body.value);
  if(!userid){
    res.json('userid error');
    return;
  }
  if(value < 0 && value > 1){
    res.json('value error')
    return;
  }
  console.log("停封玩家帐号");
  adminService.auth(token,null, function onSuccess(admin) {
    db.update_user_lock(userid,value,function (err) {
      if (err) {
        res.json('ok');
      }
    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});


/**
* @api {post} /api/admin/users/addGems 为玩家添加钻石
* @apiDescription 为玩家添加钻石
* @apiName addGems
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {int} userId 玩家ID
* @apiParam {int} addGems 添加钻石数量
* @apiSuccess {int} gems 玩家最新钻石数量
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 添加钻石错误
* @apiVersion 1.0.0
*/
router.post('/addGems', function (req, res, next) {
  var token = req.headers.authorization;
  var userId = req.body.userId;
  var addGems = req.body.addGems;
  if(!userId||!(addGems>0)){
    res.json(410, 'invalid params');
    return;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.usersAddUserGems(userId,addGems,function (err,gems) {
      if (err) {
        res.json(410, err);
      } else {
        res.json(gems);
        db.add_controlHistory(userId,"充值玩家钻石",gems);
      }
    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/users/addCoins 为玩家添加金币
* @apiDescription 为玩家添加金币
* @apiName addCoins
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {int} userId 玩家ID
* @apiParam {int} addCoins 添加金币数量
* @apiSuccess {int} coins 玩家最新金币数量
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 添加金币错误
* @apiVersion 1.0.0
*/
router.post('/addCoins', function (req, res, next) {
  var token = req.headers.authorization;
  var userId = req.body.userId;
  var addCoins = req.body.addCoins;
  if(!userId||!(addCoins>0)){
    res.json(410, 'invalid params');
    return;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.usersAddUserCoins(userId,addCoins,function (err,coins) {
      if (err) {
        res.json(410, err);
      } else {
        res.json(coins);
        db.add_controlHistory(userId,"充值玩家金币",coins);
      }
    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/users/addGamegold 为玩家添加元宝
* @apiDescription 为玩家添加元宝
* @apiName addGamegold
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {int} userId 玩家ID
* @apiParam {int} addGamegold 添加元宝数量
* @apiSuccess {int} gamegold 玩家最新元宝数量
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 添加元宝错误
* @apiVersion 1.0.0
*/
router.post('/addGamegold', function (req, res, next) {
  var token = req.headers.authorization;
  var userId = req.body.userId;
  var addGamegold = req.body.addGamegold;
  if(!userId||!(addGamegold>0)){
    res.json(410, 'invalid params');
    return;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.usersAddUserGamegold(userId,addGamegold,function (err,gamegold) {
      if (err) {
        res.json(410, err);
      } else {
        res.json(gamegold);
        db.add_controlHistory(userId,"充值玩家元宝",addGamegold);
      }
    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});



/////////////////////////////////////////////////////////////////

router.get('/api/add_user_money', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.userid;
  var money = req.body.money;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      if(!valid_wins(money)) return;
      db.add_user_money(userid,money,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/get_all_dealer_data', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.get_all_dealer_data(function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(row);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/create_dealer', function (req, res, next) {
  var token = req.headers.authorization;
  var dealerid = req.body.dealerid;         if(!valid_number(dealerid))return;
  var name = req.body.name;                 
  var dealer_tel = req.body.dealer_tel;     if(!valid_number(dealer_tel))return;
  var yuanbaos_dis = req.body.yuanbaos_dis; if(!valid_number(yuanbaos_dis))return;
  var gems_dis = req.body.gems_dis;         if(!valid_number(gems_dis))return;
  var coins_dis = req.body.coins_dis;       if(!valid_number(coins_dis))return;
  var level = req.body.level;               if(!valid_number(level))return;
  var yuanbaos = req.body.yuanbaos;         if(!valid_number(yuanbaos))return;
  var gems = req.body.gems;                 if(!valid_number(gems))return;
  var coins = req.body.coins;               if(!valid_number(coins))return;

  adminService.auth(token, function (err, admin) {
    if (!err) {
      var money=tmp_money;
      db.create_dealer(dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/delete_dealer', function (req, res, next) {
  var token = req.headers.authorization;
  var dealerid = req.body.dealerid; 
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.delete_dealer(dealerid,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});


router.get('/api/update_dealer_data', function (req, res, next) {
  var token = req.headers.authorization;
  var oldid = req.body.oldid;               if(!valid_number(oldid))return;
  var dealerid = req.body.dealerid;         if(!valid_number(dealerid))return;
  var name = req.body.name;                 
  var dealer_tel = req.body.dealer_tel;     if(!valid_number(dealer_tel))return;
  var yuanbaos_dis = req.body.yuanbaos_dis; if(!valid_number(yuanbaos_dis))return;
  var gems_dis = req.body.gems_dis;         if(!valid_number(gems_dis))return;
  var coins_dis = req.body.coins_dis;       if(!valid_number(coins_dis))return;
  var level = req.body.level;               if(!valid_number(level))return;
  var yuanbaos = req.body.yuanbaos;         if(!valid_number(yuanbaos))return;
  var gems = req.body.gems;                 if(!valid_number(gems))return;
  var coins = req.body.coins;               if(!valid_number(coins))return;

  adminService.auth(token, function (err, admin) {
    if (!err) {
      var money=tmp_money;
      db.update_dealer_data(oldid,dealerid,name,dealer_tel,yuanbaos_dis,gems_dis,coins_dis,level,yuanbaos,gems,coins,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});


router.get('/api/add_dealer_money', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.userid;
  var tmp_money = req.body.money;
  if(!valid_wins(tmp_money)) return;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      var money=tmp_money;
      db.add_dealer_money(userid,money,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/get_online_user', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.get_user_log(function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(row);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/get_money_log', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.get_money_log(function (row) {//每种的数量
        if (err) {
          res.json(500, err);
        } else {
          var list ={};
          for(var i =0;i<row;++i){
              if(list[row[i].userid] == null){
                  var data ={};
                  data[row[i].result_type] = row[i].result_value;
                  var user={
                      userid:row[i].userid,
                      game_type:row[i].game_type ,
                      create_time:row[i].create_time,
                      data:data
                  };
                  list[row[i].userid] = user;
              }else{
                  list[row[i].userid].data[row[i].result_type] += row[i].result_value;
                  if(list[row[i].userid].create_time < row[i].create_time){
                      list[row[i].userid].create_time = row[i].create_time;
                  }
              }
          }
          res.json(list);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/set_punish_list', function (req, res, next) {
  var token = req.headers.authorization;
  var punish_id = req.body.punish_id;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.set_punish_list(punish_id,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(list);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/get_punish_list', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.get_punish_list(function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(row);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/delete_punish_list', function (req, res, next) {
  var token = req.headers.authorization;
  var punish_id = req.body.punish_id;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.delete_punish_list(punish_id,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(list);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/get_shop_list', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.get_shop_list(function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(row);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/set_shop_list', function (req, res, next) {
  var token = req.headers.authorization;
  var shop_list = req.body.shop_list;
  var type_1  = shop_list[0].type;
  var price_1 = shop_list[0].price;if(!valid_string(price_1))return;
  var count_1 = shop_list[0].count;if(!valid_string(count_1))return;

  var type_2  = shop_list[1].type;
  var price_2 = shop_list[1].price;if(!valid_string(price_2))return;
  var count_2 = shop_list[1].count;if(!valid_string(count_2))return;

  var type_3  = shop_list[2].type;
  var price_3 = shop_list[2].price;if(!valid_string(price_3))return;
  var count_3 = shop_list[2].count;if(!valid_string(count_3))return;
  
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.set_shop_list(type_1,price_1,count_1,type_2,price_2,count_2,type_3,price_3,count_3,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //list.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/get_dealer_user_list', function (req, res, next) {
  var token = req.headers.authorization;
  var dealerid = req.body.token;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.get_dealer_user_list(dealerid,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          res.json(row);
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/add_deal_log', function (req, res, next) {
  var token = req.headers.authorization;
  var dealerid = req.body.dealerid;               if(!valid_number(dealerid))return;
  var action = req.body.action;                   if(!valid_number(action))return;
  var count = req.body.count;                     if(!valid_number(count))return;
  var userid = req.body.userid;                   if(!valid_number(userid))return;
  var dealer_money = req.body.dealer_money;       if(!valid_wins(dealer_money)) return;
  var user_money = req.body.user_money;           if(!valid_wins(user_money)) return;
 
  var dealer_gems = dealer_money.gems;         
  var dealer_coins = dealer_money.coins;       
  var dealer_yuanbaos = dealer_money.yuanbaos; 

  var user_yuanbaos =user_money.yuanbaos;        
  var user_gems = user_money.gems;             
  var user_coins = user_money.coins;           

  adminService.auth(token, function (err, admin) {
    if (!err) {//zyh
      db.add_deal_log(dealerid,action,count,userid,dealer_gems, dealer_coins,dealer_yuanbaos,user_yuanbaos,user_gems,user_coins,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

function valid_bool(bool){
  if(typeof(bool)!="bool"){
     return false;
  }else{
     return true;
  }
}
function valid_number(number){
  if(!number||typeof(number)!="number"){
     return false;
  }else{
     return true;
  }
}
function valid_arr(arr){
  if(!arr||arr.length == 0){
     return false;
  }else{
     return true;
  }
}
function valid_wins(obj){
  if(obj.coins!=null && !valid_number(obj.coins)) return false;
  if(obj.yuanbaos!=null && !valid_number(obj.yuanbaos)) return false;
  if(obj.gems!=null && !valid_number(obj.gems)) return false;
  return true;
}

router.get('/api/add_user_online_payment_log', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.dealerid; if(!valid_number(userid))return;
  var name = req.body.dealerid; if(!valid_number(name))return;
  var type = req.body.dealerid; if(!valid_number(type))return;
  var count = req.body.dealerid; if(!valid_number(count))return;

  if(!valid_wins(tmp_money)) return;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      var money=tmp_money;
      db.add_user_online_payment_log(userid,name,type,count,function (row) {
        if (err) {
          res.json(500, err);
        } else {
          //row.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

/**
* @api {post} /api/admin/users/getUserInfo 查询用户记录
* @apiDescription 查询用户游戏记录
* @apiName getUserInfo
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {int} userId 玩家ID
* @apiParam {int} beginTime 查询起始时间
* @apiParam {int} endTime 查询结束时间
* @apiSuccess {string} dataArr 所有游戏记录
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 查询错误
* @apiVersion 1.0.0
*/
router.post('/getUserInfo',function(req,res,next){
  var userid = req.body.userId;
  var begintime = req.body.beginTime;
  var endtime = req.body.endTime;
  var token = req.headers.authorization;
  adminService.auth(token,null, function onSuccess(admin) {
      db.get_username(userid,function(row){
        if(!row){
          res.json('error');
        }
        else{
          db.get_user_log(userid,begintime,endtime,function(row2){
            if(!row2){
              res.json('error');
            }
            else{
              var dataArr = [];
              for (var i = 0; i < row2.length; i++) {
                  var _roomtype = "yuanbaos"
                  if(row2[i].game_type == 'yuanbao'){
                    _roomtype = "yuanbao";
                  }
                  else if(row2[i].game_type == 'coin'){
                    _roomtype = "coin";
                  }
                  else if(row2[i].game_type == 'wzq'){
                    _roomtype = "wzq";
                  }
                  var data = {
                    id:row2[i].id,
                    userid:row2[i].userid,
                    name:row[0].name,
                    time:row2[i].create_time,
                    roomtype:_roomtype,
                    yuanbaos:row2[i].game_type!="coin"?row2[i].result_value:0,
                    coins:row2[i].game_type=="coin"?row2[i].result_value:0,
                  }
                  dataArr.push(data);
              }
              res.json(dataArr);
            }
          });
        }
        
      });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
  
});

/**
* @api {post} /api/admin/users/getUserOrders 查询用户充值记录
* @apiDescription 查询用户游戏记录
* @apiName getUserOrders
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {int} skip 分页跳过记录数
* @apiParam {int} limit 查询记录数
* @apiSuccess {string} data 所有游戏记录
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 查询错误
* @apiVersion 1.0.0
*/
router.post('/getUserOrders',function(req,res,next){
  var token = req.headers.authorization;
  var skip = req.body.skip;
  var limit = req.body.limit;
  if(skip<0){
    skip = 0;
  }

  adminService.auth(token,null, function onSuccess(admin) {
      db.get_orders(skip,limit,function(row){
        if(!row){
          res.json('error');
        }
        else{
          res.json(row);
        }
      });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});


/**
* @api {post} /api/admin/users/getAgency 查询代理列表
* @apiDescription 查询代理列表
* @apiName getAgency
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {int} skip 分页跳过记录数
* @apiParam {int} limit 查询记录数
* @apiSuccess {string} data 列表数组
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.post('/getAgency', function (req, res, next) {
  var token = req.headers.authorization;
  var skip = req.body.skip;
  var limit = req.body.limit;
  if(skip<0){
    skip = 0;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.get_Agency(skip,limit,function(row){
      if(row){
        res.json(row);
      }
      else{
        res.json("error");
      }
    });
    
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/users/getAgencyByID 依据ID查询代理列表
* @apiDescription 依据ID查询代理列表
* @apiName getAgencyByID
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} username 用户名
* @apiSuccess {string} data 列表数组
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.post('/getAgencyByID', function (req, res, next) {
  var token = req.headers.authorization;
  var username = req.body.username;
  // adminService.auth(token,null, function onSuccess(admin) {
    db.get_AgencyByID(username,function(row){
      if(row){
        res.json(row);
      }
      else{
        res.json("error");
      }
    });
    
  // }, function noRoles(role) {
  //   res.json(402, role);
  // }, function onError(err) {
  //   res.json(401, err);
  // });
});

/**
* @api {post} /api/admin/users/addAgency 增加代理
* @apiDescription 增加代理人员
* @apiName addAgency
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} username 用户名
* @apiParam {string} password 密码
* @apiParam {string} realname 真实姓名
* @apiParam {string} contactway 联系方式
* @apiParam {float} coinsdiscount 金币折扣
* @apiParam {float} gamegolddiscount 元宝折扣
* @apiParam {float} gamsdiscount 钻石折扣
* @apiSuccess {string} data 是否成功
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.post('/addAgency', function (req, res, next) {
  var token = req.headers.authorization;
  var username = req.body.username;
  var password = req.body.password;
  var realname = req.body.realname;
  var contactway = req.body.contactway;
  var coinsdiscount = req.body.coinsdiscount;
  var gamegolddiscount = req.body.gamegolddiscount;
  var gamsdiscount = req.body.gamsdiscount;
  if(!username || !password || !realname || !contactway){
    res.json("帐号、密码、真实姓名与联系方式均不能为空");
    return;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.add_Agencvy(username,password,realname,contactway,coinsdiscount,gamegolddiscount,gamsdiscount,1,admin.userName,function(row){
      if(row == true){
        res.json("ok");
        db.add_controlHistory(username,"增加代理",'1');
      }
      else{
        res.json("error");
      }
    });
    
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/users/agency_lock 冻结或解锁
* @apiDescription 给某个代理充值
* @apiName agency_lock
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} username 用户名
* @apiParam {int} lock 冻结(1)或解锁(0)
* @apiSuccess {string} data 是否成功
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.post('/agency_lock', function (req, res, next) {
  var token = req.headers.authorization;
  var username = req.body.username;
  var lock = parseInt(req.body.lock);
  if(!username){
    res.json("帐号不能为空");
    return;
  }
  if(lock < 0 && lock > 1){
    res.json("参数错误");
    return;
  }
  // adminService.auth(token,null, function onSuccess(admin) {
    db.get_SelectAgency("userName",username,function(agency){
      if(agency){
        db.update_agencyLock(lock,username,function(row){
          if(row){
            res.json(row);
            if(lock == 1){
              db.add_controlHistory(username,"冻结代理",'');
            }
            else{
              db.add_controlHistory(username,"解锁代理",'');
            }
          }
          else{
            res.json("查询失败");
          }
        })
      }
      else{
        res.json("没有此账户");
        return;
      }
    });    
  // }, function noRoles(role) {
  //   res.json(402, role);
  // }, function onError(err) {
  //   res.json(401, err);
  // });
});

/**
* @api {post} /api/admin/users/agency_Pay 给某个代理充值
* @apiDescription 给某个代理充值
* @apiName agency_Pay
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} username 用户名
* @apiParam {int} type 充值类型(0:金币,1:元宝,2:钻石)
* @apiParam {int} value 充值数量
* @apiSuccess {string} data 是否成功
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.post('/agency_Pay', function (req, res, next) {
  var token = req.headers.authorization;
  var username = req.body.username;
  var type = parseInt(req.body.type);
  var value = parseInt(req.body.value);
  if(!username){
    res.json("帐号不能为空");
    return;
  }
  adminService.auth(token,null, function onSuccess(admin) {
    db.get_SelectAgency("userName",username,function(agency){
      if(agency){
        var entity = agency;
        if(type == 0){
          value += entity.coins;
        }
        else if(type == 1){
          value += entity.gamegold;
        }
        else if(type == 2){
          value += entity.gams;
        }
        else{
          res.json("type 错误");
          return;
        }
        db.update_agencyPay(type,value,username,function(row){
          if(row){
            res.json(row);
            if(type == 0){
              db.add_controlHistory(username,"充值代理金币",value);
            }
            else if(type == 1){
              db.add_controlHistory(username,"充值代理元宝",value);
            }
            else if(type == 2){
              db.add_controlHistory(username,"充值代理钻石",value);
            }
          }
          else{
            res.json("查询失败");
          }
        })
      }
      else{
        res.json("没有此账户");
        return;
      }
    });    
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/users/brokerageHistory 查看代理的流水
* @apiDescription 查看代理的流水
* @apiName brokerageHistory
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiParam {string} username 用户名(可空)
* @apiParam {int} skip 分页跳过记录数(可空)
* @apiParam {int} limit 查询记录数(可空)
* @apiSuccess {string} data 是否成功
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.post('/brokerageHistory', function (req, res, next) {
  var token = req.headers.authorization;
  var skip = req.body.skip;
  var limit = req.body.limit;
  var username = req.body.username;
  if(skip < 0){
    skip = 0;
  }

  adminService.auth(token,null, function onSuccess(admin) {
    db.get_brokerageHistory(skip,limit,username,function(history){
      if(history){
        res.json(history);
      }
      else{
        res.json("空数据");
      }
    });    
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});


/**
* @api {get} /api/admin/users/get_controlHistory 管理员操作日志
* @apiDescription 管理员操作日志
* @apiName get_controlHistory
* @apiGroup AdminUsers
* @apiHeader {string} Authorization token
* @apiSuccess {string} data 日志数组
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.get('/get_controlHistory', function (req, res, next) {
  var token = req.headers.authorization;
  // adminService.auth(token,null, function onSuccess(admin) {
    db.get_controlHistory(function(history){
      if(history){
        res.json(history);
      }
      else{
        res.json("空数据");
      }
    });    
  // }, function noRoles(role) {
  //   res.json(402, role);
  // }, function onError(err) {
  //   res.json(401, err);
  // });
});
//-------------------------------------------

module.exports = router;
