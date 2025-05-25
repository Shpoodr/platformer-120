class Load extends Phaser.Scene{
    constructor(){
        super("loadScene");
    }
    preload(){
        this.load.setPath("./assets/");
        //loaded tile map from tiled 
        this.load.image('tileSheet', 'TX Tileset Ground.png');
        this.load.tilemapTiledJSON('tileMapKey','forest-Ground.json');
//idle
        this.load.spritesheet('characterIdleSheet', 'player_animations/SLIME PLATFORMER_STRIP_Idle.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//walk
        this.load.spritesheet('characterWalkSheet', 'player_animations/SLIME PLATFORMER_STRIP_Walk.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//jump
        this.load.spritesheet('characterJumpSheet', 'player_animations/SLIME PLATFORMER_STRIP_JumpGround.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//dash
        this.load.spritesheet('characterDashSheet', 'player_animations/SLIME PLATFORMER_STRIP_Roll.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//crouch/wallslide
        this.load.spritesheet('characterCrouchSheet', 'player_animations/SLIME PLATFORMER_STRIP_CrouchWalk.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }
    create(){
//idle animation creation
    this.anims.create({
        key: 'idleAnim',
        frames: this.anims.generateFrameNumbers('characterIdleSheet', {start: 0, end: 7}),
        frameRate: 10,
        repeat: -1
    });
//walk anim
    this.anims.create({
        key: 'walkAnim',
        frames: this.anims.generateFrameNumbers('characterWalkSheet', {start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
    });
//dash anim
     this.anims.create({
        key: 'dashAnim',
        frames: this.anims.generateFrameNumbers('characterDashSheet', {start: 0, end: 8}),
        frameRate: 10,
        repeat: -1
    });
//jump anim
    this.anims.create({
        key: 'jumpAnim',
        frames: this.anims.generateFrameNumbers('characterJumpSheet', {start:0, end: 2}),
        frameRate: 15,
        repeat: 0
    });
//falling anim
    this.anims.create({
        key: 'fallAnim',
        frames: this.anims.generateFrameNumbers('characterJumpSheet', {start:4, end: 5}),
        frameRate: 10,
        repeat: -1
    });
//landing anim
    this.anims.create({
        key: 'landAnim',
        frames: this.anims.generateFrameNumbers('characterJumpSheet', {start:6, end: 8}),
        frameRate: 12,
        repeat: 0
    });
//crouch/wallslide anim
    this.anims.create({
        key: 'crouchAnim',
        frames: this.anims.generateFrameNumbers('characterCrouchSheet', {start: 0, end: 7}),
        frameRate: 10,
        repeat: -1
    });
        this.scene.start('platformerScene');
    }
}