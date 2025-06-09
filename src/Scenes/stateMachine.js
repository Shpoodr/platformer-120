class State{
    constructor(name){
        this.name = name;
}
    enter(player, keys, scene, stateMachine){}
    execute(player, keys, scene, stateMachine){}
    exit(player, keys, scene, stateMachine){}
}

class IdleState extends State{
    constructor(){
        super("idle");
    }
    enter(player, keys, scene, stateMachine){
        console.log("idle State")
        super.enter(player, stateMachine);
        player.setVelocityX(0);
        player.setAccelerationX(0);
        player.anims.play('idleAnim', true);
    }
    execute(player, keys, scene, stateMachine){
        super.execute(player, keys, scene, stateMachine);
        if(!player || !player.body || !keys || !scene) return;

        const onGround = player.body.blocked.down;

//transition to jump
        if(Phaser.Input.Keyboard.JustDown(keys.space) && onGround){
            player.setVelocityY(scene.JUMP_VELOCITY);
            scene.playerJumps = 1;
            scene.sound.play('jumpAudio', {volume: 0.5});
            let jumpEffect = scene.add.sprite(player.x, player.y, 'jumping_particles');
            jumpEffect.setDepth(player.depth - 1);
            jumpEffect.play('jumpParticle');
            jumpEffect.on('animationcomplete-jumpParticle', () => {
                jumpEffect.destroy();
            })
            stateMachine.changeState('jump');
            return;
        }
//transition to walk
        if(keys.left.isDown || keys.right.isDown){
            stateMachine.changeState('walk');
            return;
        }
        
    }
    exit(player, keys, scene, stateMachine){
        super.exit(player, keys, scene, stateMachine);
        console.log("exit idle state");
    }
}

class WalkState extends State{
    constructor(){
        super("walk");
    }
    enter(player, keys, scene, stateMachine){
        super.enter(player, keys, scene, stateMachine);
        console.log("walk state");
        player.anims.play('walkAnim', true);
        if(scene.walkingParticlesSprite){
            scene.walkingParticlesSprite
                .setActive(true)
                .setVisible(true)
                .setPosition(player.x, player.body.bottom + 20)
                .play('walkParticle');
        }
    }
    execute(player, keys, scene, stateMachine){
        super.execute(player, keys, scene, stateMachine);
        const onGround = player.body.blocked.down;
        if(scene.walkingParticlesSprite && scene.walkingParticlesSprite.visible){
            scene.walkingParticlesSprite.setPosition(player.x, player.body.bottom + 20);
            scene.walkingParticlesSprite.setFlipX(player.flipX);
        }

//transition to jump
        if(Phaser.Input.Keyboard.JustDown(keys.space) && onGround){
            player.setVelocityY(scene.JUMP_VELOCITY);
            scene.playerJumps = 1;
            scene.sound.play('jumpAudio', {volume: 0.5});
            let jumpEffect = scene.add.sprite(player.x, player.y, 'jumping_particles');
            jumpEffect.setDepth(player.depth - 1);
            jumpEffect.play('jumpParticle');
            jumpEffect.on('animationcomplete-jumpParticle', () => {
                jumpEffect.destroy();
            })
            stateMachine.changeState('jump');
            return;
        }
//transition to falling (jump state)
        if(!onGround && player.body.velocity.y >= 0){
            stateMachine.changeState('jump');
        }
//transition to dash
//
//
//

//horizontal movement handling
        if(onGround){
            if(keys.left.isDown){
                player.setVelocityX(-scene.WALK_SPEED);
                player.setFlipX(true);
                player.setAccelerationX(0);
            }else if(keys.right.isDown){
                player.setVelocityX(scene.WALK_SPEED);
                player.setFlipX(false);
                player.setAccelerationX(0);
            }else{
                player.setVelocityX(0);
                player.setAccelerationX(0);
                stateMachine.changeState('idle');
                return;
            }
        }else{
            if(keys.left.isDown){
                player.setAccelerationX(-scene.ACCELERATION);
                player.setFlipX(true);
            }else if(keys.right.isDown){
                player.setAccelerationX(scene.ACCELERATION);
                player.setFlipX(false);
            }else player.setAccelerationX(0);
        }
    }
    exit(player, keys, scene, stateMachine){
        super.exit(player, keys, scene, stateMachine);
        if(player && player.body){
            player.setAccelerationX(0);
        }
        if(scene.walkingParticlesSprite){
            scene.walkingParticlesSprite.stop();
            scene.walkingParticlesSprite.setVisible(false).setActive(false);
        }
    }
}

