exports.mysql = function(){
	return {
		HOST:'127.0.0.1',
		USER:'root',
		PSWD:'123456',
		DB:'majiang_dealers',
		PORT:3306,
	}
}

exports.port = 9064;

exports.users = function(){
	return {
		HOST:'localhost',
		PORT:9065,
		GET_PATH:'/get_user_info',
		ADD_PATH:'/add_user_gems',
		GET_ALL_PATH:'/get_all_user_info',
		UNBIND_PATH:'/unbind_dealer',
		SAFE:false,		
	}
}