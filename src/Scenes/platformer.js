class Platformer extends Phaser.Scene{
    constructor(){
        super("platformerScene");
    }
    init(){
        this.WALK_SPEED = 250;
        this.ACCELERATION = 400;
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.AIR_ACCELERATION = 2000;
        this.MAX_AIR_SPEED_X = 300;
        this.SCALE = 2.0;

        this.WALL_SLIDE_SPEED_Y = 80;
        this.WALL_JUMP_VELOCITY_Y = -550;
        this.WALL_JUMP_VELOCITY_X = 300;
    }
    create(){
        this.map = this.make.tilemap({key: 'tileMapKey'});
        this.tileset = this.map.addTilesetImage('forest-Ground', 'tileSheet');
        this.groundLayer = this.map.createLayer('Tile Layer 1', this.tileset);
        this.groundLayer.setCollisionByProperty({collides: true});
//spawning the player sprite in
        const playerSpawnX = 150;
        const playerSpawnY = 600;
        this.player = this.physics.add.sprite(playerSpawnX, playerSpawnY, 'characterIdleSheet');
        this.player.setDragX(this.DRAG);
        this.player.body.setMaxVelocityX(this.MAX_AIR_SPEED_X);
        this.player.body.setSize(28, 25);
        this.player.body.setOffset(22, 20);
//initializing collision and animation
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.groundLayer);

//world bounds and Camera
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setRoundPixels(true);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(this.SCALE);

//state Machine set up
        this.playerStateMachine = new PlayerStateMachine(this.player, this);
        this.playerStateMachine.initialize(this.playerStateMachine.states.idle);

//input set up
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };
    }
    update(){
        this.playerStateMachine.update(this.keys);
    }
}