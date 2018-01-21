var express = require('express');
var router = express.Router();
var db = require('../../../../utils/db');
var crypto = require('../../../../utils/crypto');
var adminService = require('../../../service/adminService');

/**
* @api {post} /api/admin/admins/login 管理员登录
* @apiDescription 管理员登录
* @apiName login
* @apiGroup Admin
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
  adminService.login(userName, password, function onSuccess(token) {
    res.json(token);
    db.add_controlHistory(userName,"管理员登录",'');
  }, function onError(err) {
    res.json(410,err);
  });
});

/**
* @api {get} /api/admin/admins/logout 管理员登出
* @apiDescription 管理员登出
* @apiName logout
* @apiGroup Admin
* @apiHeader {string} Authorization token
* @apiError {string} error 错误信息
* @apiErrorExample {string} Error Code:
*     410 token格式错误
* @apiVersion 1.0.0
*/
router.get('/logout', function (req, res, next) {
  var token = req.headers.authorization;
  if(adminService.logout(token)){
    res.json({});
  }else{
    res.json(410,'logout err');
  }
});

router.put('/', function (req, res) {
  var token = req.headers.authorization;
  var userName = req.body.userName;
  var password = req.body.password;
  adminService.auth(token, function (err, admin) {
    if (!err) {
      db.create_admin(userName, password, function (err) {
        if (err) {
          res.json(410, err);
        } else {
          res.json({});
        }
      });
    } else {
      res.json(401, err);
    }
  });
});

module.exports = router;
