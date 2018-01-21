/*
Navicat MySQL Data Transfer

Source Server         : 47.104.107.134
Source Server Version : 50173
Source Host           : 47.104.107.134:3306
Source Database       : sangong

Target Server Type    : MYSQL
Target Server Version : 50173
File Encoding         : 65001

Date: 2017-12-08 13:59:13
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `orderNum` varchar(36) NOT NULL,
  `goodInfo` varchar(400) NOT NULL,
  `money` float NOT NULL,
  `createTime` datetime NOT NULL,
  `state` varchar(36) NOT NULL DEFAULT 'noPay',
  `payTime` datetime DEFAULT NULL,
  `paidMoney` float DEFAULT NULL,
  `refundTime` datetime DEFAULT NULL,
  `refundedMoney` float DEFAULT NULL,
  `userId` int(11) NOT NULL DEFAULT '0',
  `detailInfo` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of orders
-- ----------------------------

-- ----------------------------
-- Table structure for t_accounts
-- ----------------------------
DROP TABLE IF EXISTS `t_accounts`;
CREATE TABLE `t_accounts` (
  `account` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_accounts
-- ----------------------------

-- ----------------------------
-- Table structure for t_admins
-- ----------------------------
DROP TABLE IF EXISTS `t_admins`;
CREATE TABLE `t_admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `roles` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_admins
-- ----------------------------
INSERT INTO `t_admins` VALUES ('1', 'admin', 'e10adc3949ba59abbe56e057f20f883e', null);

-- ----------------------------
-- Table structure for t_configs
-- ----------------------------
DROP TABLE IF EXISTS `t_configs`;
CREATE TABLE `t_configs` (
  `id` varchar(100) NOT NULL,
  `str` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_configs
-- ----------------------------
INSERT INTO `t_configs` VALUES ('chouJiang', '{\"enabled\":true,\"price\":{\"coins\":0,\"yuanbaos\":0,\"gems\":5},\"gifts\": [{\"rate\":10,\"gems\": 50},{\"rate\":10,\"coins\":1000}, {\"rate\":10,\"yuanbaos\": 10}, {\"rate\":10,\"gems\": 10}, {\"rate\":10,\"yuanbaos\": 30}, {\"rate\":10,\"coins\": 500}, {\"rate\":10,\"gems\": 100}, {\"rate\":10,\"yuanbaos\": 15}, {\"rate\":10,\"coins\": 5}, {\"rate\":10,\"gems\": 5}, {\"rate\":10,\"yuanbaos\": 500}, {\"rate\":10,\"coins\": 5}]}');
INSERT INTO `t_configs` VALUES ('dailyJiuJiJin', '{\"enabled\":true,\"maxCount\":3,\"limitTime\":600,\"limitCoins\":1000,\"gift\":{\"coins\":1000}}');
INSERT INTO `t_configs` VALUES ('dailySignIn', '{\"enabled\":true,\"gifts\": [{\"coins\": 1000}, {\"coins\": 1500}, {\"coins\": 2200}, {\"coins\": 3000}, {\"coins\": 4000}, {\"coins\": 5500}, {\"gems\": 1}]}');
INSERT INTO `t_configs` VALUES ('goldSanGongRoom', '{\"stakeCoins\":[1000,10000,100000,500000,1000000],\"tipCoins\":100,\"rate\":0.01,\"roomId\":\"000001\",\"seatNum\":8}');
INSERT INTO `t_configs` VALUES ('marqueeMessage', '大厅消息');
INSERT INTO `t_configs` VALUES ('shop', '[{\"type\":\"coins\",\"items\":[{\"coins\":1000,\"price\":1},{\"coins\":10000,\"price\":8},{\"coins\":50000,\"price\":20},{\"coins\":100000,\"price\":30},{\"coins\":1000000,\"price\":100},{\"coins\":5000000,\"price\":200}]},{\"type\":\"gems\",\"items\":[{\"gems\":1,\"price\":1},{\"gems\":10,\"price\":8},{\"gems\":50,\"price\":20},{\"gems\":100,\"price\":30},{\"gems\":1000,\"price\":100},{\"gems\":5000,\"price\":200}]},{\"type\":\"gems2coins\",\"items\":[{\"coins\":1000,\"price\":1},{\"coins\":10000,\"price\":8},{\"coins\":50000,\"price\":20},{\"coins\":100000,\"price\":30},{\"coins\":1000000,\"price\":100},{\"coins\":5000000,\"price\":200}]}]');
INSERT INTO `t_configs` VALUES ('sanGongRoom', '{\"costGems12\":5,\"costGems24\":8,\"yuanbaosLimit\":[100,200,500,1000,2000,5000],\"tipYuanbaos\":1,\"rate\":0.01}');
INSERT INTO `t_configs` VALUES ('wzqRoom', '{\"rate\":0.01}');

-- ----------------------------
-- Table structure for t_games
-- ----------------------------
DROP TABLE IF EXISTS `t_games`;
CREATE TABLE `t_games` (
  `room_uuid` char(20) NOT NULL,
  `game_index` int(11) NOT NULL,
  `base_info` varchar(1024) NOT NULL,
  `create_time` int(11) NOT NULL,
  `snapshots` char(255) DEFAULT NULL,
  `action_records` varchar(2048) DEFAULT NULL,
  `result` varchar(10240) DEFAULT NULL,
  PRIMARY KEY (`room_uuid`,`game_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_games_archive
-- ----------------------------
DROP TABLE IF EXISTS `t_games_archive`;
CREATE TABLE `t_games_archive` (
  `room_uuid` char(20) NOT NULL,
  `game_index` int(11) NOT NULL,
  `base_info` varchar(1024) NOT NULL,
  `create_time` int(11) NOT NULL,
  `snapshots` char(255) DEFAULT NULL,
  `action_records` varchar(2048) DEFAULT NULL,
  `result` varchar(10240) DEFAULT NULL,
  PRIMARY KEY (`room_uuid`,`game_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_guests
-- ----------------------------
DROP TABLE IF EXISTS `t_guests`;
CREATE TABLE `t_guests` (
  `guest_account` varchar(255) NOT NULL,
  PRIMARY KEY (`guest_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_guests
-- ----------------------------

-- ----------------------------
-- Table structure for t_message
-- ----------------------------
DROP TABLE IF EXISTS `t_message`;
CREATE TABLE `t_message` (
  `type` varchar(32) NOT NULL,
  `msg` varchar(1024) NOT NULL,
  `version` varchar(32) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_message
-- ----------------------------
INSERT INTO `t_message` VALUES ('notice', '麻将全新上线! 本平台免费! 如无房卡请联系群主或客服!', '20161128');
INSERT INTO `t_message` VALUES ('fkgm', '本平台免费! 如无房卡请联系群主或客服!', '20161128');

-- ----------------------------
-- Table structure for t_rooms
-- ----------------------------
DROP TABLE IF EXISTS `t_rooms`;
CREATE TABLE `t_rooms` (
  `uuid` char(20) NOT NULL,
  `id` char(8) NOT NULL,
  `base_info` varchar(512) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL,
  `num_of_turns` int(11) NOT NULL DEFAULT '0',
  `next_button` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(16) DEFAULT NULL,
  `port` int(11) DEFAULT '0',
  `user_infos` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_user_game_results
-- ----------------------------
DROP TABLE IF EXISTS `t_user_game_results`;
CREATE TABLE `t_user_game_results` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `room_uuid` char(20) NOT NULL,
  `game_index` int(11) NOT NULL,
  `game_type` varchar(20) NOT NULL,
  `create_time` datetime NOT NULL,
  `result_type` varchar(20) NOT NULL,
  `result_value` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1790 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_user_get_gift
-- ----------------------------
DROP TABLE IF EXISTS `t_user_get_gift`;
CREATE TABLE `t_user_get_gift` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `seriesNo` int(11) DEFAULT NULL,
  `giftInfo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2306 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for t_users
-- ----------------------------
DROP TABLE IF EXISTS `t_users`;
CREATE TABLE `t_users` (
  `userid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `account` varchar(64) NOT NULL DEFAULT '' COMMENT '账号',
  `name` varchar(64) DEFAULT NULL COMMENT '用户昵称',
  `sex` int(1) DEFAULT NULL,
  `headimg` varchar(256) DEFAULT NULL,
  `lv` smallint(6) DEFAULT '1' COMMENT '用户等级',
  `exp` int(11) DEFAULT '0' COMMENT '用户经验',
  `coins` int(11) DEFAULT '0' COMMENT '用户金币',
  `coinsbank` int(11) NOT NULL DEFAULT '0',
  `yuanbaos` int(11) NOT NULL DEFAULT '0' COMMENT '用户金币',
  `yuanbaosbank` int(11) NOT NULL DEFAULT '0' COMMENT '用户金币',
  `gems` int(11) DEFAULT '0' COMMENT '用户宝石',
  `roomid` varchar(8) DEFAULT NULL,
  `history` varchar(4096) NOT NULL DEFAULT '',
  `bankpassword` varchar(255) NOT NULL DEFAULT '',
  `dealerid` int(11) DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `account` (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=300 DEFAULT CHARSET=utf8;
