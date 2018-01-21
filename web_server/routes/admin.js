var express = require('express');
var router = express.Router();
var db = require('../../utils/db');
var crypto = require('../../utils/crypto');

var tokenMap = {};

var auth = function (token, role ,success,noRoles,error) {
  try {
    var loginInfos = crypto.fromBase64(token).split('|');
    var userName = loginInfos[0];
    var user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (tokenMap[userName]) {
      if (tokenMap[userName].token != token) {
        error('wrong token');
        return;
      }
      // if (tokenMap[userName].ip != user_ip) {
      //   error('wrong ip');
      //   return;
      // }
      db.auth_admin(loginInfos[0], loginInfos[1], function (err, admin) {
        if (err) {
          error(err);
        } else {
          if (role) {
            if (typeof role == 'string' && admin.roles.indexOf(role + ',') < 0) {
              noRoles(role);
              return;
            }
            if (typeof role == 'object' && role.length > 0) {
              for (var i = 0; i < role.length; i++) {
                var roleItem = role[i];
                if (admin.roles.indexOf(roleItem + ',') < 0) {
                  noRoles(roleItem);
                  return;
                }
              }
            }
          }
          success(admin);
        }
        return;
      });
    } else {
      error('no token in server');
    }
  } catch (ex) {
    error(ex);
  }
}

router.post('/api/login', function (req, res, next) {
  var userName = req.body.userName;
  var password = req.body.password;
  db.get_admin_info(userName, password, function (err,admin) {
    if (err) {
      res.json(501, { error: 'userName or password wrong' });
    } else {
      var token = crypto.toBase64(userName+'|'+crypto.md5(password));
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      tokenMap[userName] = {token:token,time:new Date(),ip:ip};
      res.json({ token: token });
    }
  });
});

router.get('/api/logout', function (req, res, next) {
  var token = req.headers.authorization;
  try{
    var loginInfos = crypto.fromBase64(token).split('|');
    var userName = loginInfos[0];
    delete tokenMap[userName];
    res.json({});
  }catch(ex){
    res.json(500,ex);
  }
});

router.post('/api/createAdmin', function (req, res) {
  var token = req.headers.authorization;
  auth(token, function (err, admin) {
    if (!err) {
      db.create_admin(req.body.userName, req.body.password, function (err) {
        if (err) {
          res.json(500, err);
        } else {
          res.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

router.get('/api/config/marqueeMessage', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

router.post('/api/config/marqueeMessage', function (req, res, next) {
  var str = req.body.str;
  if(!str||str.length>100){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

//-------------------------------------------------------------------zyh
router.get('/api/config/chouJiang', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

router.post('/api/config/chouJiang', function (req, res, next) {
  var enabled = req.body.enabled;
  var price = req.body.price;
  var gifts = req.body.gifts;
  var err =false; 
  if(!valid_bool(enabled))err=true;
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
  auth(token, null, function onSuccess(admin) {
    db.get_config('chouJiang', function (err,str) {
      if (err) {
        res.json(410,err);
      } else {
        var chouJiang = JSON.parse(str)
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

router.get('/api/config/dailyJiuJiJin', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

router.post('/api/config/dailyJiuJiJin', function (req, res, next) {
  var enabled = req.body.enabled;
  var maxCount = req.body.maxCount;
  var limitTime = req.body.limitTime;
  var limitCoins = req.body.limitCoins;
  var gifts = req.body.gifts;
  var err = false; 
  if(!valid_bool(enabled))err=true;
  if(!valid_number(maxCount))err=true;
  if(!valid_number(limitTime))err=true;
  if(!valid_number(limitCoins))err=true;
  if(!valid_wins(gifts))err=true;
  
  if(err){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
    db.get_config('dailyJiuJiJin', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var dailyJiuJiJin = JSON.parse(str)
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

router.get('/api/config/dailySignIn', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

router.post('/api/setdailySignIn', function (req, res, next) {
  var enabled = req.body.enabled;
  var gifts = req.body.gifts;
  var err =false; 
  if(!valid_bool(enabled))err=true;
  if(!valid_arr(gifts))err=true;
  for(var i=0;i<gifts.length;++i){
    if(!valid_wins(gifts[i]))err=true;
  }
  if(err){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
    db.get_config('dailySignIn', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var dailySignIn = JSON.parse(str)
        dailySignIn.enabled=enabled;
        dailySignIn.gifts=gifts;
        var data = JSON.stringify(dailySignIn);
        db.set_config('dailySignIn',data, function (err) {
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

router.get('/api/config/goldSanGongRoom', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

router.post('/api/config/goldSanGongRoom', function (req, res, next) {
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
  auth(token, null, function onSuccess(admin) {
    db.get_config('goldSanGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var goldSanGongRoom = JSON.parse(str)
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
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

router.get('/api/config/songGongRoom', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
    db.get_config('songGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var songGongRoom = JSON.parse(str);
        res.json(songGongRoom);
      }
    });
  }, function noRoles(role) {
    res.json(402, role);
  }, function onError(err) {
    res.json(401, err);
  });
});

router.post('/api/setsongGongRoom', function (req, res, next) {
  var costGems12 = req.body.costGems12;
  var costGems24 = req.body.costGems24;
  var yuanbaosLimit = req.body.yuanbaosLimit;
  var tipYuanbaos = req.body.tipYuanbaos;
  var rate = req.body.rate;

  var err =false; 
  if(!valid_number(costGems12))err=true;
  if(!valid_number(costGems24))err=true;
  if(!valid_arr(yuanbaosLimit))err=true;
  for(var i=0;i<yuanbaosLimit.length;++i){
    if(!valid_number(yuanbaosLimit[i]))err=true;
  }
  if(!valid_number(tipYuanbaos))err=true;
  if(!valid_number(rate))err=true;
  if(err||rate<-1&&rate>101){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
    db.get_config('songGongRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var songGongRoom = JSON.parse(str)
        songGongRoom.costGems12=costGems12;
        songGongRoom.costGems24=costGems24;
        songGongRoom.yuanbaosLimit=yuanbaosLimit;
        songGongRoom.tipYuanbaos = tipYuanbaos;
        songGongRoom.rate = rate;
        var data = JSON.stringify(songGongRoom);
        db.set_config('songGongRoom',data, function (err) {
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

router.get('/api/config/wzqRoom', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
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

router.post('/api/config/wzqRoom', function (req, res, next) {
  var rate = req.body.rate;

  if(!rate||typeof(rate)!="number"||(rate<-1&&rate>101)){
    res.json(500, 'params error');
    return;
  }
  var token = req.headers.authorization;
  auth(token, null, function onSuccess(admin) {
    db.get_config('wzqRoom', function (err,str) {
      if (err) {
        res.json(500, err);
      } else {
        var wzqRoom = JSON.parse(str);
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

router.get('/api/get_all_users', function (req, res, next) {
  var token = req.headers.authorization;
  auth(token, function (err, admin) {
    if (!err) {
      db.get_all_user_data(function (row) {
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

router.get('/api/add_user_money', function (req, res, next) {
  var token = req.headers.authorization;
  var userid = req.body.userid;
  var money = req.body.money;
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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

  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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

  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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
  
  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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

  auth(token, function (err, admin) {
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
  auth(token, function (err, admin) {
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

//-------------------------------------------

module.exports = router;
