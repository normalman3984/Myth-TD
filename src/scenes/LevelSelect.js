import ProgressManager from '../managers/ProgressManager.js';

export default class LevelSelect extends Phaser.Scene {
    constructor() {
        super('LevelSelect');
    }

    // Build the level selection UI
    create() {
        const { width, height } = this.scale;
        
        this.add.text(width / 2, 100, 'SELECT LEVEL', {
            fontSize: '80px',
            color: '#64d5ff',
            fontStyle: 'bold',
            stroke: '#0a3f5c',
            strokeThickness: 6,
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const levels = [
            { num: 1, name: 'LEVEL 1', scene: 'Level1' },
            { num: 2, name: 'LEVEL 2', scene: 'Level2' },
            { num: 3, name: 'LEVEL 3', scene: 'Level3' }
        ];

        // Create a selectable card for each level
        levels.forEach((lvl, i) => {
            const x = width / 2 + (i - 1) * 400;  
            const y = height / 2;
            const isUnlocked = ProgressManager.isUnlocked(lvl.num);
            
            // Card background
            const cardColor = isUnlocked ? 0x1a3f5e : 0x0a1a2e;
            const strokeColor = isUnlocked ? 0x64d5ff : 0x444444;
            const card = this.add.rectangle(x, y, 300, 200, cardColor)
                .setStrokeStyle(3, strokeColor);
            
            if (isUnlocked) {
                card.setInteractive({ useHandCursor: true });
            }
            
            this.add.text(x, y - 20, lvl.name, {
                fontSize: '36px',
                color: isUnlocked ? '#64d5ff' : '#666666',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            if (isUnlocked) {
                card.on('pointerover', () => card.setScale(1.08));
                card.on('pointerout', () => card.setScale(1));
                card.on('pointerdown', () => {
                    this.sound.stopAll();
                    this.scene.start(lvl.scene);
                });
            } else {
                this.add.text(x, y + 30, '🔒 LOCKED', {
                    fontSize: '20px',
                    color: '#ff6b6b',
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
            }
        });

        // Back button
        const back = this.add.text(80, height - 80, '← BACK', {
            fontSize: '32px',
            color: '#64d5ff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setInteractive({ useHandCursor: true }).setOrigin(0);

        back.on('pointerover', () => { back.setColor('#ffffff'); back.setScale(1.1); });
        back.on('pointerout', () => { back.setColor('#64d5ff'); back.setScale(1); });
        back.on('pointerdown', () => this.scene.start('MainMenu'));
        this.input.keyboard.on('keydown-ESC', () => this.scene.start('MainMenu'));
    }
}