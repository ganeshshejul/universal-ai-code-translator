"use client";

import { EditorWorkspace } from "@/components/editor-workspace";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col p-4 md:p-6 bg-background">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none" />

      <div className="relative flex-1 w-full max-w-[1400px] mx-auto flex flex-col gap-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center pt-8 pb-4 font-sans"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Translation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Translate Code Instantly
          </h1>
          <p className="text-muted-foreground font-sans max-w-2xl text-lg">
            Seamlessly port algorithms, applications, and logic across different programming languages with context-aware AI explanations.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 flex flex-col"
        >
          <EditorWorkspace />
        </motion.div>
      </div>
    </div>
  );
}
