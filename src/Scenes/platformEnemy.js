class Enemy extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.maxHealth = 3;
        this.health = this.maxHealth;
        this.isStunned = false;

        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    updateHealthBar(){
        this.healthBar.clear();
        const barWidth = 40;
        const barHeight = 5;
        const x = this.x - (barWidth / 2);
        const y = this.y - 30;

        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(x, y, barWidth, barHeight);

        const healthPercentage = this.health / this.maxHealth;
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(x, y, barWidth * healthPercentage, barHeight);
    }

    takeDamage(damageAmount, damageSource){
         // Don't take damage if already stunned, dead, or inactive
        if (this.isStunned || !this.body.enable) return;

        this.health -= damageAmount;
        this.updateHealthBar();
        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (this.active) this.clearTint();
        });

       
        this.isStunned = true;

        if (damageSource && this.body) {
            const knockbackPowerX = 150;
            const knockbackPowerY = -150;
            let direction = (damageSource.x > this.x) ? -1 : 1;
            this.setVelocity(knockbackPowerX * direction, knockbackPowerY);
        }
        if (this.health <= 0) {
            
            this.scene.time.delayedCall(100, () => { this.die(); });
        }
    }
    die(){
        this.scene.score += this.scene.pointValue;
        this.scene.scoreText.setText(`Score: ${this.scene.score}`);
        if(this.healthBar) this.healthBar.destroy();
        this.destroy();
    }
    preUpdate(time, delta){
        super.preUpdate(time, delta);
        if(this.healthBar){
            this.updateHealthBar();
        }
        if(this.isStunned){
            if(this.body.onFloor() && Math.abs(this.body.velocity.y) < 5){
                this.isStunned = false;
                this.setVelocityX(0);
            }
            return;
        }
        this.enemyStateMachine.update(time, delta);
    }
}

class EnemyStateMachine{
    constructor(enemy){
        this.enemy = enemy
        this.states = new Map();
        this.currentState = null;
    }
    addState(name, state){this.states.set(name, state)}
    setState(name){
        if(this.currentState && this.currentState.exit){this.currentState.exit();}
        this.currentState = this.states.get(name);
        if(this.currentState && this.currentState.enter){this.currentState.enter();}
    }
    update(time, delta){
        if(this.currentState && this.currentState.execute){
            this.currentState.execute(time, delta);
        }
    }
}

//Chaser Enemy statemachine
class ChaserAttackState{
    constructor(enemy){
        this.enemy = enemy;
        this.scene = enemy.scene;
        this.stateMachine = enemy.enemyStateMachine;
    }
    enter(){
        this.enemy.setVelocityX(0);
        this.enemy.anims.play('torchAttackAnim', true);
        this.scene.time.delayedCall(300, () => {
            if(!this.scene || !this.enemy.body) return;
            const hitboxX = this.enemy.x + (this.enemy.flipX ? -20 : 20);
            const hitboxY = this.enemy.y;

            let hitbox = this.scene.enemyHitboxes.create(hitboxX, hitboxY, null);
            hitbox.setVisible(false).setActive(true);
            hitbox.body.setSize(10, 25);
            hitbox.setData('owner', this.enemy);

            this.scene.time.delayedCall(200, () => {
                hitbox.destroy();
            });
        });

        this.scene.time.delayedCall(600, () => {
            if(this.stateMachine.currentState == this){
                this.stateMachine.setState('chase');
            }
        })
    }
}

class ChaserIdleState{
    constructor(enemy){this.enemy = enemy;}
    enter(){
        this.enemy.anims.play('torchIdleAnim', true);
        this.enemy.setVelocityX(0);
    }
    execute(){
        const player = this.enemy.scene.player;
        if(!player) return;
        const distance = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, player.x, player.y);
        if(distance <= this.enemy.aggroRadius){
            this.enemy.enemyStateMachine.setState('chase');
        }
    }
}

