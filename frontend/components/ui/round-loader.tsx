import React, { useState, useEffect } from 'react';
import {
  Trophy, Search, BarChart3, Brain, Target, ShieldCheck,
  Sparkles, Crown, CheckCircle
} from "lucide-react";

export default function WinnerDeterminationLoader() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  const steps = [
    { icon: BarChart3,   text: "O‘yin statistikasi solishtirilmoqda",    color: "text-indigo-400" },
    { icon: Crown,       text: "G‘olib nomzodlari saralanyapti",         color: "text-yellow-400" },
    { icon: Trophy,      text: "Yakuniy g‘olib aniqlanmoqda",            color: "text-orange-400" },
    { icon: CheckCircle, text: "Jarayon yakunlanmoqda",                  color: "text-green-500" },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 200);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 5000);

    const pulseInterval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.1 : 1);
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">

          {/* Main animated icon */}
          <div className="flex justify-center mb-8">
            <div
              className="relative"
              style={{ transform: `scale(${pulseScale})`, transition: 'transform 0.5s ease-in-out' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-full">
                <CurrentIcon className="w-16 h-16 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              G‘olib aniqlanmoqda...
            </h2>
            <p className={`text-lg ${steps[currentStep].color} font-medium transition-all duration-300`}>
              {steps[currentStep].text}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Jarayon</span>
              <span className="font-bold text-white">{progress}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between items-center flex-wrap">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isPassed = index < currentStep || progress === 100;

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                      ? 'scale-110 shadow-lg shadow-white/20'
                      : isPassed
                      ? 'bg-green-500'
                      : 'bg-slate-700'
                    }`}
                  >
                    <StepIcon
                      className={`w-6 h-6 ${isActive || isPassed ? 'text-white' : 'text-slate-500'}`}
                      strokeWidth={2}
                    />
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom particles */}
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>

        </div>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Iltimos kuting, yangi o‘yinning g‘olibi aniqlanmoqda...
        </p>

      </div>
    </div>
  );
}
