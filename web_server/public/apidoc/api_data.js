define({ "api": [
  {
    "type": "post",
    "url": "/api/admin/users/addAgency",
    "title": "增加代理",
    "description": "<p>增加代理人员</p>",
    "name": "addAgency",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "realname",
            "description": "<p>真实姓名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "contactway",
            "description": "<p>联系方式</p>"
          },
          {
            "group": "Parameter",
            "type": "float",
            "optional": false,
            "field": "coinsdiscount",
            "description": "<p>金币折扣</p>"
          },
          {
            "group": "Parameter",
            "type": "float",
            "optional": false,
            "field": "gamegolddiscount",
            "description": "<p>元宝折扣</p>"
          },
          {
            "group": "Parameter",
            "type": "float",
            "optional": false,
            "field": "gamsdiscount",
            "description": "<p>钻石折扣</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>是否成功</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/addCoins",
    "title": "为玩家添加金币",
    "description": "<p>为玩家添加金币</p>",
    "name": "addCoins",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "userId",
            "description": "<p>玩家ID</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "addCoins",
            "description": "<p>添加金币数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "int",
            "optional": false,
            "field": "coins",
            "description": "<p>玩家最新金币数量</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 添加金币错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/addGamegold",
    "title": "为玩家添加元宝",
    "description": "<p>为玩家添加元宝</p>",
    "name": "addGamegold",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "userId",
            "description": "<p>玩家ID</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "addGamegold",
            "description": "<p>添加元宝数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "int",
            "optional": false,
            "field": "gamegold",
            "description": "<p>玩家最新元宝数量</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 添加元宝错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/addGems",
    "title": "为玩家添加钻石",
    "description": "<p>为玩家添加钻石</p>",
    "name": "addGems",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "userId",
            "description": "<p>玩家ID</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "addGems",
            "description": "<p>添加钻石数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "int",
            "optional": false,
            "field": "gems",
            "description": "<p>玩家最新钻石数量</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 添加钻石错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/agency_Pay",
    "title": "给某个代理充值",
    "description": "<p>给某个代理充值</p>",
    "name": "agency_Pay",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "type",
            "description": "<p>充值类型(0:金币,1:元宝,2:钻石)</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "value",
            "description": "<p>充值数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>是否成功</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/agency_lock",
    "title": "冻结或解锁",
    "description": "<p>给某个代理充值</p>",
    "name": "agency_lock",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "lock",
            "description": "<p>冻结(1)或解锁(0)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>是否成功</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/brokerageHistory",
    "title": "查看代理的流水",
    "description": "<p>查看代理的流水</p>",
    "name": "brokerageHistory",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名(可空)</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "skip",
            "description": "<p>分页跳过记录数(可空)</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "limit",
            "description": "<p>查询记录数(可空)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>是否成功</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/getAgency",
    "title": "查询代理列表",
    "description": "<p>查询代理列表</p>",
    "name": "getAgency",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "skip",
            "description": "<p>分页跳过记录数</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "limit",
            "description": "<p>查询记录数</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>列表数组</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/getAgencyByID",
    "title": "依据ID查询代理列表",
    "description": "<p>依据ID查询代理列表</p>",
    "name": "getAgencyByID",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>列表数组</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/getUserInfo",
    "title": "查询用户记录",
    "description": "<p>查询用户游戏记录</p>",
    "name": "getUserInfo",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "userId",
            "description": "<p>玩家ID</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "beginTime",
            "description": "<p>查询起始时间</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "endTime",
            "description": "<p>查询结束时间</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "dataArr",
            "description": "<p>所有游戏记录</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 查询错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/getUserOrders",
    "title": "查询用户充值记录",
    "description": "<p>查询用户游戏记录</p>",
    "name": "getUserOrders",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "skip",
            "description": "<p>分页跳过记录数</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "limit",
            "description": "<p>查询记录数</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>所有游戏记录</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 查询错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "get",
    "url": "/api/admin/users/get_controlHistory",
    "title": "管理员操作日志",
    "description": "<p>管理员操作日志</p>",
    "name": "get_controlHistory",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>日志数组</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/query",
    "title": "玩家列表查询",
    "description": "<p>玩家列表查询</p>",
    "name": "query",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "searchKey",
            "description": "<p>搜索关键词(userid、name)</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "skip",
            "description": "<p>分页跳过记录数</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>查询结果</p>"
          },
          {
            "group": "Success 200",
            "type": "array",
            "optional": false,
            "field": "result.users",
            "description": "<p>玩家列表</p>"
          },
          {
            "group": "Success 200",
            "type": "int",
            "optional": false,
            "field": "result.count",
            "description": "<p>总数</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 查询错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/users/update_user_lock",
    "title": "停封玩家帐号",
    "description": "<p>停封玩家帐号</p>",
    "name": "update_user_lock",
    "group": "AdminUsers",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userid",
            "description": "<p>玩家id</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "value",
            "description": "<p>是否封号(0:否,1:是)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>'true'</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 查询错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/users.js",
    "groupTitle": "AdminUsers"
  },
  {
    "type": "post",
    "url": "/api/admin/admins/login",
    "title": "管理员登录",
    "description": "<p>管理员登录</p>",
    "name": "login",
    "group": "Admin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userName",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 login失败",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/admins.js",
    "groupTitle": "Admin"
  },
  {
    "type": "get",
    "url": "/api/admin/admins/logout",
    "title": "管理员登出",
    "description": "<p>管理员登出</p>",
    "name": "logout",
    "group": "Admin",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/admins.js",
    "groupTitle": "Admin"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/addAgency",
    "title": "增加二级代理",
    "description": "<p>增加代理人员</p>",
    "name": "addAgency",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "realname",
            "description": "<p>真实姓名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "contactway",
            "description": "<p>联系方式</p>"
          },
          {
            "group": "Parameter",
            "type": "float",
            "optional": false,
            "field": "coinsdiscount",
            "description": "<p>金币折扣</p>"
          },
          {
            "group": "Parameter",
            "type": "float",
            "optional": false,
            "field": "gamegolddiscount",
            "description": "<p>元宝折扣</p>"
          },
          {
            "group": "Parameter",
            "type": "float",
            "optional": false,
            "field": "gamsdiscount",
            "description": "<p>钻石折扣</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>是否成功</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/add_agencyOrders",
    "title": "创建代理提现订单",
    "description": "<p>创建代理提现订单</p>",
    "name": "add_agencyOrders",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "money",
            "description": "<p>提现金额</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolan",
            "optional": false,
            "field": "data",
            "description": "<p>是否成功</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/get_ChangePW",
    "title": "更换密码",
    "description": "<p>更换密码</p>",
    "name": "get_ChangePW",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "newpassword",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>个人信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/get_addCoinsForPlayer",
    "title": "为我的玩家充值金币",
    "description": "<p>为我的玩家充值金币</p>",
    "name": "get_addCoinsForPlayer",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userid",
            "description": "<p>玩家ID</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "value",
            "description": "<p>充值数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>订单信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/get_addGamegoldForPlayer",
    "title": "为我的玩家充值元宝",
    "description": "<p>为我的玩家充值元宝</p>",
    "name": "get_addGamegoldForPlayer",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userid",
            "description": "<p>玩家ID</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "value",
            "description": "<p>充值数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>订单信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/get_agencyInfoByID",
    "title": "获取他人代理信息",
    "description": "<p>获取代理信息</p>",
    "name": "get_agencyInfoByID",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>代理用户名</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>个人信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "get",
    "url": "/api/admin/agency/get_agencyOrders",
    "title": "查看代理提现订单",
    "description": "<p>查看代理提现订单</p>",
    "name": "get_agencyOrders",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>订单信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "get",
    "url": "/api/admin/agency/get_agency_player",
    "title": "查看我的玩家",
    "description": "<p>查看我的玩家</p>",
    "name": "get_agency_player",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>订单信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "get",
    "url": "/api/admin/agency/get_agency_team",
    "title": "查看我的团队",
    "description": "<p>查看我的团队</p>",
    "name": "get_agency_team",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>订单信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "get",
    "url": "/api/admin/agency/get_myAgencyInfo",
    "title": "获取自己代理信息",
    "description": "<p>获取代理信息</p>",
    "name": "get_myAgencyInfo",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>个人信息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "post",
    "url": "/api/admin/agency/login",
    "title": "代理登录",
    "description": "<p>代理登录第一次与服务器握手信息</p>",
    "name": "login",
    "group": "agency",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "userName",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 login失败",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "get",
    "url": "/api/admin/agency/logout",
    "title": "代理登出",
    "description": "<p>代理登出</p>",
    "name": "logout",
    "group": "agency",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "410 token格式错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/agency.js",
    "groupTitle": "agency"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getChouJiang",
    "title": "获取抽奖信息",
    "description": "<p>获取抽奖信息</p>",
    "name": "getChouJiang",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object",
            "description": "<p>对象</p>"
          },
          {
            "group": "Success 200",
            "type": "bool",
            "optional": false,
            "field": "object.enabled",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.price",
            "description": "<p>抽奖付出金额</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.price.coins",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.price.yuanbaos",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.price.gems",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "arr",
            "optional": false,
            "field": "object.gift",
            "description": "<p>抽奖得到奖品数组</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.gift[0]",
            "description": "<p>抽奖得到奖品</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getDailyJiuJiJin",
    "title": "获取代理救济金",
    "description": "<p>获取代理救济金</p>",
    "name": "getDailyJiuJiJin",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object",
            "description": "<p>对象</p>"
          },
          {
            "group": "Success 200",
            "type": "bool",
            "optional": false,
            "field": "object.enabled",
            "description": ""
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.maxCount",
            "description": "<p>最大次数</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.limitTime",
            "description": "<p>限制间隔时间</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.limitCoins",
            "description": "<p>救济金额</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.gift",
            "description": "<p>救济物品</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.gift.gems",
            "description": "<p>救济物品</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.gift.yuanbaos",
            "description": "<p>救济物品</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object.gift.coins",
            "description": "<p>救济物品</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getDailySignIn",
    "title": "获取签到开关与奖励信息",
    "description": "<p>获取金币场设置</p>",
    "name": "getDailySignIn",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>最新结果</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getGoldSanGongRoom",
    "title": "获取金币场设置",
    "description": "<p>获取金币场设置</p>",
    "name": "getGoldSanGongRoom",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object",
            "description": "<p>对象</p>"
          },
          {
            "group": "Success 200",
            "type": "arr",
            "optional": false,
            "field": "object.stakeCoins",
            "description": "<p>五种筹码</p>"
          },
          {
            "group": "Success 200",
            "type": "arr",
            "optional": false,
            "field": "object.stakeCoins[0]",
            "description": "<p>第一种筹码</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.tipCoins",
            "description": "<p>小费金额</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.rate",
            "description": "<p>抽成比率</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "object.roomId",
            "description": "<p>房间号</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.seatNum",
            "description": "<p>seatNum</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getMarqueeMessage",
    "title": "获取大厅消息",
    "description": "<p>获取大厅消息</p>",
    "name": "getMarqueeMessage",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "str",
            "description": "<p>大厅消息</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getSanGongRoom",
    "title": "获取元宝场设置",
    "description": "<p>获取元宝场设置</p>",
    "name": "getSanGongRoom",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object",
            "description": "<p>对象</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.costGems12",
            "description": "<p>12局房卡</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.costGems24",
            "description": "<p>24局房卡</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.costGems120",
            "description": "<p>120局房卡</p>"
          },
          {
            "group": "Success 200",
            "type": "arr",
            "optional": false,
            "field": "object.yuanbaosLimit",
            "description": "<p>5个数字的数组</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.tipYuanBaos",
            "description": "<p>小费的元宝金额</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.rate",
            "description": "<p>抽水率</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "get",
    "url": "/api/admin/configs/getwzqRoom",
    "title": "获取五子棋设置",
    "description": "<p>获取金币场设置</p>",
    "name": "getwzqRoom",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "object",
            "description": "<p>对象</p>"
          },
          {
            "group": "Success 200",
            "type": "numble",
            "optional": false,
            "field": "object.rate",
            "description": "<p>抽水率</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setChouJiang",
    "title": "设置抽奖参数",
    "description": "<p>设置抽奖参数</p>",
    "name": "setChouJiang",
    "group": "configs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "bool",
            "optional": false,
            "field": "enabled",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "object",
            "optional": false,
            "field": "price",
            "description": "<p>内含coins yuanbaos gems</p>"
          },
          {
            "group": "Parameter",
            "type": "arr",
            "optional": false,
            "field": "gifts",
            "description": "<p>抽奖得到奖品数组 数组中对象中必含有rate 选择含有gems yuanbaos coins</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>返回空对象</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setDailyJiuJiJin",
    "title": "设置救济金",
    "description": "<p>设置救济金</p>",
    "name": "setDailyJiuJiJin",
    "group": "configs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "bool",
            "optional": false,
            "field": "enabled",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "maxCount",
            "description": "<p>最大次数</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "limitTime",
            "description": "<p>限制时间</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "limitCoins",
            "description": "<p>救济金额</p>"
          },
          {
            "group": "Parameter",
            "type": "object",
            "optional": false,
            "field": "gifts",
            "description": "<p>内含选填coins yuanbaos gems和数量</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>返回空对象</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setDailySignIn",
    "title": "设置签到开关与奖励",
    "description": "<p>获取金币场设置</p>",
    "name": "setDailySignIn",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "bool",
            "optional": false,
            "field": "enabled",
            "description": "<p>开关</p>"
          },
          {
            "group": "Parameter",
            "type": "arr",
            "optional": false,
            "field": "gifts",
            "description": "<p>签到礼物数组(格式：[{&quot;coins&quot;: 1000},...,...])</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>最新结果</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setGoldSanGongRoom",
    "title": "设置金币场",
    "description": "<p>设置金币场</p>",
    "name": "setGoldSanGongRoom",
    "group": "configs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "arr",
            "optional": false,
            "field": "stakeCoins",
            "description": "<p>内含五个数字的数组</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "tipCoins",
            "description": "<p>打赏数量</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "rate",
            "description": "<p>抽成比率（小数）</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "roomId",
            "description": "<p>房间号码</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "seatNum",
            "description": "<p>seatNum</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>返回空对象</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setMarqueeMessage",
    "title": "设置大厅消息",
    "description": "<p>设置大厅消息</p>",
    "name": "setMarqueeMessage",
    "group": "configs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "str",
            "description": "<p>大厅显示的内容</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>返回空对象</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setSanGongRoom",
    "title": "设置元宝场",
    "description": "<p>设置元宝场</p>",
    "name": "setSanGongRoom",
    "group": "configs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "costGems12",
            "description": "<p>12局房卡</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "costGems24",
            "description": "<p>24局房卡</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "costGems120",
            "description": "<p>120局房卡</p>"
          },
          {
            "group": "Parameter",
            "type": "arr",
            "optional": false,
            "field": "yuanbaosLimit",
            "description": "<p>内含五个数字的数组</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "tipYuanbaos",
            "description": "<p>打赏元宝数量</p>"
          },
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "rate",
            "description": "<p>抽成比率（小数）</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>返回空对象</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setShopList",
    "title": "修改商城商品",
    "description": "<p>修改商城里制定道具的数量、购买价格。</p>",
    "name": "setShopList",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "index",
            "description": "<p>原商城道具数组下标(作为索引,方便校验)</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "type",
            "description": "<p>修改类型(0：gamegold/1：gams/2：gems2coins)</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "value",
            "description": "<p>修改值</p>"
          },
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "price",
            "description": "<p>售价(可空，空则不修改)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>最新结果集</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息,返回&quot;error&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 查询错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setSignSettings",
    "title": "修改签到设置",
    "description": "<p>修改商城里制定道具的数量、购买价格。</p>",
    "name": "setSignSettings",
    "group": "configs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "description": "<p>token</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "index",
            "description": "<p>原商城道具数组下标(作为索引,方便校验)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "data",
            "description": "<p>最新结果集</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息,返回&quot;error&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 认证错误\n402 没有权限\n410 查询错误",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  },
  {
    "type": "post",
    "url": "/api/admin/configs/setwzqRoom",
    "title": "设置五子棋",
    "description": "<p>设置五子棋</p>",
    "name": "setwzqRoom",
    "group": "configs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "numble",
            "optional": false,
            "field": "rate",
            "description": "<p>抽成比率（小数）</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "result",
            "description": "<p>返回空对象</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "string",
            "optional": false,
            "field": "error",
            "description": "<p>错误信息</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error Code:",
          "content": "401 token格式错误\n500 获取失败\n402 没有权限",
          "type": "string"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "web_server/routes/api/admin/configs.js",
    "groupTitle": "configs"
  }
] });
