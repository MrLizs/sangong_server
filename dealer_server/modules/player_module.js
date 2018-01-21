'use strict'
var Fibers = require('fibers');

var base_module = require("./base_module");
// import * as base_module from "./base_module";

var port = 9065;

class player_module extends base_module
{
	constructor(){
		super();
	}	

	service(){

        this.app.get('/search_user',function (req,res,next){
				this.search_user(req,res,next);
			}.bind(this) );

		this.app.get('/transfer_gems2user',function (req,res,next){
				this.transfer_gems2user(req,res,next);
			}.bind(this) );

        this.app.get('/search_all_user',function (req,res,next){
				this.search_all_user(req,res,next);
			}.bind(this) );

        //解绑代理
        this.app.get('/unbind_dealer',function (req,res,next){
				this.unbind_dealer(req,res,next);
			}.bind(this) );
    };

    search_all_user(req,res){
        var token = req.query.token;
        //var userid = req.query.userid;
        if(this.checkNullValue([token])){
            this.send(res,-1,"unknown error.");
            return;
        }

        var ret = this.getDealerByToken(token); 
        if(!ret){
            this.send(res,port,"token check failed.");
            return;
        }         

        var userdata = this.getAllUser();
        if( !userdata || userdata.errcode > 0 )
        {
            this.send(res,2,"can't find user info.");
        }else{
             this.send(res,0,"ok",{
                    userid:userdata.userid,
                    dealerid:userdata.dealerid,
                    gems:userdata.gems,
                    name:userdata.name,
                });
        }
    };

    unbind_dealer(req,res){
        var token = req.query.token;
        var userid = req.query.userid;
        var dealerid = req.query.dealerid;
        if(this.checkNullValue([token,userid])){
            this.send(res,-1,"unknown error.");
            return;
        }

        var ret = this.getDealerByToken(token); 
        if(!ret){
            this.send(res,port,"token check failed.");
            return;
        }         

        var userdata = this.unbindDealer(userid,dealerid);
        if( !userdata || userdata.errcode > 0 )
        {
            this.send(res,2,"can't find user.");
        }else{
             this.send(res,0,"ok",{
                    userid:userid,
                    dealerid:userdata.dealerid,
                    gems:userdata.gems,
                    name:userdata.name,
                });
        }
    };

    search_user(req,res){
        var token = req.query.token;
        var userid = req.query.userid;
        if(this.checkNullValue([token,userid])){
            this.send(res,-1,"unknown error.");
            return;
        }

        var ret = this.getDealerByToken(token); 
        if(!ret){
            this.send(res,port,"token check failed.");
            return;
        }         

        var userdata = this.getUserGameInfo(userid);
        if( !userdata || userdata.errcode > 0 )
        {
            this.send(res,2,"can't find user.");
        }else{
             this.send(res,0,"ok",{
                    userid:userid,
                    dealerid:userdata.dealerid,
                    gems:userdata.gems,
                    name:userdata.name,
                });
        }
    };


	transfer_gems2user(req,res,next){
		var token = req.query.token;
        var userid = req.query.userid;
        var num = req.query.num;
        
        if(this.checkNullValue([token,userid,num])){
            this.send(res,-1,"unknown error.");
            return;
        }
        
        num = parseInt(num);
        var dealer = this.getDealerByToken(token);
        if(!dealer){
            this.send(res,port,"token check failed.");
            return;
        }

        var userdata = this.getUserGameInfo(userid);
        if(!userdata){
            this.send(res,2,"can't find user.");
            return;
        }

        if(userdata.dealerid != null && userdata.dealerid != dealer.account){
            this.send(res,11,"dealer has bind!!! error!!!");
            return;
        }

        if(dealer.gems < num){
            this.send(res,4,"lack of gems",{gems:dealer.gems});	
        }
        else{
            var ret = this.addBillRecord(this.getOrderID(),dealer.account,userdata.userid,num,Date.now(),"");
            if(ret){
                this.decDealerGems(dealer.account,num);
                if( this.addUserGems(userdata.userid,dealer.account,num) )
                {
                    this.send(res,0,"ok",{gems:dealer.gems - num,targetgems:userdata.gems + num,dealerid: dealer.account});
                
                    //积分返还
                    var rates = this.getRates();

                    this.addDealerScore(dealer.account,num*rates.rate1);

                    var parent = this.getDealerByAccount(dealer.parent);
                    if(parent){
                        this.addDealerScore(parent.account,num*rates.rate2);
                        //向上上一级代理返积分
                        if(parent.parent){
                            this.addDealerScore(parent.parent,num*rates.rate3);
                        }
                    }
                }else{
                    this.send(res,6,"add user gems failed.");
                }                
            }
            else{
                this.send(res,5,"system is busy now, please try later.");
            }
        }	
	};

//=====================================================================
	getAllUser(){
        var userdata = null;
        var f = Fibers.current;
        this.http.get(this.user_host,this.user_port,this.user_get_all_path,{},function(state,result){
            if(state)
            {
                userdata = result;
            }else{
                userdata = null;
            }
            f.run();
        },this.user_safe);
        Fibers.yield();
        return userdata;
	};

	unbindDealer(userid,dealerid){
        var userdata = null;
        var f = Fibers.current;
        this.http.get(this.user_host,this.user_port,this.user_unbind_path,{userid:userid,dealerid:dealerid},function(state,result){
            if(state)
            {
                userdata = result;
            }else{
                userdata = null;
            }
            f.run();
        },this.user_safe);
        Fibers.yield();
        return userdata;
	};

    initUserService(cfg){
        // console.log(cfg);
        this.user_host = cfg.HOST;
        this.user_port = cfg.PORT;
        this.user_get_path = cfg.GET_PATH;
        this.user_add_path = cfg.ADD_PATH;
        this.user_get_all_path = cfg.GET_ALL_PATH;
        this.user_unbind_path = cfg.UNBIND_PATH;
        this.user_safe = cfg.SAFE;
    };

     /**获得玩家信息 */
    getUserGameInfo(userid){
        if(userid == null){
            return null;
        }

        var userdata = null;
        var f = Fibers.current;
        this.http.get(this.user_host,this.user_port,this.user_get_path,{userid:userid},function(state,result){
            if(state)
            {
                userdata = result;
            }else{
                userdata = null;
            }
            f.run();
        },this.user_safe);
        Fibers.yield();
        return userdata;
        
        // var sql = 'SELECT userid,name,gems,headimg FROM t_users WHERE userid = ' + userid;
        // var ret = this.query(sql);
        // if(ret.err){
        //     console.log(ret.err);
        //     return null;
        // }
        // else{
        //     if(ret.rows.length == 0){
        //         return null;
        //     }
        //     return ret.rows[0];
        // }
    }; 



    /**增加玩家房卡 */
    addUserGems(userid,dealerid,gems){

        var back = null;
        var f = Fibers.current;
        this.http.get(this.user_host,this.user_port,this.user_add_path,{userid:userid,dealerid:dealerid,gems:gems},function(state,result){
            back = result.errcode == 0;
            f.run();
        },this.user_safe);
        Fibers.yield();
        return back;
    };
	 
}

module.exports = player_module;