
cc.Class({
    extends: cc.Component,

    properties: {
        // 管道缝隙长度的最小值
        length_min_pipe_gap: 100,
        // 管道缝隙长度的最大值
        length_max_pipe_gap: 150,
        // 管道预制体y值的最小值
        y_min_pipe_prefab: -120,
        // 管道预制体y值的最大值
        y_max_pipe_prefab: 120,
        // 管道移动速度
        speed_pipe_move: 100,
        // 小鸟父节点下的碰撞组件
        component_bird_polygonCollider: {
            type: cc.PolygonCollider,
            default: null,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化
        this._init_();
        // 制作管道
        this.pipeMake();
    },

    // 初始化函数
    _init_: function() {
        // 计算管道缝隙长度（随机值）
        this.length_random_pipe_gap = this.getRandombyRange(this.length_max_pipe_gap, this.length_min_pipe_gap);
        // 计算管道的位置（随机值）
        this.y_radom_pipe_prefab = this.getRandombyRange(this.y_max_pipe_prefab, this.y_min_pipe_prefab);
    },

    // 在区间中获取随机值函数
    getRandombyRange: function(min, max) {
        return Math.floor((max - min) * Math.random()) + min;
    },

    start () {
        // 管道是否可以移动
        this.canMove = true;
        // 管道是否可以让小鸟得分
        this.canAdd = true;
    },

    update (dt) {
        // console.log("dt: " + dt);

        // 管道不断移动
        if(this.canMove) {
            this.pipeMove(dt);
        }

        // 碰撞检测
        if(!!this.component_bird_polygonCollider && !!this.component_pipe_down_polygonCollider && !!this.component_pipe_up_polygonCollider && 
            (cc.Intersection.polygonPolygon(this.component_bird_polygonCollider.world.points, this.component_pipe_down_polygonCollider.world.points) || 
            cc.Intersection.polygonPolygon(this.component_bird_polygonCollider.world.points, this.component_pipe_up_polygonCollider.world.points))) {
                // console.log("The bird is dead !");
                this.component_bird_polygonCollider = null;
                // 游戏暂停
                let component_mainLogic = cc.find("Canvas").getComponent("game_mainLogic");
                component_mainLogic.game_pause(false);
        }

        // 小鸟穿过管道缝隙则加分
        if(this.canAdd && !!this.component_bird_polygonCollider && 
            this.node.x + this.node.width / 2 <= this.component_bird_polygonCollider.node.x - this.component_bird_polygonCollider.node.width / 2) {
                // 管道不可再让小鸟得分
                this.canAdd = false;
                // 小鸟得分
                let component_mainLogic = cc.find("Canvas").getComponent("game_mainLogic");
                component_mainLogic.addScore();
        }
    },

    // 管道制作函数
    pipeMake: function() {
        // 获取管道的上下部分
        this.child_pipe_down = this.node.getChildByName("pipe_down");
        this.child_pipe_up = this.node.getChildByName("pipe_up");
        // 设置管道缝隙长度
        this.child_pipe_down.y = this.length_random_pipe_gap / 2;
        this.child_pipe_up.y = -(this.length_random_pipe_gap / 2);
        // 设置管道的位置
        this.node.x = cc.winSize.width * 0.5 + 100;
        this.node.y = this.y_radom_pipe_prefab;
        // 管道碰撞组件
        this.component_pipe_down_polygonCollider = this.child_pipe_down.getComponent(cc.PolygonCollider);
        this.component_pipe_up_polygonCollider = this.child_pipe_up.getComponent(cc.PolygonCollider);
    },

    // 管道移动函数
    pipeMove: function(time) {
        // 向左匀速移动
        this.node.x -= this.speed_pipe_move * time;
        // 超出界外后移除
        if(this.node.x < -(cc.winSize.width * 0.5 + 100)) {
            // console.log("remove pipe from " + this.node.parent.name);
            this.node.removeFromParent();
        }
    },

    // 管道运动暂停函数
    pipe_action_pause: function() {
        this.canMove = false;
    },

    // 管道运动继续函数
    pipe_action_resume: function() {
        this.canMove = true;
    },

});
