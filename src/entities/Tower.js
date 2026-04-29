export default class Tower extends Phaser.GameObjects.Sprite {
    constructor(scene, stats) {
        super(scene, 0, 0, stats[0]);
        this.scene = scene;

        // Tower stats: [name, damage, range, attackSpeed]
        [this.name, this.damage, this.range, this.attackSpeed] = stats;
        this.attackDelay = this.attackSpeed * 1000;

        this.pedestal = scene.add.image(0, 0, 'Pedestal').setDepth(9);
        this.projectiles = scene.add.group();

        // Attack timing/state control 
        this.timeSinceLastAttack = this.attackDelay;  // Set to delay so it can attack immediately
        this.isAttacking = false;
        this.damageDealt = false;

        scene.add.existing(this);
        // Scale towers (Kitsune is 82x81, Promachus is 64x64, Satyr is 64x75, others are standard)
        const scale = this.name === 'Promachus' ? 1 : (this.name === 'Kitsune' ? 0.9 : (this.name === 'Izanami' ? 2 : (this.name === 'Susanoo' ? 2 : 0.9)));
        this.setDepth(10).setScale(scale).play(`${this.name}_idle`);

        // Reset tower after attack animation finishes
        this.on('animationcomplete', ({ key }) => {
            if (key === `${this.name}_attack`) {
                this.isAttacking = false;
                this.damageDealt = false;
                this.play(`${this.name}_idle`);
            }
        });
    }

    place(x, y) {
        const cx = x + 32, cy = y + 32;
        this.setPosition(cx, cy - 20);
        this.pedestal.setPosition(cx, cy);

        // Reset attack cooldown when placed - set to delay so it can attack on first update
        this.timeSinceLastAttack = this.attackDelay;
    }

    update(time, delta) {
        if (!this.active) return;
        const enemy = this.getClosestEnemy();

        // Scale delta by game speed multiplier
        const gameSpeedScale = this.scene.timeManager?.getScale() || 1;
        const scaledDelta = delta * gameSpeedScale;
        this.timeSinceLastAttack += scaledDelta;

        // Start attack if cooldown is ready AND enemy in range
        if (enemy && this.timeSinceLastAttack >= this.attackDelay && !this.isAttacking) {
            this.fire(enemy);
            this.timeSinceLastAttack = 0;
        }

        // Direct-damage towers (non-projectile) - only if enemy exists
        if (this.isAttacking && enemy && !this.damageDealt && this.name !== 'Susanoo' && this.name !== 'Promachus' && this.name !== 'Kitsune' && this.name !== 'Satyr') {
            enemy.takeDamage(this.damage);
            this.damageDealt = true;
        }

        // Update all active projectiles
        this.projectiles.children.each(p => p.active && this.updateProjectile(p, delta));
    }

    getClosestEnemy() {
        const enemies = this.scene.enemyManager?.activeEnemies?.getChildren();
        if (!enemies?.length) return null;
        let closest = null, minDist = this.range * 64;

        for (const e of enemies) {
            if (!e.active) continue;
            const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
            if (d < minDist) (minDist = d, closest = e);
        }
        return closest;
    }

    fire(enemy) {
        this.isAttacking = true;
        this.damageDealt = false;
        this.play(`${this.name}_attack`);
        this.scene.audioManager?.playTowerAttack();
        
        // Projectile attacks (Susanoo, Promachus, Kitsune, and Satyr)
        if (this.name === 'Susanoo' || this.name === 'Promachus' || this.name === 'Kitsune' || this.name === 'Satyr') this.fireProjectile(enemy);
    }

    fireProjectile(target) {
        if (!target) return; // No target for projectile attack
        let spriteKey, animKey, speed, scale;
        
        if (this.name === 'Susanoo') {
            spriteKey = 'Susanoo_Stripe';
            animKey = 'Susanoo_Stripe_projectile';
            speed = 300;
            scale = 1.5;
        } else if (this.name === 'Promachus') {
            spriteKey = 'Promachus_fire';
            animKey = 'Promachus_fire_projectile';
            speed = 400;
            scale = 4.5;
        } else if (this.name === 'Kitsune') {
            spriteKey = 'Kitsune_charge';
            animKey = 'Kitsune_charge_projectile';
            speed = 350;
            scale = 3.5;
        } else if (this.name === 'Satyr') {
            spriteKey = 'Satyr_leaf';
            animKey = 'Satyr_leaf_projectile';
            speed = 300;
            scale = 3.5;
        } else {
            return;
        }
        
        const p = this.scene.add.sprite(this.x, this.y, spriteKey)
            .setDepth(5).setScale(scale).play(animKey);
        Object.assign(p, {
            targetEnemy: target,
            speed,
            hasHit: false
        });
        this.projectiles.add(p);
    }

    updateProjectile(p, delta) {
        const t = p.targetEnemy;

        // Remove projectile if target is gone
        if (!t?.active) return p.destroy();

        const angle = Phaser.Math.Angle.Between(p.x, p.y, t.x, t.y);
        const move = p.speed * (delta / 1000);

        p.x += Math.cos(angle) * move;
        p.y += Math.sin(angle) * move;
        p.rotation = angle;

        // Collision check with enemy
        if (!p.hasHit && Phaser.Math.Distance.Between(p.x, p.y, t.x, t.y) < 20) {
            p.hasHit = true;
            t.takeDamage(this.damage);
            return p.destroy();
        }

        // Cleanup if projectile leaves screen
        const { width, height } = this.scene.scale;
        if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
            p.destroy();
        }
    }

    destroy(fromScene) {
        if (this._destroyed) return;
        this._destroyed = true;
        this.pedestal?.destroy();
        this.projectiles?.clear(true, true);
        super.destroy(fromScene);
    }
}