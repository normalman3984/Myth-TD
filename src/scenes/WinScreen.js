import SaveManager from '../managers/SaveManager.js';
import AchievementManager from '../managers/AchievementManager.js';
import ProgressManager from '../managers/ProgressManager.js';
import StatsManager from '../managers/StatsManager.js';

export default class WinScreen extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScreen' });
    }

    // Build the victory screen UI
    create(data = {}) {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0e27).setDepth(-1);
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1f42)
            .setDepth(-1).setAlpha(0.5);
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000)
            .setDepth(2999).setAlpha(0.85);  

        // Extract data from level completion
        const levelNumber = data.levelId ?? 1;
        const passTime = data.passTime ?? 0;
        const gainGold = data.gainGold ?? 0;
        const spentGold = data.spentGold ?? 0;
        const playerHealth = data.playerHealth ?? 0;


        AchievementManager.check({
            type: 'Win',
            time: passTime,
            gainedGold: gainGold,
            usedGold: spentGold,
            pHealth: playerHealth
        });

        ProgressManager.completeLevel(levelNumber);
        StatsManager.incTotalGold(gainGold);
        StatsManager.incGoldSpent(spentGold);

        const title = this.add.text(width / 2, height / 2 - 150, 'VICTORY!', {
            fontSize: '96px',
            fill: '#FFD700',               
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#FFA500',              
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(3000);

        this.tweens.add({
            targets: title,
            y: height / 2 - 140,
            duration: 600,
            ease: 'Elastic.easeOut'
        });

        this.add.text(width / 2, height / 2 - 70, `LEVEL ${levelNumber} COMPLETE!`, {
            fontSize: '32px',
            fill: '#90EE90',                
            fontFamily: 'Arial',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(3000);

        const timeBox = this.add.container(width / 2, height / 2 + 10);
        const bg = this.add.rectangle(0, 0, 400, 80, 0x1a1f42)
            .setStrokeStyle(3, 0xFFD700);

        const label = this.add.text(-150, -10, 'TIME PASSED:', {
            fontSize: '20px',
            fill: '#9ca3af',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });

        const value = this.add.text(80, 0, `${passTime}`, {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        timeBox.add([bg, label, value]);
        timeBox.setDepth(3000);
        this.createButton(width / 2 - 180, height / 2 + 140, 'NEXT LEVEL', '#7c3aed', () => {
            const nextLevel = levelNumber + 1;
            const nextScene = `Level${nextLevel}`;

            if (this.scene.get(nextScene)) {
                this.scene.start(nextScene);
            } else {
                this.scene.start('LevelSelect');
            }
        });
        this.createButton(width / 2 + 180, height / 2 + 140, 'MENU', '#6366f1', () => {
            this.scene.start('MainMenu');
        });
    }

    // Helper function to create clickable buttons
    createButton(x, y, text, color, callback) {
        const bg = this.add.rectangle(x, y, 300, 70, color)
            .setDepth(3000).setStrokeStyle(2, '#ffffff');
        const txt = this.add.text(x, y, text, {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(3001);

        // Interactive behavior
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {          
                bg.setScale(1.08);
                txt.setScale(1.08);
            })
            .on('pointerout', () => {           
                bg.setScale(1);
                txt.setScale(1);
            })
            .on('pointerdown', callback);       
    }
}