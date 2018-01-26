
var db = require('../../utils/db');
var crypto = require('../../utils/crypto');

var tokenMap = {};

exports.auth = function (token, role, success, noRoles, error) {
    try {
        var loginInfos = crypto.fromBase64(token).split('|');
        var userName = loginInfos[0];
        if (tokenMap[userName]) {
            if (tokenMap[userName].token != token) {
                error('wrong token');
                return;
            }
            // if (tokenMap[userName].ip != user_ip) {
            //   error('wrong ip');
            //   return;
            // }
            // db.get_agency_accountlock(loginInfos[0],function(err,row){
            //     if(row){
                    db.auth_agency(loginInfos[0], loginInfos[1], function (err, admin) {
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
            //     }
            //     else if(row == false){
            //         error('account is locked');
            //     }
            // });
            
        } else {
            error('no token in server');
        }
    } catch (ex) {
        error(ex);
    }
}

exports.login = function (userName, password, onSuccess, onError) {
    db.get_agency_info(userName,password, function (err, admin) {
        if (err) {
            onError(err);
        } else {
            var token = crypto.toBase64(userName + '|' + crypto.md5(password));
            tokenMap[userName] = { token: token, time: new Date() };
            onSuccess(token);
        }
    });
}

exports.logout = function (token) {
    try {
        var loginInfos = crypto.fromBase64(token).split('|');
        var userName = loginInfos[0];
        delete tokenMap[userName];
        return true;
    } catch (ex) {
        console.error(ex);
    }
    return false;
};