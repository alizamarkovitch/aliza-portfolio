// Initialize Kaboom with debug mode on
kaboom({
  debug: true,
  width: 800,
  height: 600,
  background: [0, 0, 255],
});

// Just add a single box that falls
scene("game", () => {
  add([rect(50, 50), pos(400, 0), area(), body(), color(255, 0, 0)]);
});

// Start the game
go("game");
