// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Load the sprite sheet
    this.load.spritesheet("cat", "/src/assets/cat22.png", {
      frameWidth: 32, // Adjust these values based on your actual sprite size
      frameHeight: 32,
      startFrame: 0,
      endFrame: 15, // 4x4 sprite sheet = 16 frames
    });
  }

  create() {
    // Create the floor
    this.floor = this.add.rectangle(400, 576, 800, 48, 0x808080);
    this.physics.add.existing(this.floor, true); // true makes it static

    // Create the player
    this.player = this.physics.add.sprite(400, 502, "cat");
    this.player.setCollideWorldBounds(true);

    // Create animations
    this.anims.create({
      key: "idle",
      frames: [{ key: "cat", frame: 0 }],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "moveRight",
      frames: [{ key: "cat", frame: 1 }],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "moveLeft",
      frames: [{ key: "cat", frame: 3 }],
      frameRate: 10,
      repeat: -1,
    });

    // Set up collision between player and floor
    this.physics.add.collider(this.player, this.floor);

    // Set up cursor keys for input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Handle movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("moveLeft", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play("moveRight", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("idle", true);
    }

    // Handle jumping
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: MainScene,
  backgroundColor: "#0000ff",
};

// Create and start the game
new Phaser.Game(config);
