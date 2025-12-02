import React, { useState, useEffect } from 'react';
import {
    Users, Search, BarChart3, Shuffle, Swords, Trophy, 
    Brain, Zap, LineChart, Equal, Target, ShieldCheck,
    Hourglass, Layers, CheckCircle
  } from "lucide-react";

export default function MatchGeneratorLoader() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  
const steps = [
    { icon: Users,        text: "Ishtirokchilar ro'yxati yig'ilmoqda",    color: "text-blue-400" },
    { icon: Search,       text: "Profil ma'lumotlari tahlil qilinmoqda",   color: "text-indigo-400" },
    { icon: Brain,        text: "O'yinchilar reytingi baholanmoqda",       color: "text-purple-400" },
    { icon: BarChart3,    text: "Statistikalar tekshirilmoqda",            color: "text-teal-400" },
    { icon: Zap,          text: "Tezlik va faollik ko'rsatkichlari aniqlanmoqda", color: "text-yellow-400" },
    { icon: Target,       text: "O'yinchilar kuch darajasi solishtirilmoqda", color: "text-red-400" },
    { icon: Equal,        text: "Muvozanatli juftliklar tanlanmoqda",      color: "text-rose-400" },
    { icon: Shuffle,      text: "Tasodifiy faktorlar hisoblanmoqda",       color: "text-orange-400" },
    { icon: Swords,       text: "Raqiblar moslashtirilmoqda",              color: "text-red-500" },
    { icon: ShieldCheck,  text: "Adolatli o'yin nazorati o'rnatilmoqda",   color: "text-green-500" },
    { icon: LineChart,    text: "Raundlar tuzilmasi shakllanmoqda",        color: "text-green-400" },
    { icon: Layers,       text: "Braket struktura tayyorlanmoqda",         color: "text-sky-500" },
    { icon: Hourglass,    text: "O'yin vaqt va tartiblar belgilanmoqda",   color: "text-amber-500" },
    { icon: Trophy,       text: "Final yo'nalishlari hisoblanmoqda",       color: "text-green-600" },
    { icon: CheckCircle,  text: "Turnir muvaffaqiyatli yaratildi!",        color: "text-emerald-500" }
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
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

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
        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          
          {/* Animated Icon */}
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

          {/* Status Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Raqiblar Tanlanmoqda...
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
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 scale-110 shadow-lg shadow-purple-500/50' 
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

          {/* Particles Animation */}
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

        {/* Bottom Text */}
        <p className="text-center text-slate-400 mt-6 text-sm">
          Iltimos kuting, eng yaxshi raqiblar tanlanmoqda...
        </p>
      </div>
    </div>
)}