class JumpState extends State{
    constructor(){
        super("jump");
        this.framesInJumpState = 0;
        this.jumpGraceFrames = 2;
        this.hasSwitchedToFallAnim = false;
        this.isLanding = false;
    }
    enter(player, keys, scene, stateMachine){
        super.enter(player, keys, scene, stateMachine);
        console.log('enter jump state');
        player.anims.play('jumpAnim', true);
        this.framesInJumpState = 0;
        this.hasSwitchedToFallAnim = false;
        this.isLanding = false;

    }
    execute(player, keys, scene, stateMachine){
        super.execute(player, keys, scene, stateMachine);

        const actuallyOnFloor = player.body.onFloor();
        this.framesInJumpState++;

        if(this.framesInJumpState > this.jumpGraceFrames && actuallyOnFloor){
            //handle landing animation and particles and sounds later
            //
            //
            this.isLanding = true;
            player.anims.play('landAnim', true);
            player.setVelocityX(0);
            player.setAccelerationX(0);

            scene.playerJumps = 0;
            let landEffect = scene.add.sprite(player.x, player.y + 10, 'landing_particles').setScale(0.5);
            landEffect.setDepth(player.depth - 1);
            landEffect.play('landParticle');
            landEffect.on('animationcomplete-landParticle', () =>{
                landEffect.destroy();
            })
            player.once('animationcomplete-landAnim', () =>{
                if(this.isLanding){
                    stateMachine.changeState(keys.left.isDown || keys.right.isDown ? 'walk' : 'idle');
                }
            });
            return;
        }
        if(Phaser.Input.Keyboard.JustDown(keys.space) && scene.playerJumps < scene.MAX_JUMPS){
            player.setVelocityY(scene.JUMP_VELOCITY);
            scene.sound.play('jumpAudio', {volume: 0.5});
            scene.playerJumps++;
            player.anims.play('jumpAnim', true);
            this.hasSwitchedToFallAnim = false;
            let jumpEffect = scene.add.sprite(player.x, player.y, 'jumping_particles');
            jumpEffect.setDepth(player.depth - 1);
            jumpEffect.play('jumpParticle');
            jumpEffect.on('animationcomplete-jumpParticle', () => {
                jumpEffect.destroy();
            })
            this.framesInJumpState = 0;
        }

        if(!actuallyOnFloor){
            const touchingLeftWall = player.body.blocked.left;
            const touchingRightWall = player.body.blocked.right;
            const pressingLeft = keys.left.isDown;
            const pressingRight = keys.right.isDown;

            if((touchingLeftWall && pressingLeft && !keys.right.isDown) || (touchingRightWall && pressingRight && !keys.left.isDown)){
                if(player.body.velocity.y >= -50){
                    stateMachine.changeState('wallSlide');
                    return;
                }
            }
        }

//animation control based on velocity
        if(player.body.velocity.y > 50 && !this.hasSwitchedToFallAnim){
            player.anims.play('fallAnim', true);
            this.hasSwitchedToFallAnim = true;
        }else if(player.body.velocity.y <= 0 && this.hasSwitchedToFallAnim){
            player.anims.play('jumpAnim', true);
            this.hasSwitchedToFallAnim = false;
        }
        if(keys.left.isDown){
            player.setAccelerationX(-scene.AIR_ACCELERATION);
            player.setFlipX(true);
        }else if(keys.right.isDown){
            player.setAccelerationX(scene.AIR_ACCELERATION);
            player.setFlipX(false);
        }else player.setAccelerationX(0);
    }
    exit(player, keys, scene, stateMachine){
        super.exit(player, keys, scene, stateMachine);
        if(player && player.body){
            player.setAccelerationX(0);
        }
        this.justJumped = false;
    }
}

class DashState extends State{
    constructor(){
        super("dash");
    }
    enter(player, keys, scene, stateMachine){

    }
    execute(player, keys, scene, stateMachine){

    }
    exit(player, keys, scene, stateMachine){
        
    }
}

