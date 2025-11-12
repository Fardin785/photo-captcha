"use client";
import React, { useEffect, useRef, useState } from "react";

export default function CaptchaCamera({ onCapture }: { onCapture: (img: string, box: DOMRect) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [box, setBox] = useState({ x: 100, y: 100, size: 150 });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    });
    return () => stopCamera();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setBox({
        x: Math.random() * 200 + 50,
        y: Math.random() * 100 + 50,
        size: 150,
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const videoW = video.videoWidth;
    const videoH = video.videoHeight;
    const displayW = video.clientWidth;
    const displayH = video.clientHeight;

    canvas.width = videoW;
    canvas.height = videoH;
    ctx.drawImage(video, 0, 0, videoW, videoH);

    const scaleX = videoW / displayW;
    const scaleY = videoH / displayH;
    const scaledBox = new DOMRect(box.x * scaleX, box.y * scaleY, box.size * scaleX, box.size * scaleY);

    stopCamera();
    onCapture(canvas.toDataURL("image/png"), scaledBox);
  };

  return (
    <div className="flex flex-col items-center mt-6 space-y-3">
      <h2 className="text-xl font-semibold text-blue-600 drop-shadow-md">Custom CAPTCHA Verification</h2>
      <div className="relative w-[500px] h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-blue-800 backdrop-blur-md">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div
          className="absolute border-4 border-yellow-400 shadow-lg rounded-lg animate-pulse"
          style={{
            top: box.y,
            left: box.x,
            width: box.size,
            height: box.size,
            boxShadow: "0 0 15px rgba(255, 255, 0, 0.7)",
          }}
        />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={handleCapture}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          Continue
        </button>
      </div>
      <p className="text-sm text-gray-500">Make sure your face is visible before continuing.</p>
    </div>
  );
}
