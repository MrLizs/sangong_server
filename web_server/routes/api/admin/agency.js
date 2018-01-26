var express = require('express');
var router = express.Router();
var db = require('../../../../utils/db');
var crypto = require('../../../../utils/crypto');
var agencyService = require('../../../service/agencyService');

/**
* @api {post} /api/admin/agency/login 代理登录
* @apiDescription 代理登录第一次与服务器握手信息
* @apiName login
* @apiGroup agency
* @apiParam {string} userName 用户名
* @apiParam {string} password 密码
* @apiSuccess {string} token token
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 login失败
* @apiVersion 1.0.0
*/
router.post('/login', function (req, res, next) {
    var userName = req.body.userName;
    var password = req.body.password;
    // db.get_agency_accountlock(userName,function(err,row){
    //   if(row){
        agencyService.login(userName, password, function onSuccess(token) {
          res.json(token);
        }, function onError(err) {
          res.json(410,err);
        });
    //   }
    //   else if(row == false){
    //     res.json('account is locked');
    //     return;
    //   }
    //   else{
    //     res.json(err);
    //     return;
    //   }
    // });
});

/**
* @api {get} /api/admin/agency/logout 代理登出
* @apiDescription 代理登出
* @apiName logout
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.get('/logout', function (req, res, next) {
  var token = req.headers.authorization;
  if(agencyService.logout(token)){
    res.json({});
  }else{
    res.json(410,'logout err');
  }
});

/**
* @api {get} /api/admin/agency/get_myAgencyInfo 获取自己代理信息
* @apiDescription 获取代理信息
* @apiName get_myAgencyInfo
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiSuccess {string} data 个人信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.get('/get_myAgencyInfo', function (req, res, next) {
  var token = req.headers.authorization;
  agencyService.auth(token,null, function onSuccess(admin){
    console.log('获取自己代理信息:'+admin.userName);
      db.get_agency_Info_ByID(admin.userName,function(err,row){
        if(err){
          res.json('error');
        }
        else{
          res.json(row);
        }
      });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/agency/get_agencyInfoByID 获取他人代理信息
* @apiDescription 获取代理信息
* @apiName get_agencyInfoByID
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiParam {string} username 代理用户名
* @apiSuccess {string} data 个人信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.post('/get_agencyInfoByID', function (req, res, next) {
  var token = req.headers.authorization;
  var username = req.body.username;
  agencyService.auth(token,null, function onSuccess(admin){
    console.log('aaaaaa');
      db.get_agency_Info_ByID(username,function(err,row){
        if(err){
          res.json('error');
        }
        else{
          res.json(row);
        }
      });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/agency/get_ChangePW 更换密码
* @apiDescription 更换密码
* @apiName get_ChangePW
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiParam {string} password 密码
* @apiParam {string} newpassword 密码
* @apiSuccess {string} data 个人信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.post('/get_ChangePW', function (req, res, next) { 
  var token = req.headers.authorization;
  var password = req.body.password;
  var newpassword = req.body.newpassword;
  agencyService.auth(token,null, function onSuccess(admin){

    if(crypto.md5(password) != admin.password){
      res.json('password error');
      return;
    }
    db.update_AgencyPW(newpassword,admin.userName,function(err,row){
      if(err){
        res.json(err);
      }
      else{
        res.json(row);
      }
    });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/agency/get_agencyOrders 查看代理提现订单
* @apiDescription 查看代理提现订单
* @apiName get_agencyOrders
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiSuccess {string} data 订单信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.get('/get_agencyOrders', function (req, res, next) {
  var token = req.headers.authorization;
  agencyService.auth(token,null, function onSuccess(admin){
    console.log('查看订单');
      db.get_agency_Orders(admin.userName,function(err,row){
        if(err){
          res.json('error');
        }
        else{
          res.json(row);
        }
      });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/agency/add_agencyOrders 创建代理提现订单
* @apiDescription 创建代理提现订单
* @apiName add_agencyOrders
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiParam {string} money 提现金额
* @apiSuccess {boolan} data 是否成功
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.post('/add_agencyOrders', function (req, res, next) {
  var token = req.headers.authorization;
  var money = parseInt(req.body.money);
  agencyService.auth(token,null, function onSuccess(admin){
    console.log('创建代理提现订单');
    db.get_agency_accountlock(userName,function(err,row){
      if(row){
      db.get_agency_Info_ByID(admin.userName,function(err,row){
        if(row){
          if(money != 0 && row.accountbalance >= money){
            db.add_agency_Orders(admin.userName,money,function(err,row){
              if(err){
                res.json('error');
              }
              else{
                res.json(row);
              }
            });
          }
        }
      });
    }
    else if(row == false){
      res.json('account is locked');
      return;
    }
    else{
      res.json(err);
      return;
    }
  });
    
      
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/agency/addAgency 增加二级代理
* @apiDescription 增加代理人员
* @apiName addAgency
* @apiGroup agency
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
  agencyService.auth(token,null, function onSuccess(admin) {
    db.get_agency_Info_ByID(admin.userName,function(err,row){
      if(row.level != 1){
        res.json("只有总代理才能增加新代理");
        return;
      }
    });
    db.add_Agencvy(username,password,realname,contactway,coinsdiscount,gamegolddiscount,gamsdiscount,2,admin.userName,function(row){
      if(row == true){
        res.json("ok");
        //db.add_controlHistory(username,"增加代理",'1');
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
* @api {get} /api/admin/agency/get_agency_team 查看我的团队
* @apiDescription 查看我的团队
* @apiName get_agency_team
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiSuccess {string} data 订单信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.get('/get_agency_team', function (req, res, next) {
  var token = req.headers.authorization;
  agencyService.auth(token,null, function onSuccess(admin){
    console.log('查看我的团队');
    db.get_commissionhistory(admin.userName,function(err,rows){
      if(rows){
        res.json(rows);
      }
    });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/agency/get_agency_player 查看我的玩家
* @apiDescription 查看我的玩家
* @apiName get_agency_player
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiSuccess {string} data 订单信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.get('/get_agency_player', function (req, res, next) {
  var token = req.headers.authorization;
  agencyService.auth(token,null, function onSuccess(admin){
    console.log('查看我的玩家');
    db.get_agency_player(admin.userName,function(err,rows){
      if(err){
        res.json(err);
        return;
      }
      if(rows){
        res.json(rows);
      }
    });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/agency/get_addCoinsForPlayer 为我的玩家充值金币
* @apiDescription 为我的玩家充值金币
* @apiName get_addCoinsForPlayer
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiParam {string} userid 玩家ID
* @apiParam {string} value 充值数量
* @apiSuccess {string} data 订单信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.post('/get_addCoinsForPlayer', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.userid;
  var value = parseInt(req.body.value);
  if(!userid){
    res.json('userid is null');
    return;
  }
  if(!value){
    res.json('how much do you want ?');
    return;
  }
  if(value < 0){
    res.json('不能设置为负数');
    return;
  }

  agencyService.auth(token,null, function onSuccess(admin){
    console.log('为我的玩家充值金币');
    db.get_agency_Info_ByID(admin.userName,function(err,row){
      if(err){
        res.json('error');
      }
      else{
        if(value <= row.coins){
          db.update_agencyCoins(admin.userName,value,function(row){
            if(row){
              db.update_user_coins(userid,value,function(err){
                if(!err){
                  res.json('ok');
                }
              })
            }
          });
        }
      }
    });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/agency/get_addGamegoldForPlayer 为我的玩家充值元宝
* @apiDescription 为我的玩家充值元宝
* @apiName get_addGamegoldForPlayer
* @apiGroup agency
* @apiHeader {string} Authorization token
* @apiParam {string} userid 玩家ID
* @apiParam {string} value 充值数量
* @apiSuccess {string} data 订单信息
* @apiError {string} error 错误信息
* @apiVersion 1.0.0
*/
router.post('/get_addGamegoldForPlayer', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.userid;
  var value = parseInt(req.body.value);
  if(!userid){
    res.json('userid is null');
    return;
  }
  if(!value){
    res.json('how much do you want ?');
    return;
  }
  if(value < 0){
    res.json('不能设置为负数');
    return;
  }

  agencyService.auth(token,null, function onSuccess(admin){
    console.log('为我的玩家充值元宝');
    db.get_agency_Info_ByID(admin.userName,function(err,row){
      if(err){
        res.json('error');
      }
      else{
        if(value <= row.coins){
          db.update_agencyGamegold(admin.userName,value,function(row){
            if(row){
              db.update_user_yuanbaos(userid,value,function(err){
                if(!err){
                  res.json('ok');
                }
              })
            }
          });
        }
      }
    });
  },function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});
module.exports = router;