class ChaserChaseState{
    constructor(enemy){
        this.enemy = enemy;
        this.scene = enemy.scene;
        this.stateMachine = enemy.enemyStateMachine;
    }
    enter(){   
        this.enemy.anims.play('torchWalkingAnim', true);
    }
    execute(time, delta){
        const player = this.enemy.scene.player;
        if(!player) return;
    //checking the de aggro
        const distance = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, player.x, player.y);
    //allowing attacking
        if(distance <= this.enemy.attackRange){
            this.stateMachine.setState('attack');
            return;
        }
        if(distance > this.enemy.deaggroRadius){
            this.stateMachine.setState('idle');
            return;
        }
    //setting up basic pathing
        const directionX = Math.sign(player.x - this.enemy.x);
        const onGround = this.enemy.body.onFloor();
        if(onGround){
                const checkX = this.enemy.x + (directionX * (this.enemy.body.width / 2 + 4));
            const checkY = this.enemy.y + (this.enemy.body.height / 2 + 5);
            const tileInFront = this.enemy.scene.groundLayer.getTileAtWorldXY(checkX, checkY);
            const isLedge = (tileInFront == null);
            const isBlocked = (directionX > 0 && this.enemy.body.blocked.right) || 
                            (directionX < 0 && this.enemy.body.blocked.left);
            
            if(isBlocked){
                const canJump = onGround && (time > (this.enemy.lastJumpTime + this.enemy.jumpCooldown));
                if(canJump && player.y < this.enemy.y){
                    this.enemy.setVelocityY(this.enemy.jumpPower);
                    this.scene.time.delayedCall(300, ()=>{this.enemy.setVelocityX(this.enemy.speed * directionX);})
                    this.enemy.lastJumpTime = time;
                }else{
                    this.enemy.setVelocityX(0);
                }
            }else if(isLedge){
                const canJump = onGround && (time > (this.enemy.lastJumpTime + this.enemy.jumpCooldown));
                if(canJump && player.y < this.enemy.y){
                    this.enemy.setVelocityX(this.enemy.speed * directionX);
                    this.enemy.setVelocityY(this.enemy.jumpPower);
                    this.enemy.lastJumpTime = time;
                }else if(canJump && player.y > this.enemy.y){
                    this.enemy.setVelocityX(this.enemy.speed * directionX);
                }
            }else{
                this.enemy.setVelocityX(this.enemy.speed * directionX);
                this.enemy.setFlipX(directionX < 0);
            }
        }


    }
    exit(){

    }
}

class chasingEnemy extends Enemy{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        this.setScale(0.5);
        this.body.setSize(50, 60);
    //chaser properties
        this.speed = 65;
        this.aggroRadius = 250;
        this.deaggroRadius = 400;
        this.attackRange = 30;
    //jump properties
        this.jumpPower = -600;
        this.jumpCooldown = 1500;
        this.lastJumpTime = 0;
    //physics stuff
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.body.setGravityY(1000);
    //setting up stateMachine
        this.enemyStateMachine = new EnemyStateMachine();
        this.enemyStateMachine.addState('idle', new ChaserIdleState(this));
        this.enemyStateMachine.addState('chase', new ChaserChaseState(this));
        this.enemyStateMachine.addState('attack', new ChaserAttackState(this));
        this.enemyStateMachine.setState('idle');
    }
    preUpdate(time, delta){
        super.preUpdate(time, delta);
        this.enemyStateMachine.update(time, delta);
    }
}

//tnt enemy state Machine

class ThrowerIdleState{
    constructor(enemy) {
        this.enemy = enemy;
        this.scene = enemy.scene;
        this.stateMachine = enemy.enemyStateMachine;
    }
    enter(){
        console.log("enter thrower idle");
        this.enemy.anims.play('tntIdleAnim', true);
    }
    execute(time){
        const player = this.scene.player;
        if(!player) return;
        if(player.x < this.enemy.x){
            this.enemy.flipX = true;
        }else{
            this.enemy.flipX = false;
        }
        const distance = Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, player.x, player.y);
        const canAttack = time >= (this.enemy.lastAttackTime + this.enemy.attackCoolDown);
        if(canAttack && distance <= this.enemy.attackRange){
            this.stateMachine.setState('throw');
        }
    }
}

class ThrowerAttackState{
    constructor(enemy){
        this.enemy = enemy;
        this.scene = enemy.scene;
        this.stateMachine = enemy.enemyStateMachine;
    }
    enter(time){
        console.log("enter thrower attack");
        this.enemy.anims.play('tntAttackAnim');
        this.enemy.lastAttackTime = this.scene.time.now;

        this.scene.time.delayedCall(400, () => {
            const player = this.scene.player;
            if(!player || !this.scene || !this.enemy.body) return;
            let tnt = this.scene.enemyProjectiles.create(
                this.enemy.x,
                this.enemy.y -20,
                'tnt_png',
                0
            );
            tnt.body.setAllowGravity(false);
            tnt.body.setSize(12, 25);
            tnt.setScale(0.5);

            const targetX = player.x + (player.body.velocity.x * 0.3);
            const targetY = player.y;
            this.scene.physics.moveTo(tnt, targetX, targetY, 300);
        });
        this.scene.time.delayedCall(this.enemy.attackCooldown, () => {
            if(this.stateMachine.currentState == this){
                this.stateMachine.setState('idle');
            }
        });
    }
}

class ThrowerEnemy extends Enemy{
    constructor(scene,x ,y , texture, frame){
        super(scene,x ,y , texture, frame);
        this.attackRange = 350;
        this.attackCoolDown = 2500;
        this.lastAttackTime = 0;
        this.setScale(0.5);
        this.body.setSize(50, 60);

        this.body.setGravityY(1000).setImmovable(true);

        this.enemyStateMachine = new EnemyStateMachine(this);
        this.enemyStateMachine.addState('idle', new ThrowerIdleState(this));
        this.enemyStateMachine.addState('throw', new ThrowerAttackState(this));
        this.enemyStateMachine.setState('idle');
    }
    preUpdate(time, delta){
        super.preUpdate(time, delta);
        this.enemyStateMachine.update(time, delta);
    }
}