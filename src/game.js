// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Load the sprite sheet with correct frame size
    this.load.spritesheet("cat", "/src/assets/cat22.png", {
      frameWidth: 64, // Correct sprite size
      frameHeight: 64,
      startFrame: 0,
      endFrame: 15,
    });
  }

  create() {
    // Make game fullscreen when clicking/touching
    this.input.on("pointerdown", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Get the game height for positioning
    const gameHeight = this.scale.height;
    const gameWidth = this.scale.width;

    // Set up sprite scale
    const SPRITE_SCALE = 2; // Reduced scale since sprites are bigger
    const SCALED_SPRITE_HEIGHT = 64 * SPRITE_SCALE; // Original height * scale

    // Create the floor
    const FLOOR_HEIGHT = 96;
    const floorY = gameHeight - FLOOR_HEIGHT / 2;
    this.floor = this.add.rectangle(
      gameWidth / 2,
      floorY,
      gameWidth,
      FLOOR_HEIGHT,
      0x808080
    );
    this.physics.add.existing(this.floor, true); // true makes it static

    // Create the player with larger size
    // Position the player above the floor by half the scaled sprite height
    const playerY = floorY - FLOOR_HEIGHT / 2 - SCALED_SPRITE_HEIGHT / 2;
    this.player = this.physics.add.sprite(gameWidth / 2, playerY, "cat");
    this.player.setScale(SPRITE_SCALE);
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
      this.player.setVelocityX(-300);
      this.player.anims.play("moveLeft", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
      this.player.anims.play("moveRight", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("idle", true);
    }

    // Handle jumping
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-600);
    }
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: "game",
    width: "100%",
    height: "100%",
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: true,
    },
  },
  scene: MainScene,
  backgroundColor: "#0000ff",
};

// Create and start the game
new Phaser.Game(config);
