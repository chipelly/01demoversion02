//常用的元素和变量
var $body= $(document.body);

//画布相关,原生获取，内容是在canvas中的context中绘制
var $canvas= $('#game');//获取所有id为game的数组
var canvas= $canvas.get(0);//获取第一个canvas元素
var context= canvas.getContext("2d");

//设置画布的宽度和高度
canvas.width= window.innerWidth;
canvas.height= window.innerHeight;

//获取画布相关信息
var canvasWidth= canvas.clientWidth;
var canvasHeight= canvas.clientHeight;

//判断是否有requestAnimationFrame方法，如果有则模拟实现
//以下为兼容代码，目的是获取一个计时器
window.requestAnimFrame=
window.requestAnimationFrame||
window.webkitRequestAnimationFrame||
window.mozRequestAnimationFrame||
window.oRequestAnimationFrame||
window.msRequestAnimationFrame||
function(callback) {
	window.setTimeout(callback, 1000/30);
};


// 基本事件绑定(给每个按钮设置一个特殊的功能)
//应当了解的点：事件委托
function bindEvent() {
	//绑定事件
	var self= this;
	//点击开始按钮
	$body.on('click','.js-start',function() {
		$body.attr('data-status','start');
		//开始游戏
		GAME.start();
	});


	// $('.js-start')		获取一个类名为js-start的元素
	// $('.js-start').on()		on的意思为监听一个什么
	// $('.js-start').on('click')		监听一个点击的事件
	// $('.js-start').on('click'，function(){})	监听事件之后做什么，需要一个function函数。即回调函数
	// $('.js-start').on('click'，function(){})	 等同于上面的代码


	//点击说明按钮
	$body.on('click','.js-rule',function() {
		$body.attr('data-status','rule');
	});

	//点击设置按钮
	$body.on('click','.js-setting',function() {
		$body.attr('data-status','setting');
	});
	
	//点击确认设置按钮
	$body.on('click','.js-confirm-setting',function() {
		$body.attr('data-status','index');
		//设置游戏
		GAME.init();
	});

	//点击我知道了规则的按钮
	$body.on('click','.js-confirm-rule',function() {
		$body.attr('data-status','index');
	});
}
// function show_sub(bgname) {
// 	switch (bgname) {
// 		case 0: debody.background-image : url('../img/bg_1.jpg');
// 		case 1: debody.background-image : url('../img/bg_2.jpg');
// 		case 2: debody.background-image : url('../img/bg_3.jpg');
// 		case 3: debody.background-image : url('../img/bg_4.jpg');
// 		break;
// 	};
// }


