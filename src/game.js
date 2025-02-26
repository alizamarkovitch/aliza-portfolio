// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.backgrounds = [];
    this.enemies = [];
    this.projectiles = [];
    this.lastDirection = "right"; // Track player direction for shooting
    this.shootDirection = { x: 1, y: 0 }; // Track shooting direction
    this.score = 0; // Initialize score
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
    // Load the cloud image
    this.load.image("cloud", "src/assets/cloud.png");
  }

  createGroundEnemy(x, y) {
    const enemy = this.add.rectangle(x, y, 32, 32, 0xff0000);
    this.physics.add.existing(enemy);
    enemy.body.setVelocityX(-100);
    enemy.body.setCollideWorldBounds(false);
    enemy.body.setImmovable(false);
    enemy.jumpTimer = 0;
    enemy.type = "ground";
    return enemy;
  }

  createFlyingEnemy(x, y) {
    const enemy = this.add.rectangle(x, y, 32, 32, 0x0000ff); // Blue color
    this.physics.add.existing(enemy);
    enemy.body.setVelocityX(-150);
    enemy.body.setCollideWorldBounds(false);
    enemy.body.setImmovable(false);
    enemy.body.setAllowGravity(false); // Flying enemies aren't affected by gravity
    enemy.startY = y;
    enemy.type = "flying";
    enemy.flyDirection = 1; // 1 for up, -1 for down
    return enemy;
  }

  createPlatform(x, y, width) {
    const platform = this.add.rectangle(x, y, width, 20, 0x8b4513); // Brown color
    this.physics.add.existing(platform, true);
    platform.setScrollFactor(1, 0);
    platform.startY = y; // Store initial Y position
    platform.oscillationSpeed = Phaser.Math.FloatBetween(0.5, 1.5); // Random speed
    platform.oscillationRange = Phaser.Math.FloatBetween(20, 40); // Random range
    return platform;
  }

  createProjectile(x, y, direction) {
    const projectile = this.add.circle(x, y, 8, 0xffff00);
    this.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);

    // Calculate velocity based on direction
    const speed = 400;
    projectile.body.setVelocity(direction.x * speed, direction.y * speed);

    return projectile;
  }

  createCloud(x, y) {
    const scale = Phaser.Math.FloatBetween(0.8, 1.5); // Slightly smaller size range
    const cloud = this.add.image(x, y, "cloud");
    cloud.setScale(scale);
    cloud.setAlpha(0.7);
    cloud.setScrollFactor(1, 0); // Match background scroll factor
    cloud.setDepth(-1);
    cloud.baseSpeed = Phaser.Math.FloatBetween(-8, -4); // Even slower movement
    return cloud;
  }

  create() {
    // Get the game dimensions
    const gameHeight = this.scale.height;
    const gameWidth = this.scale.width;

    // Create score text
    this.scoreText = this.add.text(gameWidth - 150, 20, "Score: 0", {
      fontSize: "24px",
      fill: "#fff",
      stroke: "#000",
      strokeThickness: 4,
    });
    this.scoreText.setScrollFactor(0); // Fix to camera
    this.scoreText.setDepth(1000); // Make sure it's always on top

    // Create the parallax background
    for (let i = 0; i < 3; i++) {
      const bg = this.add.image(gameWidth * i, 0, "background");
      bg.setOrigin(0, 0);
      bg.setDisplaySize(gameWidth, gameHeight);
      bg.setScrollFactor(1, 0);
      bg.setDepth(-2); // Place background behind everything
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

    // Create platforms group
    this.platformGroup = this.add.group();

    // Create some platforms at different heights
    const platformPositions = [
      { x: gameWidth + 200, y: this.groundY - 150, width: 200 },
      { x: gameWidth + 500, y: this.groundY - 250, width: 150 },
      { x: gameWidth + 800, y: this.groundY - 200, width: 180 },
    ];

    platformPositions.forEach(({ x, y, width }) => {
      const platform = this.createPlatform(x, y, width);
      this.platformGroup.add(platform);
    });

    // Create enemies group
    this.enemyGroup = this.add.group();
    this.projectileGroup = this.add.group();

    // Spawn initial enemies (mix of ground and flying)
    for (let i = 0; i < 3; i++) {
      const groundEnemy = this.createGroundEnemy(
        gameWidth + i * 400,
        this.groundY - 16
      );
      this.enemyGroup.add(groundEnemy);

      const flyingEnemy = this.createFlyingEnemy(
        gameWidth + i * 400 + 200,
        this.groundY - 200
      );
      this.enemyGroup.add(flyingEnemy);
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
    this.physics.add.collider(this.player, this.platformGroup);
    this.physics.add.collider(this.enemyGroup, this.platformGroup);

    // Handle projectile collision with enemies
    this.physics.add.overlap(
      this.projectileGroup,
      this.enemyGroup,
      (projectile, enemy) => {
        projectile.destroy();
        enemy.destroy();
        this.score += 10; // Add 10 points for each enemy destroyed
        this.scoreText.setText("Score: " + this.score); // Update score display
      }
    );

    // Handle enemy collision with player
    this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => {
      if (player.body.touching.down && enemy.body.touching.up) {
        enemy.destroy();
        player.setVelocityY(-300);
        this.score += 10; // Add 10 points for stomping enemies
        this.scoreText.setText("Score: " + this.score); // Update score display
      } else {
        this.handlePlayerDeath();
      }
    });

    // Set up cursor keys for input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add keys for directional shooting
    this.shootKeys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

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

    // Create clouds group
    this.cloudGroup = this.add.group();

    // Create initial clouds at random positions with better spacing
    for (let i = 0; i < 3; i++) {
      // Reduced initial count
      const x = Phaser.Math.Between(0, gameWidth * 3);
      const y = Phaser.Math.Between(50, gameHeight / 2);
      const cloud = this.createCloud(x, y);
      this.cloudGroup.add(cloud);
    }
  }

  handlePlayerDeath() {
    // Reset player position
    this.player.setPosition(200, this.groundY - 32);
    this.player.setVelocity(0, 0);
    // Note: We're not resetting the score here, so it persists after death
  }

  updateShootDirection() {
    let dx = 0;
    let dy = 0;

    if (this.shootKeys.up.isDown) dy = -1;
    if (this.shootKeys.down.isDown) dy = 1;
    if (this.shootKeys.left.isDown) dx = -1;
    if (this.shootKeys.right.isDown) dx = 1;

    // If no direction keys are pressed, shoot in last movement direction
    if (dx === 0 && dy === 0) {
      dx = this.lastDirection === "right" ? 1 : -1;
      dy = 0;
    }

    // Normalize the direction vector
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      this.shootDirection = {
        x: dx / length,
        y: dy / length,
      };
    }
  }

  update() {
    const gameWidth = this.scale.width;
    const cameraX = this.cameras.main.scrollX;

    // Handle movement and update last direction
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
      this.player.anims.play("moveLeft", true);
      this.lastDirection = "left";
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
      this.player.anims.play("moveRight", true);
      this.lastDirection = "right";
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("idle", true);
    }

    // Handle jumping
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // Update shoot direction based on arrow keys
    this.updateShootDirection();

    // Handle shooting
    if (Phaser.Input.Keyboard.JustDown(this.cursors.shift)) {
      const projectile = this.createProjectile(
        this.player.x,
        this.player.y,
        this.shootDirection
      );
      this.projectileGroup.add(projectile);
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
        if (enemy.x < cameraX - 100) {
          enemy.destroy();
        } else if (enemy.type === "ground") {
          // Random jumping for ground enemies
          enemy.jumpTimer += 1;
          if (enemy.jumpTimer > 120 && enemy.body.touching.down) {
            // Jump every ~2 seconds if on ground
            enemy.body.setVelocityY(-300);
            enemy.jumpTimer = 0;
          }
        } else if (enemy.type === "flying") {
          // Sinusoidal movement for flying enemies
          enemy.y = enemy.startY + Math.sin(enemy.x / 100) * 50;
        }
      }
    });

    // Clean up off-screen projectiles
    this.projectileGroup.children.iterate((projectile) => {
      if (
        projectile &&
        (projectile.x < cameraX - 100 ||
          projectile.x > cameraX + gameWidth + 100)
      ) {
        projectile.destroy();
      }
    });

    // Spawn new enemies
    if (this.enemyGroup.children.size < 6) {
      // Increased to account for both types
      const lastEnemy = this.enemyGroup.children
        .getArray()
        .reduce((rightmost, enemy) => {
          return !rightmost || enemy.x > rightmost.x ? enemy : rightmost;
        }, null);

      const spawnX = lastEnemy
        ? Math.max(lastEnemy.x + 400, cameraX + gameWidth + 100)
        : cameraX + gameWidth + 100;

      // Randomly spawn either ground or flying enemy
      if (Math.random() < 0.5) {
        const groundEnemy = this.createGroundEnemy(spawnX, this.groundY - 16);
        this.enemyGroup.add(groundEnemy);
      } else {
        const flyingEnemy = this.createFlyingEnemy(spawnX, this.groundY - 200);
        this.enemyGroup.add(flyingEnemy);
      }
    }

    // Update platforms
    this.platformGroup.children.iterate((platform) => {
      if (platform) {
        if (platform.x < cameraX - platform.width) {
          platform.destroy();
        } else {
          // Calculate new Y position
          const newY =
            platform.startY +
            Math.sin(this.time.now * 0.002 * platform.oscillationSpeed) *
              platform.oscillationRange;
          // Update both visual and physics body position
          platform.y = newY;
          platform.body.position.y = newY;
        }
      }
    });

    // Spawn new platforms
    if (this.platformGroup.children.size < 3) {
      const lastPlatform = this.platformGroup.children
        .getArray()
        .reduce((rightmost, platform) => {
          return !rightmost || platform.x > rightmost.x ? platform : rightmost;
        }, null);

      const spawnX = lastPlatform
        ? Math.max(
            lastPlatform.x + Phaser.Math.Between(300, 500),
            cameraX + gameWidth + 100
          )
        : cameraX + gameWidth + 100;

      const platform = this.createPlatform(
        spawnX,
        this.groundY - Phaser.Math.Between(150, 300),
        Phaser.Math.Between(150, 250)
      );
      this.platformGroup.add(platform);
    }

    // Reset player if they fall too far
    if (this.player.y > this.scale.height + 200) {
      this.player.setPosition(200, this.groundY - 32);
      this.player.setVelocity(0, 0);
    }

    // Update clouds
    this.cloudGroup.children.iterate((cloud) => {
      if (cloud) {
        // Move cloud based on its base speed
        cloud.x += cloud.baseSpeed * (1 / 60); // Assuming 60 FPS

        // If cloud moves off screen to the left, destroy it
        // Add more buffer before destroying (2 * cloud width)
        if (cloud.x < cameraX - cloud.width * cloud.scale * 2) {
          cloud.destroy();
        }
      }
    });

    // Spawn new clouds with better spacing
    if (this.cloudGroup.children.size < 3) {
      // Maintain fewer clouds
      const lastCloud = this.cloudGroup.children
        .getArray()
        .reduce((rightmost, cloud) => {
          return !rightmost || cloud.x > rightmost.x ? cloud : rightmost;
        }, null);

      const spawnX = lastCloud
        ? Math.max(
            lastCloud.x + Phaser.Math.Between(600, 800),
            cameraX + gameWidth + 100
          )
        : cameraX + gameWidth + 100;

      const spawnY = Phaser.Math.Between(50, this.scale.height / 2.5);
      const cloud = this.createCloud(spawnX, spawnY);
      this.cloudGroup.add(cloud);
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
