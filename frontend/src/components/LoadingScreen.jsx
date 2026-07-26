import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="flex flex-col items-center gap-6 z-10">
        {/* CP Monogram Icon with gold gradient and circular rotate spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
          />
          <span className="font-serif text-lg font-bold text-primary tracking-tighter">CP</span>
        </div>
        
        <div className="text-center space-y-1">
          <h3 className="font-serif text-base font-medium uppercase tracking-widest text-primary-text">
            Chef<span className="text-primary italic">Pulse</span>
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-secondary-text animate-pulse">
            Configuring Operational Space
          </p>
        </div>
      </div>
    </div>
  );
}
