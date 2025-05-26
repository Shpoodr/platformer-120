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

        this.playerJumps = 0;
        this.MAX_JUMPS = 2;
        this.gameWon = false;
    }
    create(){
        this.backgroundMusic = this.sound.add('bg_music',{
            loop: true,
            volume: 0.4
        });
        this.backgroundMusic.play();
        this.map = this.make.tilemap({key: 'tileMapKey'});
        const coinTileSet = this.map.addTilesetImage('kennyPacked', 'coinSheet');
        const coinObjectLayer = this.map.getObjectLayer('coins');
        this.tileset = this.map.addTilesetImage('forest-Ground', 'tileSheet');
        this.groundLayer = this.map.createLayer('Tile Layer 1', this.tileset);
        this.groundLayer.setCollisionByProperty({collides: true});
        this.coins = this.map.createFromObjects("coins", {
            name: "coin",
            key: "coinSheet",
            frame: 151
        });
        this.endPointX = this.map.widthInPixels - 50;
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);
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
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) =>{
            this.sound.play('coinAudio', { volume: 0.5});
            obj2.destroy();
        })

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
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        };

//create walking particles
        this.walkingParticlesSprite = this.add.sprite(this.player.x, this.player.y, 'walking_particles')
            .setOrigin(0.5, 1)
            .setDepth(this.player.depth - 1)
            .setVisible(false)
            .setActive(false);
    }
    triggerWinCondition(){
        this.gameWon = true;
        if(this.player && this.player.body){
            this.player.body.setEnable(false);
            this.player.setVelocity(0, 0);
        }       
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2; 
        
        this.add.text(
        centerX,
        centerY,
        'CONGRATULATIONS!\nYOU REACHED THE END!\n\nPress R to Restart',
        {
            fontFamily: 'Arial', 
            fontSize: '48px',
            fill: '#00ff00',    
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 }
        }
    )
    .setOrigin(0.5)   
    .setScrollFactor(0)      
    .setDepth(100);  
    }
    update(){
        if(this.gameWon){
            if(Phaser.Input.Keyboard.JustDown(this.keys.r)){
                this.scene.restart();
            }
            return;
        }

        if(!this.gameWon && this.player && this.player.x >= this.endPointX){
            this.triggerWinCondition();
        }
        this.playerStateMachine.update(this.keys);
    }
}