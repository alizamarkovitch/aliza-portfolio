// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Load the sprite sheet for the cat
    this.load.spritesheet("cat", "src/assets/cat22.png", {
      frameWidth: 64,
      frameHeight: 64,
      startFrame: 0,
      endFrame: 15,
    });

    // Load the background image
    this.load.image("background", "src/assets/bg.png");
  }

  create() {
    // Get the game dimensions
    const gameHeight = this.scale.height;
    const gameWidth = this.scale.width;

    // Create world bounds much wider than the screen
    this.physics.world.setBounds(0, 0, gameWidth * 3, gameHeight);

    // Create the parallax background
    // We'll create 3 background images side by side for seamless scrolling
    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(gameWidth * i, 0, "background");
      bg.setOrigin(0, 0);
      // Scale the background to match game height while maintaining aspect ratio
      bg.setDisplaySize(gameWidth, gameHeight);
    }

    // Create the ground collision body (invisible)
    const groundHeight = 150;
    const ground = this.add.rectangle(
      0,
      gameHeight - groundHeight / 2,
      gameWidth * 3,
      groundHeight
    );
    ground.setOrigin(0, 0.5);
    ground.visible = false; // Make it invisible since we have the background image

    // Add physics to ground
    this.physics.add.existing(ground, true);

    // Create the player
    const SPRITE_SCALE = 2;
    this.player = this.physics.add.sprite(
      gameWidth / 2,
      gameHeight - groundHeight - 64,
      "cat"
    );
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

    // Set up collision between player and ground
    this.physics.add.collider(this.player, ground);

    // Set up cursor keys for input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, gameWidth * 3, gameHeight);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
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
  parent: "game",
  width: 800,
  height: 600,
  pixelArt: true, // Enable pixel art mode for crisp rendering
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false,
    },
  },
  scene: MainScene,
};

// Wait for the DOM to be ready before creating the game
window.onload = () => {
  // Create and start the game
  new Phaser.Game(config);
};
