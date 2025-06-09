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
        this.fireCooldown = 400;
        this.lastFired = 0;

        this.WALL_SLIDE_SPEED_Y = 80;
        this.WALL_JUMP_VELOCITY_Y = -550;
        this.WALL_JUMP_VELOCITY_X = 300;

        this.playerJumps = 0;
        this.MAX_JUMPS = 2;
        this.gameWon = false;

        this.score = 0;
        this.pointValue = 100;
    }
    create(){
        this.input.on('pointerdown', (pointer) => {
        // We use pointer.worldX and pointer.worldY to get the coordinates
        // within the game world, which correctly accounts for camera scrolling and zoom.
            const worldX = Math.floor(pointer.worldX);
            const worldY = Math.floor(pointer.worldY);

            console.log(`Pointer clicked at World Coords: x: ${worldX}, y: ${worldY}`);
        });
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
//score
        this.scoreText = this.add.text(370, 260, `Score: ${this.score}`,{
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(100);
//spawning the player sprite in adding a health component
        const playerSpawnX = 150;
        const playerSpawnY = 600;
        this.player = this.physics.add.sprite(playerSpawnX, playerSpawnY, 'characterIdleSheet');
        this.player.maxHealth = 100;
        this.player.health = this.player.maxHealth;
        this.player.isInvincible = false;
        this.player.setDragX(this.DRAG);
        this.player.body.setMaxVelocityX(this.MAX_AIR_SPEED_X);
        this.player.body.setSize(28, 25);
        this.player.body.setOffset(22, 20);
//player health bar handling
        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setScrollFactor(0);
        this.playerHealthBar.setDepth(100);
        this.updatePlayerHealthBar();
//spawning in enemies
        this.enemies = this.physics.add.group();
        const enemySpawnPoints = [
            {type: 'thrower', x: 60, y:205, texture: 'tnt_guy_sheet'},
            {type: 'thrower', x: 825, y:80, texture: 'tnt_guy_sheet'},
            {type: 'thrower', x: 1560, y:475, texture: 'tnt_guy_sheet'},
            {type: 'chaser', x: 1370, y:715, texture: 'torch_guy_sheet'},
            {type: 'chaser', x: 1200, y:715, texture: 'torch_guy_sheet'},
            {type: 'chaser', x: 1650, y:280, texture: 'torch_guy_sheet'},
            {type: 'chaser', x: 2250, y:215, texture: 'torch_guy_sheet'},
            {type: 'chaser', x: 3395, y:750, texture: 'torch_guy_sheet'},
            {type: 'chaser', x: 3470, y:750, texture: 'torch_guy_sheet'},
            {type: 'chaser', x: 300, y:600, texture: 'torch_guy_sheet'}
        ];
        enemySpawnPoints.forEach(spawnPoint => {
            let enemy;
            if(spawnPoint.type == 'chaser'){
                enemy = new chasingEnemy(this, spawnPoint.x, spawnPoint.y, spawnPoint.texture);
            }else if(spawnPoint.type == 'thrower'){
                enemy = new ThrowerEnemy(this, spawnPoint.x, spawnPoint.y, spawnPoint.texture);
            }
            if(enemy){
                this.enemies.add(enemy);
            }
        })
//handling enemy collision stuff
        this.enemyHitboxes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.enemyProjectiles = this.physics.add.group({

        })
        this.physics.add.collider(this.enemies, this.groundLayer);
        this.physics.add.overlap(this.player, this.enemyHitboxes, this.handlePlayerDamageFromWeapon, null, this);
        this.physics.add.overlap(this.player, this.enemyProjectiles, this.handlePlayerHitByProjectile, null, this);
        this.physics.add.collider(this.enemyProjectiles, this.groundLayer, this.handleProjectilesHitGround, null, this);
//handling player projectile collision
        this.playerProjectiles = this.physics.add.group({
            allowGravity: false
        });
        this.playerProjectiles.setAccelerationX = 0;
        this.physics.add.overlap(this.playerProjectiles, this.enemies, this.handleProjectileHitEnemy, null, this);
        this.physics.add.collider(this.playerProjectiles, this.groundLayer);
//initializing collision and animation
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) =>{
            this.sound.play('coinAudio', { volume: 0.5});
            obj2.destroy();
            this.score += this.pointValue;
            this.scoreText.setText(`Score: ${this.score}`)
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
            r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
        };

//create walking particles
        this.walkingParticlesSprite = this.add.sprite(this.player.x, this.player.y, 'walking_particles')
            .setOrigin(0.5, 1)
            .setDepth(this.player.depth - 1)
            .setVisible(false)
            .setActive(false);


    }
    handlePlayerDamage(damageAmount, damageSource){
        if(this.player.isInvincible) return;
        this.player.health -= damageAmount;
        this.updatePlayerHealthBar();
        this.playerStateMachine.changeState('hit', {from: damageSource});

        if (this.player.health <= 0){
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            this.add.text(
            centerX,
            centerY,
            'YOU DIED',
            {
                fontFamily: 'Arial', 
                fontSize: '48px',
                fill: '#00ff00',    
                align: 'center',
                backgroundColor: 'rgba(87, 21, 21, 0.7)',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)   
            .setScrollFactor(0)      
            .setDepth(100); 
            this.time.delayedCall(6000, () => {
                this.scene.restart();
            })
        }
    }
    handlePlayerDamageFromWeapon(player, hitbox){
        const owner = hitbox.getData('owner');
        this.handlePlayerDamage(15, owner);
        hitbox.destroy();
    }
    handlePlayerHitByProjectile(player, tnt){
        tnt.destroy();
        player.anims.play('tntAnim', true);
        this.handlePlayerDamage(25, tnt);
    }
    handleProjectilesHitGround(tnt, groundTile){
        tnt.destroy();
        let explosion = this.add.sprite(tnt.x, tnt.y, 'explosion_sheet');
        explosion.play('tntAnim');

        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
    }
    fireSlimeBall(time){
        if(time < this.lastFired + this.fireCooldown) return;

        const direction = this.player.flipX ? -1 : 1;
        const spawnX = this.player.x;
        const spawnY = this.player.y;

        let slimeball = this.playerProjectiles.create(spawnX, spawnY, 'player_bullet');
        slimeball.play('bulletAnim', true);
        slimeball.body.setGravity(500);
        slimeball.body.setBounce(0.8, 0.8);
        slimeball.body.setCollideWorldBounds(true);
        slimeball.setVelocity(400 * direction, 0);
        slimeball.body.setAccelerationX(0);
        this.lastFired = time;

        this.time.delayedCall(6000, () =>{
            if(slimeball){
                slimeball.destroy();
            }
        })
    }
    handleProjectileHitEnemy(projectile, enemy){
        if(enemy.takeDamage){
            enemy.takeDamage(1, projectile);
        }
        projectile.destroy();
    }
    updatePlayerHealthBar(){
        this.playerHealthBar.clear();
        const x = 370;
        const y = 235
        const barWidth = 200;
        const barHeight = 20;

        this.playerHealthBar.fillStyle(0x000000);
        this.playerHealthBar.fillRect(x, y, barWidth, barHeight);

        const healthPercentage = Math.max(0, this.player.health / this.player.maxHealth);
        if(healthPercentage > 0){
            this.playerHealthBar.fillStyle(0xff0000);
            this.playerHealthBar.fillRect(x, y, barWidth * healthPercentage, barHeight);
        }
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
    update(time, delta){
        if(this.gameWon){
            if(Phaser.Input.Keyboard.JustDown(this.keys.r)){
                this.scene.restart();
            }
            return;
        }
        if(!this.gameWon && this.player && this.player.x >= this.endPointX){
            this.triggerWinCondition();
        }

        if(this.player.body.enable && Phaser.Input.Keyboard.JustDown(this.keys.attack)){
            this.fireSlimeBall(time);
        }
        this.playerStateMachine.update(this.keys);
    }
}