// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.backgrounds = [];
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

    // Create the parallax background
    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(gameWidth * i, 0, "background");
      bg.setOrigin(0, 0);
      bg.setDisplaySize(gameWidth, gameHeight);
      bg.setScrollFactor(1, 0); // Scroll horizontally with camera, but not vertically
      this.backgrounds.push(bg);
    }

    // Create the ground collision body
    const groundHeight = 180;
    this.groundY = gameHeight - 100;

    // Create a series of connected ground segments
    this.grounds = [];
    for (let i = 0; i < 5; i++) {
      const ground = this.add.rectangle(
        gameWidth * i,
        this.groundY,
        gameWidth,
        groundHeight,
        0x00ff00,
        0.0
      );
      ground.setOrigin(0, 0);
      ground.setScrollFactor(1, 0); // Scroll horizontally with camera, but not vertically
      this.physics.add.existing(ground, true);
      this.grounds.push(ground);
    }

    // Create the player
    const SPRITE_SCALE = 1;
    this.player = this.physics.add.sprite(200, this.groundY - 32, "cat");
    this.player.setScale(SPRITE_SCALE);

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

    // Set up collisions between player and all ground segments
    this.grounds.forEach((ground) => {
      this.physics.add.collider(this.player, ground);
    });

    // Set up cursor keys for input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set up camera to follow player only horizontally
    this.cameras.main.startFollow(this.player, {
      lerpX: 0.1, // Smooth follow horizontally
      lerpY: 0, // No vertical follow
      offsetX: -200, // Keep player slightly to the left of center
    });
    this.cameras.main.setFollowOffset(0, -this.cameras.main.height / 2);
    this.cameras.main.setLerp(0.1, 0); // Smooth horizontal follow, no vertical
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, gameHeight);
  }

  update() {
    const gameWidth = this.scale.width;

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
      this.player.setVelocityY(-500); // Slightly reduced jump height
    }

    // Infinite background scrolling
    const cameraX = this.cameras.main.scrollX;
    this.backgrounds.forEach((bg, i) => {
      const rightmostBg = Math.max(...this.backgrounds.map((b) => b.x));
      if (bg.x + gameWidth < cameraX) {
        bg.x = rightmostBg + gameWidth - 1;
      }
    });

    // Update ground segments
    this.grounds.forEach((ground, i) => {
      const rightmostGround = Math.max(...this.grounds.map((g) => g.x));
      if (ground.x + gameWidth < cameraX) {
        ground.x = rightmostGround + gameWidth;
        ground.body.position.x = rightmostGround + gameWidth;
      }
    });

    // Reset player if they fall too far
    if (this.player.y > this.scale.height + 200) {
      this.player.setPosition(200, this.groundY - 32);
      this.player.setVelocity(0, 0);
    }
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  pixelArt: true,
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
