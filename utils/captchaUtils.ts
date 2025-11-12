// utils/captchaUtils.ts
export function generateGridData(totalCells: number) {
  const shapes = ["circle", "square", "triangle"];
  const colors = ["red", "green", "blue"];
  const grid = [];

  for (let i = 0; i < totalCells; i++) {
    const hasShape = Math.random() > 0.4;
    const shape = hasShape ? shapes[Math.floor(Math.random() * shapes.length)] : null;
    const tint = hasShape ? colors[Math.floor(Math.random() * colors.length)] : null;
    grid.push({ hasShape, shape, tint });
  }

  const targetCell = grid.find((c) => c.hasShape)!;
  return {
    grid,
    targetShape: targetCell.shape,
    targetTint: targetCell.tint,
  };
}
