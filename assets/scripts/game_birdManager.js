
cc.Class({
    extends: cc.Component,

    properties: {
        // 小鸟竖直方向上的飞行速度
        speed_bird_fly_y: 30,
        // 小鸟飞行的最高高度
        high_max_bird_fly: 25,
        // 小鸟飞行的最低高度
        high_min_bird_fly: -2,
        // 小鸟下落的重力加速度
        acceleration_bird_drop: -600,
        // 小鸟头部朝下的速度
        speed_angle_bird_drop: 100,
        // 小鸟飞跃的速度
        speed_bird_jump: 250,
        // 小鸟飞跃时头部角度
        angle_bird_jump: 45,
        // 玩家操控的小鸟节点下的动画组件
        component_bird_animation: {
            type: cc.Animation,
            default: null,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化
        this._init_();
    },

    // 初始化函数
    _init_: function() {
        // 小鸟下落的速度
        this.speed_bird_drop = 0;
        // 地板节点的y值
        this.y_land = -250;
        // 地板的高度
        this.height_land = 112;
    },

    start () {
        // 小鸟是否在飞行
        this.isFlying = true;
        // 小鸟是否可以下落
        this.canDrop = false;
    },

    update (dt) {
        // console.log("dt: " + dt);

        // 小鸟飞行
        if(this.isFlying) {
            this.birdFlying(dt);
        }

        // 小鸟不断下落
        if(this.canDrop) {
            this.birdDrop(dt);
            // 下落到地板
            if(this.node.y - this.node.width / 2 - 4 <= this.y_land + this.height_land / 2) {
                // 小鸟不再运动和扇动翅膀
                this.node.y = this.y_land + this.height_land / 2 + this.node.width / 2 - 4; // -4->微调位置
                if(!!this.component_bird_animation) {
                    this.component_bird_animation.stop();
                }
                // 小鸟头部未完全朝下则旋转（5倍旋转速度）
                if(this.node.angle > -90) {
                    this.node.runAction(cc.rotateTo(((this.node.angle + 90) / (this.speed_angle_bird_drop * 5)), 90));
                }
                // 游戏结束
                let component_mainLogic = cc.find("Canvas").getComponent("game_mainLogic");
                component_mainLogic.game_over();
            }
        }

    },

    // 小鸟飞行函数
    birdFlying: function(time) {
        // 匀速运动
        this.node.y += this.speed_bird_fly_y * time;
        // 向上飞
        if(this.node.y <= this.high_min_bird_fly) {
            this.node.y = this.high_min_bird_fly;
            this.speed_bird_fly_y = Math.abs(this.speed_bird_fly_y);
        }
        // 向下飞
        if(this.node.y >= this.high_max_bird_fly) {
            this.node.y = this.high_max_bird_fly;
            this.speed_bird_fly_y = -Math.abs(this.speed_bird_fly_y);
        }
    },

    // 小鸟下落函数
    birdDrop: function(time) {
        // 竖直下抛运动
        this.node.y += this.speed_bird_drop * time + 0.5 * this.acceleration_bird_drop * time * time;
        this.speed_bird_drop += this.acceleration_bird_drop * time;
        // 小鸟头部向下
        if(this.node.angle > -45) {
            this.node.angle -= this.speed_angle_bird_drop * time;
        } else if(this.node.angle > -90 ) { // 加快头部朝下（2.5倍旋转速度）
            this.node.angle -= this.speed_angle_bird_drop * time * 2.5;
        } else {
            // 小鸟头部角度为-90时，停止翅膀扇动
            this.node.angle = -90;
            if(!!this.component_bird_animation) {
                this.component_bird_animation.pause();
            }
        }
    },

    // 小鸟飞跃函数
    birdJump: function() {
        // 赋予小鸟一个竖直向上的初速度，从而实现飞跃
        this.speed_bird_drop = this.speed_bird_jump;
        // 小鸟头部朝上
        this.node.angle = this.angle_bird_jump;
        // 恢复翅膀扇动
        if(!!this.component_bird_animation) {
            this.component_bird_animation.resume();
        }
    },

    // 小鸟运动开始函数
    bird_action_start: function() {
        this.isFlying = false;
        this.canDrop = true;
    },

    // 小鸟运动暂停函数
    bird_action_pause: function() {
        this.isFlying = false;
        this.canDrop = false;
    },

    // 小鸟运动继续函数
    bird_action_resume: function() {
        this.isFlying = false;
        this.canDrop = true;
    },

    // 小鸟运动结束函数
    bird_action_stop: function() {
        this.isFlying = true;
        this.canDrop = false;
    },

});