// 游戏对象
var GAME= {
	// 游戏初始化
	init: function(opts) {
		//设置opts
		var opts= Object.assign({}, opts, CONFIG)//object.assign意思是将后面三个合成为一个给opts
		this.opts= opts;//调用对象本身

		//计算飞机初始坐标
		this.planePosX= canvasWidth/2 - opts.planeSize.width/2;
		this.planePosY=canvasHeight- opts.planeSize.height- 50;
	},

	// 游戏开始需要设置
	start: function() {
		//获取游戏初始化level
		var self= this;//保存函数调用对象（即Game）
		var opts= this.opts;
		var images= this.images;
		// 清空射击目标对象数组和分数设置为0
		this.enemies= [];
		this.score= 0;

		//随机生成大小敌机
		this.createSmallEnemyInterval= setInterval(function () {
			self.createEnemy('normal');
		},500);//每500毫秒创建一个小的
		this.createBigEnemyInterval= setInterval(function () {
			self.createEnemy('big');
		},1500);//每1秒5创建一个大的

		//创建主角英雄
		this.plane= new Plane({
			x: this.planePosX,
			y: this.planePosY,
			width: opts.planeSize.width,
			height: opts.planeSize.height,
			//子弹尺寸速度
			bulletSize: opts.bulletSize,
			bulletSpeed: opts.bulletSpeed,
			//图标相关
			icon: resourceHelper.getImage('bluePlaneIcon'),
			bulletIcon: resourceHelper.getImage('fireIcon'),
			boomIcon: resourceHelper.getImage('enemyBigBoomIcon')
		});
		//飞机开始射击
		this.plane.startShoot();

		//开始更新游戏
		this.update();
	},

	update: function() {
		var self= this;
		var opts= this.opts;
		//先清理画布
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		if (this.plane.status === 'boomed') {
			this.end();
			return;
		}
		//更新飞机、敌人
		this.updateElement();
		//绘制画布
		this.draw();	
		//不断循环update
		requestAnimFrame(function() {
			self.update()
		});
	},
	// 更新当前所有元素的状态
	updateElement:function() {
		var opts= this.opts;
		var enemySize= opts.enemySize;
		var enemies= this.enemies;
		var plane= this.plane;
		var i= enemies.length;
		var grade= 0;//计算分数

		if (plane.status === 'booming') {
			plane.booming();
			return;
		}

		//循环更新怪兽
		while (i--) {
			var enemy= enemies[i];
			enemy.down();
			if (enemy.y >= canvasHeight) {
				this.enemies.splice(i, 1);//去除这个元素
			}else {
				//判断飞机状态

				if (plane.status === 'normal') {
					if (plane.hasCrash(enemy)) {
						plane.booming();
					}
				}
				//根据怪兽状态判断是否被击中
				switch(enemy.status) {
					case 'normal':
						if (plane.hasHit(enemy)){
							var p = enemy.Live;
							enemy.live-= 1;
							if (enemy.live === 0){
								enemy.booming();
								if (p === 10){
									grade +=1000;
								}else {grade +=100;};
								
							}
						}
						break;
					case 'booming':
						enemy.booming();
						break;
					case 'boomed':
						enemies.splice(i, 1);
						break;
				}
				console.log('现在的得分是'+grade+'分！');

			}
		}
	},

	//绑定手指触摸
	bindTouchAction: function() {
		var opts= this.opts;
		var self= this;
		//飞机极限横坐标、纵坐标
		var planeMinX= 0;
		var planeMinY= 0;
		var planeMaxX= canvasWidth- opts.planeSize.width/2;
		var planeMaxY= canvasHeight- opts.planeSize.height;
		//手指初始位置坐标
		var startTouchX;
		var startTouchY;
		//飞机初始位置
		var startPlaneX;
		var startPlaneY;

		//首次触屏
		$canvas.on('touchstart',function(e) {
			var plane= self.plane;
			//记录首次触摸位置
			startTouchX= e.touches[0].clientX;
			startTouchY= e.touches[0].clientY;
			// console.log('touchstart', startTouchX. startTouchY);
			//记录飞机的初始位置
			startPlaneX= plane.x;
			startPlaneY= plane.y;
		});
		//滑动屏幕
		$canvas.on('touchmove', function(e) {
			var newTouchX= e.touches[0].clientX;
			var newTouchY= e.touches[0].clientY;
			// console.log('touchmove', newTouchX, newTouchY);

			//新的飞机坐标等于手指滑动的距离加上飞机初始位置
			var newPlaneX= startPlaneX+ newTouchX- startTouchX;
			var newPlaneY= startPlaneY+ newTouchY- startTouchY;
			//判断是否超出位置
			if(newPlaneX < planeMinX){
				newPlaneX = planeMinX;
			}
			if(newPlaneX > planeMaxX){
				newPlanex = planeMaxX;
			}
			if(newPlaneY < planeMinY){
				newPlaneY = planeMinY;
			}
			if(newPlaneY > planeMaxY){
				newPlaneY = planeMaxY;
			}
			//更新飞机的位置
			self.plane.setPosition(newPlaneX, newPlaneY);
			//禁止默认事件，防止滚动屏幕
			e.preventDefault();
		});
	},
	//生成怪兽
	createEnemy: function(enemyType) {
		var enemies= this.enemies;
		var opts= this.opts;
		var images= this.images||{};
		var enemySize= opts.enemySmallSize;
		var enemySpeed= opts.enemySpeed;
		var enemyIcon= resourceHelper.getImage('enemySmallIcon');
		var enemyBoomIcon= resourceHelper.getImage('enemySmallBoomIcon');

		var enemyLive= 1;

		//大型敌机参数
		if (enemyType === 'big') {
			enemySize= opts.enemyBigSize;
			enemyIcon= resourceHelper.getImage('enemyBigIcon');
			enemyBoomIcon= resourceHelper.getImage('enemyBigBoomIcon');
			enemySpeed= opts.enemySpeed* 0.6;
			enemyLive= 10;
		}

		//综合元素的参数
		// math.random() 生成随机数，用math.floor包起来是为了四舍五入输出整数
		var initOpt = {
	      x: Math.floor(Math.random() * (canvasWidth - enemySize.width)), 
	      y: -enemySize.height,
	      enemyType: enemyType,
	      live: enemyLive,
	      width: enemySize.width,
	      height: enemySize.height,
	      speed: enemySpeed,
	      icon: enemyIcon,
	      boomIcon: enemyBoomIcon
	    }

		//怪兽的数量不大于最大值则新增
		if (enemies.length< opts.enemyMaxNum) {
			enemies.push(new Enemy(initOpt));
		}
		// console.log(enemies);
	},
	end: function() {
		alert('Game over!');
		init();
	},
	draw: function() {
		this.enemies.forEach(function(enemy) {//遍历
			enemy.draw();
		});//绘制敌人
	this.plane.draw();//绘制飞机
	}
};



// 页面主入口
function init() {
	//加载图片资源，加载完成才能交互
	resourceHelper.load(CONFIG.resources, function(resources) {
		//加载完成
	GAME.init();
	GAME.bindTouchAction();//绑定手指事件
	bindEvent();//执行绑定事件
	});
	
}

init();
