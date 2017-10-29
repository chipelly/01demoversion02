// 游戏相关配置
//@type {Object}

var  CONFIG= {
	planeSize: {
		width: 60,
		height: 45
	},
	planeType: 'bluePlaneIcon', //默认是蓝色
	bulletSize: {
		width: 20,
		height: 20
	},
	enemySpeed: 5,//默认敌人移动距离
	enemyMaxNum: 15,//敌人最大数量
	enemySpeedSmallSize: {
		width: 54,
		height: 40
	},
	enemyBigSize: {
		width:130,
		height: 100
	},
	enemySmallSize: {
		width:54,
		height: 40
	},
	bulletSpeed: 6,//默认子弹的移动速度
	resources: {
		images:[
		{
			src: './img/plane_1.png',
			name: 'bluePlaneIcon'
		},
		{
			src: './img/plane_2.png',
			name: 'pinkPlaneIcon'
		},
		{
			src: './img/fire.png',
			name: 'fireIcon'
		},
		{
			src: './img/enemy_big.png',
			name: 'enemyBigIcon'
		},
		{
			src: './img/enemy_small.png',
			name: 'enemySmallIcon'
		},
		{
			src: './img/boom_big.png',
			name: 'enemyBigBoomIcon'
		},
		{
			src: './img/boom_small.png',
			name: 'enemySmallBoomIcon'
		},
		
		],
		sounds:[ 
		{
			src:'./sound/biubiubiu.mp3',
			name:'bulletsound'
		},
		{
			src:'./sound/boom.mp3',
			name:'boomsound'
		},
		{
			src:'./sound/button.mp3',
			name:'buttonsound'
		},
		{
			src:'./sound/die.mp3',
			name:'diesound'
		},
		{
			src:'/sound/music.mp3',
			name:'bgmsound'
		},
		]
	}
}