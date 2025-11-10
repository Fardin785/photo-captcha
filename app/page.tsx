"use client";

import { useState } from "react";
import CaptchaCamera from "@/components/CaptchaCamera";
import CaptchaGrid from "@/components/CaptchaGrid";

export default function Page() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>(null);
  const [result, setResult] = useState<boolean | null>(null);

  if (step === 1)
    return (
      <CaptchaCamera
        onCapture={(img, box) => {
          setData({ img, box });
          setStep(2);
        }}
      />
    );

  if (step === 2)
    return (
      <CaptchaGrid
        image={data.img}
        box={data.box}
        onValidate={(pass) => {
          setResult(pass);
          setStep(3);
        }}
      />
    );

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl">{result ? "✅ Passed CAPTCHA!" : "❌ Failed CAPTCHA"}</h2>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(1)}>
        Try Again
      </button>
    </div>
  );
}
