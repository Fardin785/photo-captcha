"use client";
import React, { useEffect, useRef, useState } from "react";
import { generateGridData } from "@/utils/captchaUtils";

interface CaptchaGridProps {
  image: string;
  box: DOMRect;
  onValidate: (passed: boolean) => void;
}

export default function CaptchaGrid({ image, box, onValidate }: CaptchaGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<any[]>([]);
  const [target, setTarget] = useState<string>("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const gridRows = 4;
  const gridCols = 4;

  useEffect(() => {
    const { grid, targetShape } = generateGridData(gridRows * gridCols);
    setGrid(grid);
    setTarget(targetShape);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        drawGrid(ctx);
      }
    };
  }, [grid]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { x, y, width, height } = box;
    const cellW = width / gridCols;
    const cellH = height / gridRows;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    // Draw horizontal + vertical lines
    for (let r = 0; r <= gridRows; r++) {
      ctx.beginPath();
      ctx.moveTo(x, y + r * cellH);
      ctx.lineTo(x + width, y + r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= gridCols; c++) {
      ctx.beginPath();
      ctx.moveTo(x + c * cellW, y);
      ctx.lineTo(x + c * cellW, y + height);
      ctx.stroke();
    }

    // Draw shapes only within locked square area
    grid.forEach((cell, i) => {
      if (!cell.hasShape) return;
      const row = Math.floor(i / gridCols);
      const col = i % gridCols;
      const cx = x + col * cellW + cellW / 2;
      const cy = y + row * cellH + cellH / 2;
      drawShape(ctx, cell.shape, cx, cy, Math.min(cellW, cellH) / 3);
    });
  };

  const drawShape = (ctx: CanvasRenderingContext2D, shape: string, cx: number, cy: number, size: number) => {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    if (shape === "triangle") {
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx - size, cy + size);
      ctx.lineTo(cx + size, cy + size);
      ctx.closePath();
      ctx.fill();
    } else if (shape === "square") {
      ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
    } else if (shape === "circle") {
      ctx.arc(cx, cy, size, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  // Handle click detection within the locked square grid
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    // Normalize click coords to the same coordinate space as the canvas drawing
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const { x, y, width, height } = box;
    if (clickX < x || clickX > x + width || clickY < y || clickY > y + height) return;

    const cellW = width / gridCols;
    const cellH = height / gridRows;
    const col = Math.floor((clickX - x) / cellW);
    const row = Math.floor((clickY - y) / cellH);
    const index = row * gridCols + col;

    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      drawGrid(ctx);

      // Highlight selected cells
      const { x, y, width, height } = box;
      const cellW = width / gridCols;
      const cellH = height / gridRows;

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      selected.forEach((i) => {
        const row = Math.floor(i / gridCols);
        const col = i % gridCols;
        ctx.fillRect(x + col * cellW, y + row * cellH, cellW, cellH);
      });
    };
  }, [selected, grid]);

  const handleValidate = () => {
    const correctIndices = grid.map((c, i) => (c.shape === target && c.hasShape ? i : null)).filter((x) => x !== null);

    const allCorrect = correctIndices.every((i) => selected.has(i as number));
    const noExtras = [...selected].every((i) => correctIndices.includes(i));
    onValidate(allCorrect && noExtras);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <h3 className="text-blue-600 mb-2">Select all {target}s</h3>
      <canvas ref={canvasRef} onClick={handleClick} className="cursor-crosshair border-2 border-blue-700" />
      <button onClick={handleValidate} className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded">
        Validate
      </button>
    </div>
  );
}
