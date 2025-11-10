"use client";
import React, { useEffect, useRef, useState } from "react";

export default function CaptchaCamera({ onCapture }: { onCapture: (img: string, box: DOMRect) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ x: 100, y: 100, size: 150 });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setBox({
        x: Math.random() * 200 + 50,
        y: Math.random() * 100 + 50,
        size: 150,
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleCapture = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const videoW = video.videoWidth;
    const videoH = video.videoHeight;
    const displayW = video.clientWidth;
    const displayH = video.clientHeight;

    // Draw actual frame
    canvas.width = videoW;
    canvas.height = videoH;
    ctx.drawImage(video, 0, 0, videoW, videoH);

    // Scale box coordinates from display space → video resolution
    const scaleX = videoW / displayW;
    const scaleY = videoH / displayH;
    const scaledBox = new DOMRect(box.x * scaleX, box.y * scaleY, box.size * scaleX, box.size * scaleY);

    onCapture(canvas.toDataURL("image/png"), scaledBox);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="relative w-[500px] h-[400px] border-4 border-blue-900 flex flex-col items-center justify-center">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div
          className="absolute border-2 border-white transition-all duration-500"
          style={{ top: box.y, left: box.x, width: box.size, height: box.size }}
        />
        <canvas ref={canvasRef} className="hidden" />
        <button className="absolute bottom-4 bg-yellow-500 text-white px-4 py-2 rounded" onClick={handleCapture}>
          Continue
        </button>
      </div>
    </div>
  );
}
