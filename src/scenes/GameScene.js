export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
    }

    preload() {
        // We don't need to preload rectangles
    }

    create() {
        // Create the floor - making it wider than the game width
        const floor = this.add.rectangle(400, 580, 800, 40, 0x333333);
        this.physics.add.existing(floor, true); // true makes it static

        // Create the player - now black and smaller
        this.player = this.add.rectangle(400, 300, 30, 30, 0x000000);
        this.physics.add.existing(this.player);

        // Player physics properties
        this.player.body.setBounce(0.1);
        this.player.body.setCollideWorldBounds(true);

        // Add collision between player and floor
        this.physics.add.collider(this.player, floor);

        // Create cursor keys for movement
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Handle player movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(160);
        } else {
            this.player.body.setVelocityX(0);
        }
    }
} 