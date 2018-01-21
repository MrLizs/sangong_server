var hu = require('../majiang_server/huCheck.js');

var holds = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3,3,4,9];
//var holds = [2, 4, 6, 8, 12, 12, 18, 18, 24, 1, 1, 1, 1];
var laiZi = 2;
var date = new Date();
console.log('平胡听牌检查');
console.log(holds);
for (var p = 0; p < 34; p++) {
    if (p != laiZi) {
        //console.log(p);
        var result = hu.checkPinHu_laiZi(holds, p, laiZi);
        if(result>=0){
            console.log('平胡 : ' + p+'  用了'+result+'个赖子');
        }else{
            //console.log(p+' 不能胡');
        }
    }
}
console.log('END  time:' + (new Date() - date) / 1000 + 's');