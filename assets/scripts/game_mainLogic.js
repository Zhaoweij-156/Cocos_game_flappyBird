var userData = {
    "name": "player",
    "best": 0,
};

cc.Class({
    extends: cc.Component,

    properties: {
        // 两块地板的父节点
        node_ground: {
            type: cc.Node,
            default: null,
        },
        // 地板移动速度
        speed_ground_move: 100,

        // 白天背景的节点
        node_bg_day: {
            type: cc.Node,
            default: null,
        },
        // 夜晚背景的节点
        node_bg_night: {
            type: cc.Node,
            default: null,
        },

        // 玩家分数字体
        label_score: {
            type: cc.Label,
            default: null,
        },
        // 游戏结束面板的分数字体
        label_over_score: {
            type: cc.Label,
            default: null,
        },
        // 游戏结束面板的最高得分字体
        label_over_best: {
            type: cc.Label,
            default: null,
        },

        // 小鸟节点的数组
        node_bird_array: {
            type: cc.Node,
            default: [],
        },
        // 玩家操控的小鸟的节点
        node_bird_play: {
            type: cc.Node,
            default: null,
        },

        // 游戏主页的父节点
        node_index: {
            type: cc.Node,
            default: null,
        },
        // 游戏准备的父节点
        node_ready: {
            type: cc.Node,
            default: null,
        },
        // 游戏结束的父节点
        node_over: {
            type: cc.Node,
            default: null,
        },
        // 奖牌节点数组
        node_medal_array: {
            type: cc.Node,
            default: [],
        },

        // 管道预制体数组
        prefab_pipe_array: {
            type: cc.Prefab,
            default: [],
        },
        // 管道预制体的父节点
        node_pipe_ALL: {
            type: cc.Node,
            default: null,
        },
        // 管道预制体实例化的间隔
        interval_instantiate_one_pipe: 1.7,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化
        this._init_();
    },

    // 初始化函数
    _init_: function() {
        // 获取用户数据
        let myUserData = this.getUserData();
        // land的长度
        this.node_land = this.node_ground.getChildByName("land");
        this.width_land = this.node_land.width;
        // 玩家得分
        this.score = 0;
        // 玩家最高得分（若用户数据没有存储最高得分，重置）
        if(!!myUserData && !!myUserData.best) {
            userData = myUserData;
            this.best = userData.best;
        } else {
            userData = {
                "name": "player",
                "best": 0,
            };
            this.best = 0;
        }
        
    },

    // 存储用户数据函数
    setUserData: function() {
        let dataString = JSON.stringify(userData);
        // 加密
        let encrypted = dataString;
        cc.sys.localStorage.setItem('userData', encrypted); //无加密，直接存储  
    },

    // 读取用户数据函数
    getUserData: function() {
        let cipherText = cc.sys.localStorage.getItem('userData');
        if(!!cipherText) {
            return JSON.parse(cipherText);  //无加密，直接转换
        }
        return null;
    },

    start () {
        // 地板是否可以移动
        this.canMove = true;
        // 执行游戏主页函数
        this.game_index();
    },

    update (dt) {
        // console.log("dt: " + dt);

        // 地板不断移动
        if(this.canMove) {
            this.groundMove(dt);
        }
        
    },

    // 地板移动函数
    groundMove: function(time) {
        // 向左匀速移动
        this.node_ground.x -= this.speed_ground_move * time;
        // 超过范围后重置地板位置（回到起点），让地板处于一直移动的状态
        if(this.node_ground.x <= -this.width_land) {
            this.node_ground.x = 0;
        }
    },

    // 背景图片设置函数
    set_bg_skin: function() {
        // 随机选择一种皮肤显示
        let dayOrNight = Math.floor(2 * Math.random()); // 0-day, 1-night;
        // console.log("dayOrNight: " + dayOrNight);
        if(dayOrNight == 0) {
            this.node_bg_day.active = true;
            this.node_bg_night.active = false;
        } else {
            this.node_bg_day.active = false;
            this.node_bg_night.active = true;
        }
    },

    // 背景图片切换函数
    toggle_bg_skin: function() {
        // 背景图片显示状态切换
        this.node_bg_day.active = !this.node_bg_day.active;
        this.node_bg_night.active = !this.node_bg_day.active;
    },

    // 小鸟皮肤设置函数
    set_bird_skin: function() {
        // 隐藏全部皮肤
        for(let i = 0; i < this.node_bird_array.length; i++) {
            this.node_bird_array[i].active = false;
        }
        // 随机选择一种皮肤显示
        let bird_skin_type = Math.floor(this.node_bird_array.length * Math.random());
        // console.log("bird_skin_type: " + bird_skin_type);
        this.node_bird_array[bird_skin_type].active = true;
        this.node_bird_play = this.node_bird_array[bird_skin_type];
    },

    // 游戏主页函数
    game_index: function() {
        // 显示游戏主页
        this.node_index.active = true;
        this.node_ready.active = false;
        this.node_over.active = false;
        // 设置游戏背景（随机）
        this.set_bg_skin();
        // 设置小鸟皮肤（随机）
        this.set_bird_skin();
        // 初始化小鸟位置和角度
        this.node_bird_play.parent.x = 0;
        this.node_bird_play.parent.y = 0;
        this.node_bird_play.parent.angle = 0;
    },

    // 游戏准备函数
    game_ready: function() {
        // 显示游戏准备页面
        this.node_index.active = false;
        this.node_ready.active = true;
        this.node_over.active = false;
        // 切换背景
        this.toggle_bg_skin();
        // 设置小鸟皮肤（随机）
        this.set_bird_skin();
        // 移动小鸟位置并设置角度
        this.node_bird_play.parent.x = -62;
        this.node_bird_play.parent.y = 0;
        this.node_bird_play.parent.angle = 0;
        // 让小鸟飞行并初始化一些属性
        if(!!this.node_bird_play) {
            this.component_birdManager = this.node_bird_play.parent.getComponent("game_birdManager");
            this.component_birdManager.speed_bird_drop = 0;
            this.component_birdManager.y_land = this.node_land.y;
            this.component_birdManager.height_land = this.node_land.height;
            this.component_birdManager.bird_action_stop();
            this.component_birdManager.component_bird_animation = this.node_bird_play.getComponent(cc.Animation);
            this.node_bird_play.getComponent(cc.Animation).play();
        }
        // 开启碰撞检测
        cc.director.getCollisionManager().enabled = true;
        // 按钮启动
        this.birdJumpButton_manager(true);
        // 清空已有管道
        this.node_pipe_ALL.removeAllChildren();
        // 让地板开始移动
        this.canMove = true;
        // 重置玩家得分
        this.score = 0;
        this.label_score.string = "0";
    },

    // 游戏开始函数
    game_start: function() {
        // 隐藏游戏准备页面
        this.node_ready.active = false;
        // 小鸟开始掉落
        this.component_birdManager.bird_action_start();
        // 选择管道类型
        this.pipeType = 0;  // 0-pipe, 1-pipe2
        // 生成管道
        this.instantiate_one_pipe();
    },

    // 管道生成函数
    instantiate_one_pipe: function() {
        // 根据管道类型实例化管道预制体
        var myPipe = cc.instantiate(this.prefab_pipe_array[this.pipeType]);
        // 管道移动速度与地板移动速度保持一致，同时将小鸟碰撞组件赋予管道实例使用
        let component_pipeManager = myPipe.getComponent("game_pipeManager");
        component_pipeManager.speed_pipe_move = this.speed_ground_move;
        component_pipeManager.component_bird_polygonCollider = this.node_bird_play.parent.getComponent(cc.PolygonCollider);
        // 插入到父节点中
        this.node_pipe_ALL.addChild(myPipe);
        // interval_instantiate_one_pipe秒后生成下一条管道
        this.scheduleOnce(this.instantiate_one_pipe.bind(this), this.interval_instantiate_one_pipe);
    },

    // 玩家得分增加函数
    addScore: function() {
        // 等分加1
        this.score++;
        // 改变字体
        this.label_score.string = "" + this.score;
    },

    // 游戏结束函数
    game_over: function() {
        // 游戏暂停
        this.game_pause(true);
        // 显示游戏结束页面
        this.node_index.active = false;
        this.node_ready.active = false;
        this.node_over.active = true;
        // 修改得分面板数据
        this.label_over_score.string = "" + this.score;
        if(this.score > this.best) {
            // 改变字体
            this.best = this.score;
            // 缓存数据
            userData.best = this.best;
            this.setUserData();
        }
        this.label_over_best.string = "" + this.best;
        // 显示奖牌（0-银牌 1-金牌 2-普通奖牌 3-铜牌）
        for(let i = 0; i < this.node_medal_array.length; i++) {
            this.node_medal_array[i].active = false;
        }
        if(this.score <= 10) {
            this.node_medal_array[2].active = true; // 0~10->普通奖牌
        } else if(this.score <= 20) {
            this.node_medal_array[3].active = true; // 11~20->铜牌
        } else if(this.score <= 35) {
            this.node_medal_array[0].active = true; // 21~35->银牌
        } else {
            this.node_medal_array[1].active = true; // 50~正无穷->金牌
        } 
    },

    // 游戏暂停函数
    game_pause: function(isPauseBirdAction) {
        // 关闭碰撞检测
        cc.director.getCollisionManager().enabled = false;
        // 小鸟飞跃按钮禁用
        this.birdJumpButton_manager(false);
        // 根据isPauseBirdAction暂停小鸟运动
        if(isPauseBirdAction) {
            if(!this.component_birdManager) {
                this.component_birdManager = this.node_bird_play.parent.getComponent("game_birdManager");
            }
            this.component_birdManager.bird_action_pause();
        }
        // 不再生成管道
        this.unscheduleAllCallbacks();
        // 暂停现有管道运动
        for(let i = 0; i < this.node_pipe_ALL.childrenCount; i++) {
            let child_pipe = this.node_pipe_ALL.children[i];
            let component_pipeManager = child_pipe.getComponent("game_pipeManager");
            if(!!component_pipeManager) {
                component_pipeManager.pipe_action_pause();
            }
        }
        // 暂停地板运动
        this.ground_action_pause();
    },

    // 小鸟飞跃按钮管理函数（默认禁用）
    birdJumpButton_manager: function(buttonInteractable) {
        if(buttonInteractable == true) {
            // 小鸟飞跃点击按钮启动
            this.node.getComponent(cc.Button).interactable = true;
        } else {
            // 小鸟飞跃点击按钮禁用
            this.node.getComponent(cc.Button).interactable = false;
        }
    },

    // 管道运动暂停函数
    ground_action_pause: function() {
        this.canMove = false;
    },

    // 管道运动继续函数
    ground_action_resume: function() {
        this.canMove = true;
    },

});
