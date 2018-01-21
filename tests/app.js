var configs = require('../configs');
//var Fiber = require("fibers");


var db = require('../utils/db');
db.init(configs.mysql());


// db.balanceGame(null,function(ret1,ret2){
//     console.log(ret1);
//     console.log(ret2);
// });

db.usersAddUserGems(248,1,function(err,results){
    var a = results;
});