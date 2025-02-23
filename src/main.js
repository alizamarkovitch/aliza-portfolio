import 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;

function create() {
    // Create the floor
    const floor = this.add.rectangle(400, 580, 800, 40, 0x333333);
    this.physics.add.existing(floor, true);

    // Create the player
    player = this.add.rectangle(400, 300, 30, 30, 0x000000);
    this.physics.add.existing(player);

    // Player physics
    player.body.setBounce(0.1);
    player.body.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(player, floor);

    // Controls
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (cursors.left.isDown) {
        player.body.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(160);
    } else {
        player.body.setVelocityX(0);
    }
} 