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
    this.maxHealth = 3; // Maximum number of hearts
    this.currentHealth = 3; // Current health
    this.isInvulnerable = false; // Invulnerability after getting hit
    this.levelEndDistance = 5 * 800; // 5 screens worth of distance (assuming 800px width)
    this.levelCompleted = false; // Track if level is completed
    this.levelEndingPhase = 0; // Track the phase of the level ending sequence
    this.levelEndingTimer = 0; // Timer for level ending sequence
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

  createHeart(x, y) {
    const heart = this.add.circle(x, y, 10, 0xff0000);
    heart.setScrollFactor(0);
    heart.setDepth(1000);
    return heart;
  }

  createHearts() {
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.createHeart(25 + i * 30, 25);
      this.hearts.push(heart);
    }
  }

  updateHearts() {
    this.hearts.forEach((heart, index) => {
      heart.setVisible(index < this.currentHealth);
    });
  }

  handleDamage() {
    if (this.isInvulnerable) return;

    this.currentHealth--;
    this.updateHearts();

    // Make player flash and become temporarily invulnerable
    this.isInvulnerable = true;
    this.player.setAlpha(0.5);

    this.time.delayedCall(1000, () => {
      this.isInvulnerable = false;
      this.player.setAlpha(1);
    });

    if (this.currentHealth <= 0) {
      this.handlePlayerDeath();
    }
  }

  createGroundEnemy(x, y) {
    // Create a circle for the base enemy shape
    const enemy = this.add.circle(0, 0, 16, 0xff0000);

    // Add a darker outline to make it stand out
    const outline = this.add.circle(0, 0, 18, 0x990000);
    outline.setDepth(-1); // Place behind the main body

    // Add eyes to make it look vicious - make them angrier with smaller eyes
    const leftEye = this.add.circle(-6, -5, 3, 0xffffff);
    const rightEye = this.add.circle(6, -5, 3, 0xffffff);

    // Add pupils - make them smaller and more focused
    const leftPupil = this.add.circle(-6, -5, 1.5, 0x000000);
    const rightPupil = this.add.circle(6, -5, 1.5, 0x000000);

    // Add angry eyebrows - make them thicker and more angled
    const leftEyebrow = this.add.rectangle(-6, -10, 10, 3, 0x000000);
    const rightEyebrow = this.add.rectangle(6, -10, 10, 3, 0x000000);
    leftEyebrow.setAngle(-40);
    rightEyebrow.setAngle(40);

    // Add a mouth with teeth
    const mouth = this.add.rectangle(0, 7, 14, 3, 0x000000);

    // Add teeth
    const leftTooth = this.add.triangle(-4, 5, 0, 0, -3, 5, 3, 5, 0xffffff);
    const rightTooth = this.add.triangle(4, 5, 0, 0, -3, 5, 3, 5, 0xffffff);

    // Create a container to group all parts
    const container = this.add.container(x, y, [
      outline,
      enemy,
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
      leftEyebrow,
      rightEyebrow,
      mouth,
      leftTooth,
      rightTooth,
    ]);
    container.setSize(32, 32);

    // Add physics to the container
    this.physics.add.existing(container);
    container.body.setVelocityX(-100);
    container.body.setCollideWorldBounds(false);
    container.body.setImmovable(false);
    container.jumpTimer = 0;
    container.type = "ground";

    return container;
  }

  createFlyingEnemy(x, y) {
    // Create a circle for the base enemy shape - make it a deeper blue
    const enemy = this.add.circle(0, 0, 16, 0x0000cc);

    // Add a darker outline
    const outline = this.add.circle(0, 0, 18, 0x000066);
    outline.setDepth(-1);

    // Add more aggressive spikes
    const numSpikes = 10; // More spikes
    const spikes = [];
    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2;
      const spikeX = Math.cos(angle) * 16;
      const spikeY = Math.sin(angle) * 16;
      const spike = this.add.triangle(
        spikeX,
        spikeY,
        0,
        -12, // Make spikes longer
        -5,
        6,
        5,
        6,
        0x6666ff
      );
      spike.setAngle(angle * (180 / Math.PI) + 90);
      spikes.push(spike);
    }

    // Add more menacing eyes - larger with red pupils
    const leftEye = this.add.circle(-7, -5, 5, 0xffffff);
    const rightEye = this.add.circle(7, -5, 5, 0xffffff);

    // Add bright red pupils for a more menacing look
    const leftPupil = this.add.circle(-7, -5, 3, 0xff0000);
    const rightPupil = this.add.circle(7, -5, 3, 0xff0000);

    // Add a mouth with sharp teeth
    const mouth = this.add.rectangle(0, 7, 12, 2, 0x000000);

    // Add sharp teeth
    const teeth = [];
    for (let i = 0; i < 3; i++) {
      const tooth = this.add.triangle(
        -6 + i * 6,
        6,
        0,
        0,
        -2,
        4,
        2,
        4,
        0xffffff
      );
      teeth.push(tooth);
    }

    // Create a container to group all parts
    const container = this.add.container(x, y, [
      outline,
      enemy,
      ...spikes,
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
      mouth,
      ...teeth,
    ]);
    container.setSize(32, 32);

    // Add physics to the container
    this.physics.add.existing(container);
    container.body.setVelocityX(-150);
    container.body.setCollideWorldBounds(false);
    container.body.setImmovable(false);
    container.body.setAllowGravity(false); // Flying enemies aren't affected by gravity
    container.startY = y;
    container.type = "flying";
    container.flyDirection = 1; // 1 for up, -1 for down

    return container;
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

    // Create hearts
    this.createHearts();

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
      } else if (!this.isInvulnerable) {
        this.handleDamage();
        // Add knockback effect
        const knockbackDirection = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(knockbackDirection * -300);
        player.setVelocityY(-200);
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

    // Create level goal marker
    this.levelGoal = this.add.rectangle(
      this.levelEndDistance,
      this.groundY - 100,
      50,
      200,
      0xffff00
    );
    this.physics.add.existing(this.levelGoal, true);
    this.levelGoal.setAlpha(0.8);

    // Add a flag on top of the goal
    this.goalFlag = this.add.triangle(
      this.levelEndDistance,
      this.groundY - 200,
      0,
      0,
      0,
      50,
      30,
      25,
      0xff0000
    );

    // Add some decorative elements around the goal
    for (let i = 0; i < 5; i++) {
      const star = this.add.star(
        this.levelEndDistance + Phaser.Math.Between(-100, 100),
        this.groundY - Phaser.Math.Between(150, 300),
        5,
        8,
        16,
        0xffff00
      );
      star.setAlpha(0.8);
    }

    // Create level completion text (initially hidden)
    this.levelCompleteText = this.add.text(
      gameWidth / 2,
      gameHeight / 2,
      "LEVEL COMPLETE!",
      {
        fontSize: "48px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 6,
        fontStyle: "bold",
      }
    );
    this.levelCompleteText.setOrigin(0.5);
    this.levelCompleteText.setScrollFactor(0);
    this.levelCompleteText.setAlpha(0);
    this.levelCompleteText.setDepth(1000);

    // Create score display for level end
    this.finalScoreText = this.add.text(
      gameWidth / 2,
      gameHeight / 2 + 60,
      "",
      {
        fontSize: "32px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 4,
      }
    );
    this.finalScoreText.setOrigin(0.5);
    this.finalScoreText.setScrollFactor(0);
    this.finalScoreText.setAlpha(0);
    this.finalScoreText.setDepth(1000);

    // Add collision detection for level goal
    this.physics.add.overlap(
      this.player,
      this.levelGoal,
      this.triggerLevelEnding,
      null,
      this
    );
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

  triggerLevelEnding() {
    if (!this.levelCompleted) {
      this.levelCompleted = true;
      this.levelEndingPhase = 1;
      this.levelEndingTimer = 0;

      // Stop player movement and make invulnerable
      this.player.setVelocity(0, 0);
      this.isInvulnerable = true;

      // Disable player controls
      this.cursors.left.enabled = false;
      this.cursors.right.enabled = false;
      this.cursors.space.enabled = false;
      this.cursors.shift.enabled = false;

      // Add bonus score for completing level
      this.score += 500;
      this.scoreText.setText("Score: " + this.score);

      // Create fireworks
      this.createFireworks();
    }
  }

  createFireworks() {
    // Create multiple firework explosions
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 300, () => {
        const x = this.player.x + Phaser.Math.Between(-200, 200);
        const y = Phaser.Math.Between(this.groundY - 300, this.groundY - 100);
        this.createFireworkExplosion(x, y);
      });
    }
  }

  createFireworkExplosion(x, y) {
    const particleCount = 30;
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const color = Phaser.Utils.Array.GetRandom(colors);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Phaser.Math.Between(100, 200);
      const particle = this.add.circle(x, y, 3, color);

      this.physics.add.existing(particle);
      particle.body.setAllowGravity(false);
      particle.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // Fade out and destroy particle
      this.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.5,
        duration: 1000,
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  updateLevelEndingSequence() {
    if (!this.levelCompleted) return;

    this.levelEndingTimer++;

    // Phase 1: Initial celebration (fireworks, etc.)
    if (this.levelEndingPhase === 1 && this.levelEndingTimer > 60) {
      this.levelEndingPhase = 2;
      this.levelEndingTimer = 0;

      // Show level complete text with animation
      this.tweens.add({
        targets: this.levelCompleteText,
        alpha: 1,
        scale: { from: 0.5, to: 1 },
        duration: 1000,
        ease: "Bounce.Out",
      });
    }

    // Phase 2: Show score
    else if (this.levelEndingPhase === 2 && this.levelEndingTimer > 60) {
      this.levelEndingPhase = 3;
      this.levelEndingTimer = 0;

      // Show final score
      this.finalScoreText.setText("Final Score: " + this.score);
      this.tweens.add({
        targets: this.finalScoreText,
        alpha: 1,
        y: { from: this.finalScoreText.y + 50, to: this.finalScoreText.y },
        duration: 800,
        ease: "Back.Out",
      });

      // Make player do a victory animation
      this.player.setVelocityY(-400);

      // Create more fireworks for final celebration
      this.createFireworks();
    }

    // Phase 3: Final celebration
    else if (this.levelEndingPhase === 3 && this.levelEndingTimer > 180) {
      this.levelEndingPhase = 4;

      // Add "Next Level" text that would transition to the next level
      const nextLevelText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 + 120,
        "Ready for Next Adventure!",
        {
          fontSize: "24px",
          fill: "#fff",
          stroke: "#000",
          strokeThickness: 4,
        }
      );
      nextLevelText.setOrigin(0.5);
      nextLevelText.setScrollFactor(0);
      nextLevelText.setDepth(1000);
      nextLevelText.setAlpha(0);

      // Animate the next level text
      this.tweens.add({
        targets: nextLevelText,
        alpha: 1,
        duration: 1000,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  update() {
    const gameWidth = this.scale.width;
    const cameraX = this.cameras.main.scrollX;

    // Update level ending sequence if active
    if (this.levelCompleted) {
      this.updateLevelEndingSequence();

      // If we're in phase 3 or later, make the player do celebratory jumps
      if (this.levelEndingPhase >= 3 && this.player.body.touching.down) {
        this.player.setVelocityY(-300);
      }

      // Continue with other updates but skip player controls
    }

    // Only process player controls if level is not completed
    if (!this.levelCompleted) {
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
    }

    // Rest of update function continues as normal
    // Update distance progress indicator
    if (!this.levelCompleted) {
      const progress = Math.min(1, this.player.x / this.levelEndDistance);
      if (this.progressBar) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0x00ff00, 1);
        this.progressBar.fillRect(10, 50, 200 * progress, 10);
      } else {
        this.progressBar = this.add.graphics();
        this.progressBar.setScrollFactor(0);
        this.progressBar.setDepth(1000);

        // Add progress bar background
        this.progressBarBg = this.add.rectangle(110, 55, 204, 14, 0x000000);
        this.progressBarBg.setScrollFactor(0);
        this.progressBarBg.setDepth(999);
        this.progressBarBg.setAlpha(0.5);

        // Add progress label
        this.progressLabel = this.add.text(10, 30, "Level Progress:", {
          fontSize: "16px",
          fill: "#fff",
          stroke: "#000",
          strokeThickness: 2,
        });
        this.progressLabel.setScrollFactor(0);
        this.progressLabel.setDepth(1000);
      }
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

          // Rotate the container slightly based on movement to add more character
          enemy.setAngle(Math.sin(this.time.now / 200) * 5);
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
