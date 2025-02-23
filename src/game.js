// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.backgrounds = [];
    this.enemies = []; // Store enemies
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

  createEnemy(x, y) {
    const enemy = this.add.rectangle(x, y, 32, 32, 0xff0000);
    this.physics.add.existing(enemy);
    enemy.body.setVelocityX(-100);
    enemy.body.setCollideWorldBounds(false);
    enemy.body.setImmovable(false); // Allow enemy to be affected by gravity
    return enemy;
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
      bg.setScrollFactor(1, 0);
      this.backgrounds.push(bg);
    }

    // Create the ground collision body
    const groundHeight = 180;
    this.groundY = gameHeight - 100;

    // Create a single long ground for better collision
    this.ground = this.add.rectangle(
      0,
      this.groundY,
      gameWidth * 5, // Make it extra wide
      groundHeight,
      0x00ff00,
      0.0
    );
    this.ground.setOrigin(0, 0);
    this.physics.add.existing(this.ground, true); // true makes it static

    // Create enemies group
    this.enemyGroup = this.add.group();

    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
      const enemy = this.createEnemy(gameWidth + i * 400, this.groundY - 16);
      this.enemyGroup.add(enemy);
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

    // Add collision handlers
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.enemyGroup, this.ground);

    // Handle enemy collision
    this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => {
      // Check if player is above the enemy
      if (player.body.touching.down && enemy.body.touching.up) {
        // Player jumped on enemy
        enemy.destroy();
        player.setVelocityY(-300); // Bounce player up
      } else {
        // Player hit enemy from side or below
        this.handlePlayerDeath();
      }
    });

    // Set up cursor keys for input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set up camera to follow player only horizontally
    this.cameras.main.startFollow(this.player, {
      lerpX: 0.1,
      lerpY: 0,
      offsetX: -200,
    });
    this.cameras.main.setFollowOffset(0, -this.cameras.main.height / 2);
    this.cameras.main.setLerp(0.1, 0);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, gameHeight);

    // Move ground with camera
    this.ground.setScrollFactor(1, 0);
  }

  handlePlayerDeath() {
    // Reset player position
    this.player.setPosition(200, this.groundY - 32);
    this.player.setVelocity(0, 0);
  }

  update() {
    const gameWidth = this.scale.width;
    const cameraX = this.cameras.main.scrollX;

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
      this.player.setVelocityY(-500);
    }

    // Infinite background scrolling
    this.backgrounds.forEach((bg, i) => {
      const rightmostBg = Math.max(...this.backgrounds.map((b) => b.x));
      if (bg.x + gameWidth < cameraX) {
        bg.x = rightmostBg + gameWidth - 1;
      }
    });

    // Update ground position
    this.ground.x = cameraX;
    this.ground.body.position.x = cameraX;

    // Update enemies
    this.enemyGroup.children.iterate((enemy) => {
      if (enemy) {
        // Remove enemies that are too far left
        if (enemy.x < cameraX - 100) {
          enemy.destroy();
        }
      }
    });

    // Spawn new enemies
    if (this.enemyGroup.children.size < 3) {
      const lastEnemy = this.enemyGroup.children
        .getArray()
        .reduce((rightmost, enemy) => {
          return !rightmost || enemy.x > rightmost.x ? enemy : rightmost;
        }, null);

      const spawnX = lastEnemy
        ? Math.max(lastEnemy.x + 400, cameraX + gameWidth + 100)
        : cameraX + gameWidth + 100;

      const newEnemy = this.createEnemy(spawnX, this.groundY - 16);
      this.enemyGroup.add(newEnemy);
    }

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