class WallSlideState extends State{
    constructor(){
        super("wallSlide");
        this.onWallDirection = null;
        this.framesInWallSlide = 0;
        this.minWallSlideFrames = 3;
    }
    enter(player, keys, scene, stateMachine){
        super.enter(player, keys, scene, stateMachine);
        console.log("wallSlide state");
        player.anims.play('crouchAnim', true);
        this.framesInWallSlide = 0;

        if(player.body.blocked.left){
            this.onWallDirection = 'left';
            player.setAngle(90);
        }else if(player.body.blocked.right){
            this.onWallDirection = 'right';
            player.setAngle(-90);
        }else{
            console.warn("WallSlideState: Enter without a wall contact!");
            stateMachine.changeState('jump');
            return;
        }
        player.setVelocityY(scene.WALL_SLIDE_SPEED_Y);
        player.setVelocityX(0);
    }
    execute(player, keys, scene, stateMachine){
        super.execute(player, keys, scene, stateMachine);
        this.framesInWallSlide++;
        if(player.body.velocity.y > scene.WALL_SLIDE_SPEED_Y){
            player.setVelocityY(scene.WALL_SLIDE_SPEED_Y);
        }
        if(player.body.velocity.x != 0 && !Phaser.Input.Keyboard.JustDown(keys.space) && !((this.onWallDirection == 'left' && keys.right.isDown) || (this.onWallDirection == 'right' && keys.left.isDown))){
            player.setVelocityX(0);
        }
        if(Phaser.Input.Keyboard.JustDown(keys.space)){
            let wallJumpPushDirection = (this.onWallDirection == 'right') ? -1 : 1;
            scene.playerJumps = 0;
            scene.sound.play('jumpAudio', {volume: 0.5});
            player.setAngle(0);
            player.setVelocityY(scene.WALL_JUMP_VELOCITY_Y);
            player.setVelocityX(scene.WALL_JUMP_VELOCITY_X * wallJumpPushDirection);
            scene.playerJumps = 1;
            player.setFlipX(wallJumpPushDirection < 0);
            stateMachine.changeState('jump');
            return;
        }
        if(this.framesInWallSlide > this.minWallSlideFrames){
            const onWall = this.onWallDirection;
            let stillOnCorrectWall = (onWall == 'left' && (player.body.blocked.left || player.body.touching.left)) || (onWall == 'right' && (player.body.blocked.right || player.body.touching.right));
            let isPressingIntoWall = false;
            if(this.onWallDirection == 'left' && keys.left.isDown && !keys.right.isDown){
                isPressingIntoWall = true;
            }else if(this.onWallDirection == 'right' && keys.right.isDown && !keys.left.isDown){
                isPressingIntoWall = true;
            }
           
            if(!isPressingIntoWall){
                player.setAngle(0);
                console.log("hi");
                stateMachine.changeState('jump');
                return;
            }
            if(player.body.onFloor()){
                player.setAngle(0);
                let landEffect = scene.add.sprite(player.x, player.y + 10, 'landing_particles').setScale(0.5);
                landEffect.setDepth(player.depth - 1);
                landEffect.play('landParticle');
                landEffect.on('animationcomplete-landParticle', () =>{
                landEffect.destroy();
            })
                scene.playerJumps = 0;
                stateMachine.changeState(keys.left.isDown || keys.right.isDown ? 'walk' : 'idle');
                return;
            }
        }
    }
    exit(player, keys, scene, stateMachine){
        super.exit(player, keys, scene, stateMachine);
        player.setAngle(0);
        this.onWallDirection = null;
    }
}

class PlayerHitState extends State{
    constructor(){
        super("hit");
        this.knockbackDuration = 300;
        this.invincibilityDuration = 1500;
    }
    enter(player, keys, scene, stateMachine, data){
        super.enter(player, keys, scene, stateMachine, data);
        player.anims.play('player_hurt_anim', true);

        const knockbackPowerX = 200;
        const knockbackPowerY = -300;
        let knockbackDirection = 1;

        if(data && data.from && data.from.x > player.x){
            knockbackDirection = -1
        }

        player.setVelocity(knockbackPowerX * knockbackDirection, knockbackPowerY);
        player.setAccelerationX(0);

        player.isInvincible = true;
        scene.tweens.add({
            targets: player,
            alpha: 0.5,
            duration: 100,
            repeat: Math.floor(this.invincibilityDuration / 100),
            yoyo: true,
            onComplete: () =>{
                player.setAlpha(1);
            }
        });
        scene.time.delayedCall(this.knockbackDuration, () =>{
            if(stateMachine.currentState == this){
                stateMachine.changeState('jump');
            }
        });
        scene.time.delayedCall(this.invincibilityDuration, () => {
            if(scene){
                player.isInvincible = false;
            }
        });
    }
    execute(){

    }
}

class PlayerStateMachine{
    constructor(player, scene){
        this.player = player;
        this.scene = scene;
        this.states = {
            idle: new IdleState(),
            walk: new WalkState(),
            jump: new JumpState(),
            dash: new DashState(),
            wallSlide: new WallSlideState(),
            hit: new PlayerHitState()
        };
    }
    initialize(initialState){
        this.currentState = initialState;
        if(this.currentState && this.currentState.enter){
            this.currentState.enter(this.player, this.scene.keys, this.scene, this, {});
        }

    }
    changeState(newStateKey, data = {}){
        const newState = this.states[newStateKey];
        if(!newState || this.currentState == newState) { 
            return;
        }
        if(this.currentState && this.currentState.exit){
            this.currentState.exit(this.player, this.scene.keys, this.scene, this);
        }
        this.currentState = newState;
        if(this.currentState && this.currentState.enter){
            this.currentState.enter(this.player, this.scene.keys, this.scene, this, data);
        }
    }
    update(inputs){
        if(this.currentState && this.currentState.execute){
            this.currentState.execute(this.player, inputs, this.scene, this);
        }
    }
}