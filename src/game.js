// Remove the import since Phaser is loaded globally via CDN
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.clouds = [];
    this.hills = [];
    this.mountains = [];
  }

  createCloud(x, y, scale = 1) {
    const cloud = this.add.group();
    const color = 0xffffff;

    // Create cloud parts with ovals and more density
    const parts = [
      { x: 0, y: 0, width: 80, height: 40 },
      { x: 40, y: -15, width: 70, height: 35 },
      { x: 80, y: 0, width: 80, height: 40 },
      { x: 40, y: 15, width: 70, height: 35 },
      // Additional parts for more density
      { x: 20, y: -5, width: 60, height: 30 },
      { x: 60, y: 5, width: 65, height: 35 },
      { x: 30, y: 0, width: 75, height: 38 },
    ];

    parts.forEach((part) => {
      const ellipse = this.add.ellipse(
        x + part.x * scale,
        y + part.y * scale,
        part.width * scale,
        part.height * scale,
        color
      );
      ellipse.setAlpha(0.85); // Slightly more opaque
      cloud.add(ellipse);
    });

    return cloud;
  }

  createMountain(x, y, width, height, color) {
    // Create a mountain shape (sharper triangle)
    const mountain = this.add.graphics();
    mountain.fillStyle(color, 1);
    mountain.beginPath();
    mountain.moveTo(x, y);
    mountain.lineTo(x + width / 2, y - height);
    mountain.lineTo(x + width, y);
    mountain.closePath();
    mountain.fill();
    return mountain;
  }

  createHill(x, y, width, height, color) {
    // Create a triangular hill shape
    const hill = this.add.graphics();
    hill.fillStyle(color, 1);
    hill.beginPath();
    hill.moveTo(x, y);
    hill.lineTo(x + width / 2, y - height);
    hill.lineTo(x + width, y);
    hill.closePath();
    hill.fill();
    return hill;
  }

  preload() {
    // Load the sprite sheet with correct frame size
    this.load.spritesheet("cat", "/src/assets/cat22.png", {
      frameWidth: 64,
      frameHeight: 64,
      startFrame: 0,
      endFrame: 15,
    });
  }

  create() {
    // Get the game dimensions
    const gameHeight = this.scale.height;
    const gameWidth = this.scale.width;

    // Create world bounds much wider than the screen
    this.physics.world.setBounds(0, 0, gameWidth * 3, gameHeight);

    // Create background layers
    this.backgroundGroup = this.add.group();
    this.farMountainsGroup = this.add.group();
    this.middlegroundGroup = this.add.group();
    this.foregroundGroup = this.add.group();

    // Create sky
    const sky = this.add.rectangle(0, 0, gameWidth * 3, gameHeight, 0x87ceeb);
    sky.setOrigin(0, 0);
    this.backgroundGroup.add(sky);

    // Create distant mountains (bluish tint)
    const mountainColors = [0x6b8e9e, 0x7ba3b5, 0x8bb8cc];
    for (let i = 0; i < 12; i++) {
      const width = Phaser.Math.Between(400, 800);
      const height = Phaser.Math.Between(200, 350);
      const x = (i * width) / 3;
      const y = gameHeight - 96;
      const mountain = this.createMountain(
        x,
        y,
        width,
        height,
        mountainColors[i % mountainColors.length]
      );
      this.mountains.push({ graphic: mountain, baseX: x, parallaxFactor: 0.1 });
      this.farMountainsGroup.add(mountain);
    }

    // Create clouds at different depths
    for (let i = 0; i < 20; i++) {
      // Increased number of clouds
      const x = Phaser.Math.Between(0, gameWidth * 3);
      const y = Phaser.Math.Between(30, gameHeight / 2.5);
      const scale = Phaser.Math.FloatBetween(0.4, 1.2);
      const cloud = this.createCloud(x, y, scale);
      this.clouds.push({
        group: cloud,
        baseX: x,
        parallaxFactor: scale * 0.15,
      });
    }

    // Create hills at different depths
    const hillColors = [0x228b22, 0x32cd32, 0x90ee90];
    for (let i = 0; i < 9; i++) {
      const width = Phaser.Math.Between(300, 600);
      const height = Phaser.Math.Between(100, 200);
      const x = (i * width) / 2;
      const y = gameHeight - 96;
      const hill = this.createHill(
        x,
        y,
        width,
        height,
        hillColors[i % hillColors.length]
      );
      this.hills.push({ graphic: hill, baseX: x, parallaxFactor: 0.4 });
      this.middlegroundGroup.add(hill);
    }

    // Create the ground
    const groundHeight = 96;
    const ground = this.add.rectangle(
      0,
      gameHeight - groundHeight / 2,
      gameWidth * 3,
      groundHeight,
      0x3a5f0b
    );
    ground.setOrigin(0, 0.5);
    this.foregroundGroup.add(ground);

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

    // Update parallax for mountains (slowest)
    this.mountains.forEach((mountain) => {
      const cameraDelta = this.cameras.main.scrollX;
      mountain.graphic.x =
        mountain.baseX - cameraDelta * mountain.parallaxFactor;
    });

    // Update parallax for clouds (slow)
    this.clouds.forEach((cloud) => {
      const cameraDelta = this.cameras.main.scrollX;
      cloud.group.getChildren().forEach((part) => {
        part.x = cloud.baseX - cameraDelta * cloud.parallaxFactor;
      });
    });

    // Update parallax for hills (medium)
    this.hills.forEach((hill) => {
      const cameraDelta = this.cameras.main.scrollX;
      hill.graphic.x = hill.baseX - cameraDelta * hill.parallaxFactor;
    });
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
      debug: false, // Turned off debug visualization
    },
  },
  scene: MainScene,
};

// Create and start the game
new Phaser.Game(config);
