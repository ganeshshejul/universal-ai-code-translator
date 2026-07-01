"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, ArrowRightLeft, Sparkles, AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
];

export function EditorWorkspace() {
  const [sourceLang, setSourceLang] = useState("cpp");
  const [targetLangs, setTargetLangs] = useState<string[]>(["python"]);
  const [inputCode, setInputCode] = useState("");
  const [outputCodes, setOutputCodes] = useState<Record<string, string>>({});
  const [explanation, setExplanation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputCode.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang,
          targetLangs,
          code: inputCode,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setOutputCodes(data.translations);
      setExplanation(data.explanation);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while communicating with the AI server.");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    // Only swap primary target
    const primaryTarget = targetLangs[0];
    setSourceLang(primaryTarget);
    
    const newTargets = [...targetLangs];
    newTargets[0] = sourceLang;
    setTargetLangs(newTargets);
    
    const tempCode = inputCode;
    setInputCode(outputCodes[primaryTarget] || "");
    
    const newOutputs = { ...outputCodes };
    newOutputs[sourceLang] = tempCode;
    setOutputCodes(newOutputs);
  };

  const addTargetLanguage = () => {
    if (targetLangs.length >= 2) return;
    const availableLangs = LANGUAGES.filter(l => !targetLangs.includes(l.value) && l.value !== sourceLang);
    if (availableLangs.length > 0) {
      setTargetLangs([...targetLangs, availableLangs[0].value]);
    }
  };

  const removeTargetLanguage = (index: number) => {
    if (targetLangs.length <= 1) return;
    const newTargets = [...targetLangs];
    newTargets.splice(index, 1);
    setTargetLangs(newTargets);
  };

  const updateTargetLanguage = (index: number, value: string) => {
    const newTargets = [...targetLangs];
    newTargets[index] = value;
    setTargetLangs(newTargets);
  };

  return (
    <div className="flex flex-col h-full w-full gap-6">
      {/* Sleek Horizontal Toolbar */}
      <div className="flex justify-center z-20">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 p-2 bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-4">
          
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-[10px] text-muted-foreground font-bold uppercase tracking-wider pr-1">Source</span>
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-[120px] md:w-[140px] bg-white/5 border-white/10 rounded-full focus:ring-1 focus:ring-primary/30 h-10">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={swapLanguages}
            disabled={targetLangs.length > 1}
            className="rounded-full h-10 w-10 hover:bg-white/10 hover:text-primary transition-colors shrink-0 disabled:opacity-30"
            title={targetLangs.length > 1 ? "Swap disabled in multi-target mode" : "Swap Languages"}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-wrap items-center gap-2 border-l border-white/10 pl-2 md:pl-4">
            <span className="hidden md:inline-block text-[10px] text-muted-foreground font-bold uppercase tracking-wider pr-1">Target</span>
            
            <AnimatePresence>
              {targetLangs.map((target, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, width: 0, scale: 0.8 }}
                  animate={{ opacity: 1, width: "auto", scale: 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.8 }}
                  className="flex items-center gap-1"
                >
                  <Select value={target} onValueChange={(val) => updateTargetLanguage(index, val)}>
                    <SelectTrigger className="w-[120px] md:w-[140px] bg-white/5 border-white/10 rounded-full focus:ring-1 focus:ring-primary/30 h-10">
                      <SelectValue placeholder="Target" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} disabled={targetLangs.includes(lang.value)}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {targetLangs.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeTargetLanguage(index)}
                      className="rounded-full h-8 w-8 hover:bg-destructive/20 hover:text-destructive shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {targetLangs.length < 2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={addTargetLanguage}
                className="rounded-full h-10 border-dashed border-white/20 hover:bg-white/10 shrink-0 gap-1 ml-1"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline-block text-xs">Add</span>
              </Button>
            )}
          </div>

          <div className="pl-2 ml-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !inputCode.trim()} 
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full h-10 px-4 md:px-6 relative overflow-hidden group border border-primary/50"
              >
                {isTranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 group-hover:text-amber-300 transition-colors" />
                )}
                <span className="font-bold tracking-wide">Translate</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
              </Button>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl mx-auto max-w-2xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Split Pane */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[500px]">
        
        {/* Input Editor */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative min-h-[400px]">
          <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-widest">{LANGUAGES.find(l => l.value === sourceLang)?.label} (Source)</span>
          </div>
          <div className="flex-1 p-0 relative">
            <Editor
              height="100%"
              language={sourceLang}
              theme="vs-dark"
              value={inputCode}
              onChange={(value) => setInputCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'var(--font-geist-mono)',
                wordWrap: "on",
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                overviewRulerBorder: false,
                lineNumbersMinChars: 4,
                renderLineHighlight: "all",
              }}
              loading={
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              }
            />
          </div>
        </div>

        {/* Output Editors */}
        <div className="flex-[1.5] flex flex-col md:flex-row gap-6">
          <AnimatePresence>
            {targetLangs.map((lang, index) => (
              <motion.div 
                key={lang + index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative min-h-[400px]"
              >
                <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-widest">{LANGUAGES.find(l => l.value === lang)?.label} (Target)</span>
                </div>
                <div className="flex-1 p-0 relative">
                  <Editor
                    height="100%"
                    language={lang}
                    theme="vs-dark"
                    value={outputCodes[lang] || ""}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'var(--font-geist-mono)',
                      wordWrap: "on",
                      padding: { top: 20 },
                      readOnly: true,
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      overviewRulerBorder: false,
                      lineNumbersMinChars: 4,
                    }}
                    loading={
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    }
                  />
                </div>
                
                {/* Overlay loading state */}
                <AnimatePresence>
                  {isTranslating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-10"
                    >
                      <div className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-semibold tracking-wide text-primary/80 animate-pulse">Translating logic...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Explanation Panel */}
      <AnimatePresence>
        {explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
              <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <div className="p-1.5 rounded-full bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">AI Explanation</h3>
              </div>
              <ScrollArea className="h-auto max-h-[400px]">
                <div className="p-6 md:p-8 text-sm leading-relaxed text-slate-300 prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-slate-100 prose-a:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {explanation}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
