"use client";

import React, { useState, useEffect } from 'react';
import { Cog } from 'lucide-react';

const loadingTexts = [
  "Analyzing your preferences...",
  "Scouting for trending topics...",
  "Generating creative post ideas...",
  "Assembling your content plan...",
  "Finalizing the details...",
];

export function FullPageLoader() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center w-48 h-48">
        <Cog className="w-32 h-32 text-primary animate-spin-slow" />
        <Cog className="w-20 h-20 text-secondary absolute animate-spin-reverse-medium" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <Cog className="w-12 h-12 text-accent absolute animate-spin-fast" style={{ top: '20%', left: '20%' }} />
      </div>
      <p className="text-xl font-semibold mt-8 text-foreground animate-pulse">
        {loadingTexts[textIndex]}
      </p>
    </div>
  );
}
