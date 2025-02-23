// Initialize Kaboom with debug mode on
kaboom({
  debug: true,
  width: 800,
  height: 600,
  background: [0, 0, 255],
});

// Load the cat sprite sheet
loadSprite("cat", "assets/cat22.png", {
  sliceX: 4, // 4 columns
  sliceY: 4, // 4 rows
  anims: {
    idle: 0, // Top-left sprite
    moveRight: 1, // Second sprite from left in top row
    idle2: 2, // Third sprite from left in top row
    moveLeft: 3, // Fourth sprite from left in top row
  },
});

// Just add a box and floor with controls
scene("game", () => {
  // Add the floor first
  const floor = add([
    rect(width(), 48),
    pos(0, height() - 48),
    area(),
    body({ isStatic: true }),
    color(128, 128, 128),
  ]);

  // Add our cat player - positioned just above the floor
  const player = add([
    sprite("cat"), // Use the cat sprite instead of rectangle
    pos(400, height() - 98),
    area(),
    body(),
    {
      // Add a direction property to track which way the cat is facing
      direction: "right",
      isMoving: false,
    },
  ]);

  // Set initial animation
  player.play("idle");

  // Add movement controls
  onKeyDown("left", () => {
    player.move(-200, 0);
    player.direction = "left";
    player.play("moveLeft");
  });

  onKeyDown("right", () => {
    player.move(200, 0);
    player.direction = "right";
    player.play("moveRight");
  });

  // When no movement keys are pressed, return to idle
  onKeyRelease(["left", "right"], () => {
    player.play("idle");
  });

  // Add jump with space
  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(400);
    }
  });
});

// Start the game
go("game");
