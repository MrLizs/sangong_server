var express = require('express');
var db = require('../utils/db');
var http = require('http');
var gamegoldConfig = require('../game_goldsangong_server/configs');
var connect = 'http://127.0.0.1:9022';
// var post = 9022;
var robotList = [];

exports.addedRobot = function(room,roomid){
    console.log("addedRobot");
    db.get_robot_usablelist(roomid , function(err,rows){
        if(err){
            console.log("get_robot_usablelist : " + err);
        }
        if(rows){
            robotList = rows;
            for (let i = 0; i < rows.length; i++) {
                // console.log('list : ' + rows[i]);
                if(rows[i].roomid == null){
                    var cmddata = "?account=" + rows[i].account;
                    getRequest('/guest',cmddata,function(data){
                        console.log(data);
                    });
                    // db.update_robot_usablelist(rows[i].account,roomid,function(result){
                    //     if(result == true){
                    //         console.log("add robot complete");
                            
                    //     }
                    // });
                }
            }
        }
    });
};


function getRequest(cmd,data,callback){
    var connCmd = connect+cmd+data;
    console.log('内部get请求：'+ connCmd);
    http.get(connCmd, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('请求失败。\n' + `状态码: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error('无效的 content-type.\n' + `期望 application/json 但获取的是 ${contentType}`);
    }
    if (error) {
        console.error(error.message);
        // 消耗响应数据以释放内存
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
                callback(parsedData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`错误: ${e.message}`);
    });
};

function postRequest(cmd,data){
    const req = http.request(options(cmd,data), (res) => {
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应头: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`响应主体: ${chunk}`);
        });
        res.on('end', () => {
          console.log('响应中已无数据。');
        });
      });
      
      req.on('error', (e) => {
        console.error(`请求遇到问题: ${e.message}`);
      });
      
      // 写入数据到请求主体
      req.write(postData);
      req.end();
};

function options(cmd,data){
    var options = {
        hostname: connect,
        port: post,
        path: cmd,
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(querystring.stringify({data}))
        }
    };
    return options
};