export function generateGridData(gridSize = 16) {
  const shapes = ["triangle", "square", "circle"];
  const grid = Array.from({ length: gridSize }).map(() => ({
    hasShape: Math.random() < 0.5,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  }));
  const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
  return { grid, targetShape };
}
