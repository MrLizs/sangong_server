var express = require('express');
var router = express.Router();
var db = require('../../../../utils/db');
var crypto = require('../../../../utils/crypto');
var adminService = require('../../../service/adminService');

/**
* @api {get} /api/admin/configs/getMarqueeMessage 获取大厅消息
* @apiDescription 获取大厅消息
* @apiName getMarqueeMessage
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {string} str 大厅消息
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getMarqueeMessage', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('marqueeMessage', function (err, str) {
      if (err) {
        res.json(500, err);
      } else {
        res.json({ str: str });
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post}  /api/admin/configs/setMarqueeMessage 设置大厅消息
* @apiDescription 设置大厅消息
* @apiName setMarqueeMessage
* @apiGroup configs
* @apiParam {string} str 大厅显示的内容
* @apiSuccess {object} result 返回空对象
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setMarqueeMessage', function (req, res, next) {
  var str = req.body.str;
  if(!str||str.length>100){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.set_config('marqueeMessage',str, function (err) {
      if (err) {
        res.json(500, err);
      } else {
        res.json({});
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/configs/getChouJiang 获取抽奖信息
* @apiDescription 获取抽奖信息
* @apiName getChouJiang
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {object} object对象
* @apiSuccess {bool} object.enabled
* @apiSuccess {object} object.price 抽奖付出金额
* @apiSuccess {object} object.price.coins
* @apiSuccess {object} object.price.yuanbaos
* @apiSuccess {object} object.price.gems
* @apiSuccess {arr} object.gift  抽奖得到奖品数组
* @apiSuccess {object} object.gift[0]  抽奖得到奖品
* @apiSuccess {object} object.gift[0].rate 几率
* @apiSuccess {object} object.gift[0].gems 奖品
* @apiSuccess {object} object.gift[0].yuanbaos 奖品
* @apiSuccess {object} object.gift[0].coins 奖品
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getChouJiang', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('chouJiang', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var chouJiang = JSON.parse(str);
        res.json(chouJiang);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post}  /api/admin/configs/setChouJiang 设置抽奖参数
* @apiDescription 设置抽奖参数
* @apiName setChouJiang
* @apiGroup configs
* @apiParam {bool} enabled 
* @apiParam {object} price 内含coins yuanbaos gems
* @apiParam {arr} gifts  抽奖得到奖品数组 数组中对象中必含有rate 选择含有gems yuanbaos coins
* @apiSuccess {object} result 返回空对象
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setChouJiang', function (req, res, next) {
  var enabled = req.body.enabled;
  var price = req.body.price;
  var gifts = req.body.gifts;
  var err =false; 
  //if(!valid_bool(enabled))err=true;
  if(!valid_wins(price))err=true;
  if(!valid_arr(gifts))err=true;
  for(var i=0;i<gifts.length;++i){
    if(!valid_number(gifts[i].rate))err=true;
    if(gifts[i].rate<-1&&gifts[i].rate>101){
      res.json(500, 'params error');
      return;
    }
    if(!valid_wins(gifts[i]))err=true;
  }
  if(err){
    res.json(500, 'params error');
    return;
  }
  
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('chouJiang', function (err,str) {
      if (err) {
        res.json(410,err);
      } else {
        var chouJiang = JSON.parse(str)
        if(!chouJiang){
            chouJiang={
               enabled:true,
               price:{},
               gifts:[],
            }
        }
        chouJiang.enabled=enabled;
        chouJiang.price=price;
        chouJiang.gifts=gifts;
        var data = JSON.stringify(chouJiang);
        db.set_config('chouJiang',data, function (err) {
          if (err) {
            res.json(411, err);
          } else {
            res.json({});
          }
        });
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/configs/getDailyJiuJiJin 获取代理救济金
* @apiDescription 获取代理救济金
* @apiName getDailyJiuJiJin
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {object} object对象
* @apiSuccess {bool} object.enabled
* @apiSuccess {numble} object.maxCount 最大次数
* @apiSuccess {numble} object.limitTime 限制间隔时间
* @apiSuccess {numble} object.limitCoins 救济金额
* @apiSuccess {object} object.gift 救济物品
* @apiSuccess {object} object.gift.gems 救济物品
* @apiSuccess {object} object.gift.yuanbaos 救济物品
* @apiSuccess {object} object.gift.coins 救济物品
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getDailyJiuJiJin', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('dailyJiuJiJin', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var dailyJiuJiJin = JSON.parse(str);
        res.json(dailyJiuJiJin);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post}  /api/admin/configs/setDailyJiuJiJin 设置救济金
* @apiDescription 设置救济金
* @apiName setDailyJiuJiJin
* @apiGroup configs
* @apiParam {bool} enabled 
* @apiParam {numble} maxCount 最大次数
* @apiParam {numble} limitTime 限制时间
* @apiParam {numble} limitCoins 救济金额
* @apiParam {object} gifts 内含选填coins yuanbaos gems和数量
* @apiSuccess {object} result 返回空对象
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setDailyJiuJiJin', function (req, res, next) {
  var enabled = req.body.enabled;
  var maxCount = req.body.maxCount;
  var limitTime = req.body.limitTime;
  var limitCoins = req.body.limitCoins;
  var gifts = req.body.gifts;
  var err = false; 
  //if(!valid_bool(enabled))err=true;
  if(!valid_number(maxCount))err=true;
  if(!valid_number(limitTime))err=true;
  if(!valid_number(limitCoins))err=true;
  if(!valid_wins(gifts))err=true;
  
  if(err){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('dailyJiuJiJin', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var dailyJiuJiJin = JSON.parse(str)
        if(!dailyJiuJiJin){
            dailyJiuJiJin={
              enabled:null,
              maxCount:null,
              limitTime:null,
              limitCoins:null,
              gifts:null,
            }
        }
        dailyJiuJiJin.enabled    = enabled;
        dailyJiuJiJin.maxCount   = maxCount;
        dailyJiuJiJin.limitTime  = limitTime;
        dailyJiuJiJin.limitCoins = limitCoins;
        dailyJiuJiJin.gifts      = gifts;
        var data = JSON.stringify(dailyJiuJiJin);
        db.set_config('dailyJiuJiJin',data, function (err) {
          if (err) {
            res.json(500, err);
          } else {
            res.json({});
          }
        });
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/configs/getDailySignIn 获取签到开关与奖励信息
* @apiDescription 获取金币场设置
* @apiName getDailySignIn
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {string} data 最新结果
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getDailySignIn', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('dailySignIn', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var dailySignIn = JSON.parse(str);
        res.json(dailySignIn);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/configs/setDailySignIn 设置签到开关与奖励
* @apiDescription 获取金币场设置
* @apiName setDailySignIn
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiParam {bool} enabled 开关
* @apiParam {arr} gifts 签到礼物数组(格式：[{"coins": 1000},...,...])
* @apiSuccess {string} data 最新结果
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setDailySignIn', function (req, res, next) {
  var enabled = req.body.enabled;
  var gifts = req.body.gifts;
  var err =false; 
  //if(!valid_bool(enabled))err=true;
  if(!valid_arr(gifts))err=true;
  for(var i=0;i<gifts.length;++i){
    if(!valid_wins(gifts[i]))err=true;
  }
  if(err){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('dailySignIn', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var dailySignIn = JSON.parse(str)
        if(!dailySignIn){
            dailySignIn={
                enabled:enabled,
                gifts:gifts,
            }
        }
        dailySignIn.enabled=enabled;
        dailySignIn.gifts=gifts;
        var data = JSON.stringify(dailySignIn);
        db.set_config('dailySignIn',data, function (err) {
          if (err) {
            res.json(500, err);
          } else {
            res.json(data);
          }
        });
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});


/**
* @api {get} /api/admin/configs/getGoldSanGongRoom 获取金币场设置
* @apiDescription 获取金币场设置
* @apiName getGoldSanGongRoom
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {object} object对象
* @apiSuccess {arr} object.stakeCoins 五种筹码
* @apiSuccess {arr} object.stakeCoins[0] 第一种筹码
* @apiSuccess {numble} object.tipCoins 小费金额
* @apiSuccess {numble} object.rate 抽成比率
* @apiSuccess {string} object.roomId 房间号
* @apiSuccess {numble} object.seatNum  seatNum
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getGoldSanGongRoom', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('goldSanGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var goldSanGongRoom = JSON.parse(str);
        res.json(goldSanGongRoom);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});


/**
* @api {post}  /api/admin/configs/setGoldSanGongRoom 设置金币场
* @apiDescription 设置金币场
* @apiName setGoldSanGongRoom
* @apiGroup configs
* @apiParam {arr} stakeCoins 内含五个数字的数组
* @apiParam {numble} tipCoins 打赏数量
* @apiParam {numble} rate 抽成比率（小数）
* @apiParam {string} roomId 房间号码
* @apiParam {numble} seatNum seatNum
* @apiSuccess {object} result 返回空对象
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setGoldSanGongRoom', function (req, res, next) {
  var stakeCoins = req.body.stakeCoins;
  var tipCoins = req.body.tipCoins;
  var rate = req.body.rate;

  var err =false; 
  if(!valid_arr(stakeCoins))err=true;
  for(var i=0;i<stakeCoins.length;++i){
    if(!valid_number(stakeCoins[i]))err=true;
  }
  if(!valid_number(tipCoins))err=true;
  if(!valid_number(rate))err=true;
  if(err||rate<-1&&rate>101){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('goldSanGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var goldSanGongRoom = JSON.parse(str)
        if(!goldSanGongRoom){
            goldSanGongRoom={
              stakeCoins:null,
              tipCoins:null,
              rate:null,
              seatNum:null,
              roomId:null,
            }
        }
        goldSanGongRoom.stakeCoins=stakeCoins;
        goldSanGongRoom.tipCoins=tipCoins;
        goldSanGongRoom.rate=rate;
        goldSanGongRoom.roomId = 000001;
        goldSanGongRoom.seatNum = 8;
        var data = JSON.stringify(goldSanGongRoom);
        db.set_config('goldSanGongRoom',data, function (err) {
          if (err) {
            res.json(500, err);
          } else {
            res.json({});
          }
        });
      }
    });
  }, function noRoles(role){
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/configs/getSanGongRoom 获取元宝场设置
* @apiDescription 获取元宝场设置
* @apiName getSanGongRoom
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {object} object对象
* @apiSuccess {numble} object.costGems12 12局房卡
* @apiSuccess {numble} object.costGems24 24局房卡
* @apiSuccess {numble} object.costGems120 120局房卡
* @apiSuccess {arr} object.yuanbaosLimit 5个数字的数组
* @apiSuccess {numble} object.tipYuanBaos 小费的元宝金额
* @apiSuccess {numble} object.rate 抽水率
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getSanGongRoom', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('sanGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var sanGongRoom = JSON.parse(str);
        res.json(sanGongRoom);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post}  /api/admin/configs/setSanGongRoom 设置元宝场
* @apiDescription 设置元宝场
* @apiName setSanGongRoom
* @apiGroup configs
* @apiParam {numble} costGems12 12局房卡
* @apiParam {numble} costGems24 24局房卡
* @apiParam {numble} costGems120 120局房卡
* @apiParam {arr} yuanbaosLimit 内含五个数字的数组
* @apiParam {numble} tipYuanbaos 打赏元宝数量
* @apiParam {numble} rate 抽成比率（小数）
* @apiSuccess {object} result 返回空对象
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setSanGongRoom', function (req, res, next) {
  var costGems12 = req.body.costGems12;
  var costGems24 = req.body.costGems24;
  var costGems120 = req.body.costGems120;
  var yuanbaosLimit = req.body.yuanbaosLimit;
  var tipYuanbaos = req.body.tipYuanbaos;
  var rate = req.body.rate;

  var err =false; 
  if(!valid_number(costGems12))err=true;
  if(!valid_number(costGems24))err=true;
  if(!valid_number(costGems120))err=true;
  //if(!valid_arr(yuanbaosLimit))err=true;
  for(var i=0;i<yuanbaosLimit.length;++i){
    if(!valid_number(yuanbaosLimit[i]))err=true;
  }
  if(!valid_number(tipYuanbaos))err=true;
  //if(!valid_number(rate))err=true;
  // if(err||rate<-1&&rate>101){
  //   res.json(500, 'params error');
  //   return;
  // }
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('sanGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var sanGongRoom = JSON.parse(str)
        if(!sanGongRoom){
            sanGongRoom={
              costGems12:null,
              costGems24:null,
              costGems120:null,
              yuanbaosLimit:null,
              tipYuanbaos:null,
              rate:null,
            }
        }
        sanGongRoom.costGems12=costGems12;
        sanGongRoom.costGems24=costGems24;
        sanGongRoom.costGems120=costGems120;
        sanGongRoom.yuanbaosLimit=yuanbaosLimit;
        sanGongRoom.tipYuanbaos =tipYuanbaos;
        sanGongRoom.rate = rate;
        var data = JSON.stringify(sanGongRoom);
        db.set_config('sanGongRoom',data, function (err) {
          if (err) {
            res.json(500, err);
          } else {
            res.json({});
          }
        });
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {get} /api/admin/configs/getwzqRoom 获取五子棋设置
* @apiDescription 获取金币场设置
* @apiName getwzqRoom
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiSuccess {object} object对象
* @apiSuccess {numble} object.rate 抽水率
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.get('/getwzqRoom', function (req, res, next) {
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('wzqRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var wzqRoom = JSON.parse(str);
        res.json(wzqRoom);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

/**
* @api {post}  /api/admin/configs/setwzqRoom 设置五子棋
* @apiDescription 设置五子棋
* @apiName setwzqRoom
* @apiGroup configs
* @apiParam {numble} rate 抽成比率（小数）
* @apiSuccess {object} result 返回空对象
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     401 token格式错误
*     500 获取失败
*     402 没有权限
* @apiVersion 1.0.0
*/
router.post('/setwzqRoom', function (req, res, next) {
  var rate = req.body.rate;
  if(!valid_number(rate)){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  adminService.auth(token, null, function onSuccess(admin) {
    db.get_config('wzqRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var wzqRoom = JSON.parse(str);
        if(!wzqRoom){
          wzqRoom.rate =null;
        }
        wzqRoom.rate=rate;
        var data = JSON.stringify(wzqRoom);
        db.set_config('wzqRoom',data, function (err) {
          if (err) {
            res.json(500, err);
          } else {
            res.json({});
          }
        });
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});
/**
* @api {post} /api/admin/configs/setShopList 修改商城商品
* @apiDescription 修改商城里制定道具的数量、购买价格。
* @apiName setShopList
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiParam {int} index 原商城道具数组下标(作为索引,方便校验)
* @apiParam {int} type 修改类型(0：gamegold/1：gams/2：gems2coins)
* @apiParam {int} value 修改值
* @apiParam {int} price 售价(可空，空则不修改)
* @apiSuccess {string} data 最新结果集
* @apiError {string} error 错误信息,返回"error"
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 查询错误
* @apiVersion 1.0.0
*/
router.post('/setShopList',function(req,res,next){
  var index = parseInt(req.body.index);
  var type = parseInt(req.body.type);
  var value = parseInt(req.body.value);
  var price = parseInt(req.body.price);
  var token = req.headers.authorization;
  adminService.auth(token,null, function onSuccess(admin) {

    if(!index && !type && !value){
      res.json("error : invalid data");
      return;
    }
    db.get_config('shop', function (err, str) {
      if (err || typeof str != 'string') {
        http.send(res, -3, "get shop config error");
        return;
      }
      if(str){
        var dataArr = JSON.parse(str);

        if(type < 0  && type >= dataArr.length){
          res.json('type error');
          return;
        }
        if(index < 0 && index >= dataArr[type].items.length){
          res.json('index error');
          return;
        }

        if(value <= 0){
          res.json('value error : less-than 0');
          return;
        }

        if(type == 0){
          dataArr[type].items[index].gamegold = value;
        }
        else if(type == 1){
          dataArr[type].items[index].gams = value;
        }
        else if(type == 2){
          dataArr[type].items[index].gems2coins = value;
        }

        if(price){
          if(price <= 0){
            res.json('price error : less-than 0');
            return;
          }
          dataArr[type].items[index].price = price;
        }
        var jsonStr = JSON.stringify(dataArr);
        console.log(jsonStr);
        db.update_Shop(jsonStr,function(row){
          if(row){
            res.json(jsonStr)
          }
          else{
            res.json("error")
          }
        })
      }
      else{
        res.json('data inquire error');
      }

    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

/**
* @api {post} /api/admin/configs/setSignSettings 修改签到设置
* @apiDescription 修改商城里制定道具的数量、购买价格。
* @apiName setSignSettings
* @apiGroup configs
* @apiHeader {string} Authorization token
* @apiParam {int} index 原商城道具数组下标(作为索引,方便校验)

* @apiSuccess {string} data 最新结果集
* @apiError {string} error 错误信息,返回"error"
* @apiErrorExample {string} Error Code:
*     401 认证错误
*     402 没有权限
*     410 查询错误
* @apiVersion 1.0.0
*/
router.post('/setSignSettings',function(req,res,next){
  var index = parseInt(req.body.index);
  var type = parseInt(req.body.type);
  var value = parseInt(req.body.value);
  var price = parseInt(req.body.price);
  var token = req.headers.authorization;
  adminService.auth(token,null, function onSuccess(admin) {

    if(!index && !type && !value){
      res.json("error : invalid data");
      return;
    }
    db.get_config('shop', function (err, str) {
      if (err || typeof str != 'string') {
        http.send(res, -3, "get shop config error");
        return;
      }
      if(str){
        var dataArr = JSON.parse(str);

        if(type < 0  && type >= dataArr.length){
          res.json('type error');
          return;
        }
        if(index < 0 && index >= dataArr[type].items.length){
          res.json('index error');
          return;
        }

        if(value <= 0){
          res.json('value error : less-than 0');
          return;
        }

        if(type == 0){
          dataArr[type].items[index].gamegold = value;
        }
        else if(type == 1){
          dataArr[type].items[index].gams = value;
        }
        else if(type == 2){
          dataArr[type].items[index].gems2coins = value;
        }

        if(price){
          if(price <= 0){
            res.json('price error : less-than 0');
            return;
          }
          dataArr[type].items[index].price = price;
        }
        var jsonStr = JSON.stringify(dataArr);
        console.log(jsonStr);
        db.update_Shop(jsonStr,function(row){
          if(row){
            res.json(jsonStr)
          }
          else{
            res.json("error")
          }
        })
      }
      else{
        res.json('data inquire error');
      }

    });
  }, function onNoRole(role){
    res.json(402, role);
  }, function onError(err){
    res.json(401, err);
  });
});

function valid_number(t){
  if(t){
    if(t>=0){
       return true;
    }
  }
  return false;
}
function valid_bool(t){
  if(t){
      return true;
  }else{
    return false;
  }
}
function valid_wins(t){
  if(t){
    for(var k in t){
      return true;
    }
  }
  return false;
}
function valid_arr(t){
  if(t){
    return t.length>-1;
  }else{
    return false;
  }
}
 

module.exports = router;
