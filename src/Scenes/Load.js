class Load extends Phaser.Scene{
    constructor(){
        super("loadScene");
    }
    preload(){
        this.load.setPath("./assets/");
        //loading background
        //loaded tile map from tiled 
        this.load.image('tileSheet', 'TX Tileset Ground.png');
        this.load.spritesheet('coinSheet', 'tilemap_packed.png', {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.tilemapTiledJSON('tileMapKey','forest-Ground.json');
//audio loading
        this.load.audio('bg_music', 'soundEffects/jungle-ish-beat-for-video-games-314073.mp3');
        this.load.audio('jumpAudio', 'soundEffects/jump.wav');
        this.load.audio('coinAudio', 'soundEffects/coin.wav');

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
//player hit animation
        this.load.spritesheet('characterHitSheet', 'player_animations/SLIME PLATFORMER_STRIP_HurtB.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//enemy tnt png
        this.load.spritesheet('tnt_png', 'enemy_animations/Dynamite.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//Start Loading particles
//walking particle
        this.load.spritesheet('walking_particles', 'particles/SmokeFX Lite SpriteSheet 2A-1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//jumping particles
        this.load.spritesheet('jumping_particles', 'particles/SmokeFX Lite SpriteSheet 3A-5.png', {
            frameWidth: 64,
            frameHeight: 64
        });
//landing Particles
        this.load.spritesheet('landing_particles', 'particles/SmokeFX Lite SpriteSheet 4A-1.png', {
            frameWidth: 252,
            frameHeight: 61
        });
//enemy animations
//torch guy
        this.load.spritesheet('torch_guy_sheet', 'enemy_animations/Torch_Purple.png', {
            frameWidth: 192,
            frameHeight: 192
        });
//tnt guy
        this.load.spritesheet('tnt_guy_sheet', 'enemy_animations/TNT_Red.png',{
            frameWidth: 192,
            frameHeight: 192
        });
//player bullet
        this.load.spritesheet('player_bullet', 'player_animations/bolt1_strip.png', {
            frameWidth: 10,
            frameHeight: 10
        });
        this.load.spritesheet('explosion_sheet', 'particles/789.png',{
            frameWidth: 64,
            frameHeight: 64
        });

    }
    create(){
    //bullet animation
        this.anims.create({
            key:'bulletAnim',
            frames: this.anims.generateFrameNumbers('player_bullet', {start: 0, end: 1}),
            frameRate: 10,
            repeat: -1
        });
    //tnt explosion animation
        this.anims.create({
            key: 'tntAnim',
            frames: this.anims.generateFrameNumbers('explosion_sheet', {start: 3, end: 7}),
            frameRate: 15,
            repeat: 0
        });
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
    //player hit anim
        this.anims.create({
            key: 'hitAnim',
            frames: this.anims.generateFrameNumbers('characterHitSheet', {start: 0, end: 1}),
            frameRate: 10,
            repeat: 0
        });
    //walking Particles anim
        this.anims.create({
            key: 'walkParticle',
            frames: this.anims.generateFrameNumbers('walking_particles', {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        });
    //jumping Particle anim
        this.anims.create({
            key: 'jumpParticle',
            frames: this.anims.generateFrameNumbers('jumping_particles', {start: 0, end: 5}),
            frameRate: 15,
            repeat: 0
        });
    //landing particle anim
        this.anims.create({
            key: 'landParticle',
            frames: this.anims.generateFrameNumbers('landing_particles', {start: 4, end: 10}),
            frameRate: 30,
            repeat: 0
        });
    //enemy torch idle
        this.anims.create({
            key: 'torchIdleAnim',
            frames: this.anims.generateFrameNumbers('torch_guy_sheet', {start: 0, end: 6}),
            frameRate: 10,
            repeat: -1
        });
    //enemy torch walking
        this.anims.create({
            key: 'torchWalkingAnim',
            frames: this.anims.generateFrameNumbers('torch_guy_sheet', {start: 7, end: 12}),
            frameRate: 10,
            repeat: -1
        });
    //enemy torch attack
        this.anims.create({
            key: 'torchAttackAnim',
            frames: this.anims.generateFrameNumbers('torch_guy_sheet', {start: 13, end: 18}),
            frameRate: 10,
            repeat: 0
        });
    //enemy tnt idle
        this.anims.create({
            key: 'tntIdleAnim',
            frames: this.anims.generateFrameNumbers('tnt_guy_sheet', {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        });
    //enemy tnt walking
        this.anims.create({
            key: 'tntWalkingAnim',
            frames: this.anims.generateFrameNumbers('tnt_guy_sheet', {start: 6, end: 11}),
            frameRate: 10,
            repeat: -1
        });
    //enemy tnt throw
        this.anims.create({
            key: 'tntAttackAnim',
            frames: this.anims.generateFrameNumbers('tnt_guy_sheet', {start: 12, end: 18}),
            frameRate: 10,
            repeat: 0
        });
            this.scene.start('platformerScene');
    }
}