import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, X, Loader2, AlertTriangle,
  Info, Shield, Pill, Zap, BookOpen, FlaskConical, ChevronDown,
  ChevronUp, Sparkles, FileImage, HeartPulse
} from 'lucide-react';

// ─── TypeScript Interfaces ──────────────────────────────────────────────────

interface AIExtraction {
  medicine_name: string;
  generic_name: string;
  dosage: string;
  medicine_type: string;
  confidence: 'high' | 'medium' | 'low';
  cleaned_ocr_text: string;
}

interface FDAInfo {
  found: boolean;
  brand_names: string[];
  manufacturer: string;
  uses: string;
  dosage: string;
  warnings: string;
  side_effects: string;
  precautions: string;
  drug_interactions: string;
  description: string;
}

interface AnalysisResult {
  success: boolean;
  raw_ocr_text: string;
  ai_extraction: AIExtraction;
  fda_info: FDAInfo;
  simple_explanation: string;
  reminder_compatible: boolean;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: string }) {
  const config = {
    high: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'High Confidence' },
    medium: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', label: 'Medium Confidence' },
    low: { color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Low Confidence' },
  }[level] ?? { color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', label: 'Unknown' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
}

function InfoCard({
  icon: Icon,
  title,
  content,
  color = 'purple',
  collapsible = false
}: {
  icon: any;
  title: string;
  content: string;
  color?: string;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);

  const colors: Record<string, string> = {
    purple: 'text-brand-purple border-brand-purple/20 bg-brand-purple/5',
    neon: 'text-brand-neon border-brand-neon/20 bg-brand-neon/5',
    amber: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
    red: 'text-red-400 border-red-400/20 bg-red-400/5',
    emerald: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    blue: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
  };

  const cls = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${cls}`}
    >
      <button
        className="w-full flex items-center justify-between gap-3 text-left"
        onClick={() => collapsible && setOpen(p => !p)}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
        </div>
        {collapsible && (
          open ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {content || 'Not available'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AIVerification() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP, etc.)');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const stages = [
      '🔍 Running EasyOCR on image...',
      '🤖 Gemini AI analyzing medicine...',
      '🏥 Fetching FDA drug database...',
      '💬 Generating simple explanation...',
    ];

    let stageIdx = 0;
    setStage(stages[0]);
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1);
      setStage(stages[stageIdx]);
    }, 3500);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch('http://localhost:8000/api/medicine-verify/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.detail || `Server error ${resp.status}`);
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stageTimer);
      setIsAnalyzing(false);
      setStage('');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-neon flex items-center justify-center purple-glow">
            <FlaskConical size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">AI Medicine Verify</h1>
            <p className="text-text-secondary text-sm">Upload a medicine image — AI identifies it instantly</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Upload Panel ── */}
        <div className="space-y-5">
          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
              ${isDragging
                ? 'border-brand-neon bg-brand-neon/5 scale-[1.01]'
                : preview
                  ? 'border-brand-purple/50 bg-brand-purple/5'
                  : 'border-border-subtle bg-bg-secondary hover:border-brand-purple/50 hover:bg-brand-purple/5'
              }`}
            style={{ minHeight: 320 }}
          >
            {preview ? (
              <div className="relative w-full h-80">
                <img src={preview} alt="Medicine upload" className="w-full h-full object-contain p-4" />
                <button
                  onClick={e => { e.stopPropagation(); reset(); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 gap-4 p-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-purple/20 to-brand-neon/20 flex items-center justify-center border border-brand-purple/20">
                  <FileImage size={36} className="text-brand-neon" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg mb-1">Drop medicine image here</p>
                  <p className="text-text-secondary text-sm">or click to browse</p>
                  <p className="text-text-muted text-xs mt-2">Supports: tablet strips, bottles, prescriptions, packages</p>
                </div>
                <div className="flex gap-3 text-xs text-text-muted">
                  <span className="px-3 py-1 rounded-full border border-border-subtle">JPG</span>
                  <span className="px-3 py-1 rounded-full border border-border-subtle">PNG</span>
                  <span className="px-3 py-1 rounded-full border border-border-subtle">WEBP</span>
                </div>
              </div>
            )}
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!file || isAnalyzing}
            onClick={analyze}
            className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-brand-purple to-brand-neon shadow-[0_0_30px_rgba(112,0,255,0.35)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>{stage || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Analyze Medicine with AI</span>
              </>
            )}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
              >
                <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature Pills */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Camera, label: 'EasyOCR', desc: 'Blurry & rotated text' },
              { icon: Sparkles, label: 'Gemini AI', desc: 'Medicine identification' },
              { icon: HeartPulse, label: 'OpenFDA', desc: 'Official drug data' },
              { icon: BookOpen, label: 'Simple language', desc: 'Elderly-friendly' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-brand-purple/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-brand-purple" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{label}</p>
                  <p className="text-text-muted text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Results Panel ── */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {isAnalyzing && !result && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-80 gap-6 bg-bg-secondary rounded-3xl border border-border-subtle"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FlaskConical size={24} className="text-brand-neon" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold mb-1">AI Analysis in Progress</p>
                  <p className="text-brand-neon text-sm animate-pulse">{stage}</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Medicine Header Card */}
                <div className="bg-gradient-to-br from-brand-purple/15 to-brand-neon/10 border border-brand-purple/20 rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill size={16} className="text-brand-neon" />
                        <span className="text-brand-neon text-xs font-bold uppercase tracking-wider">
                          {result.ai_extraction.medicine_type}
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-white leading-tight">
                        {result.ai_extraction.medicine_name}
                      </h2>
                      <p className="text-text-secondary text-sm mt-1">
                        Generic: <span className="text-brand-neon font-semibold">{result.ai_extraction.generic_name}</span>
                      </p>
                    </div>
                    <ConfidenceBadge level={result.ai_extraction.confidence} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-text-muted text-xs mb-0.5">Dosage</p>
                      <p className="text-white font-bold text-sm">{result.ai_extraction.dosage}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-text-muted text-xs mb-0.5">FDA Database</p>
                      <p className={`font-bold text-sm ${result.fda_info.found ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {result.fda_info.found ? '✓ Verified' : '⚠ Not found'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simple Explanation (for elderly) */}
                <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wide">AI Simple Explanation</span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed italic">
                    "{result.simple_explanation}"
                  </p>
                </div>

                {/* Detail Cards */}
                <InfoCard icon={Info} title="Uses & Indications" content={result.fda_info.uses} color="neon" />
                <InfoCard icon={Pill} title="Dosage Instructions" content={result.fda_info.dosage} color="blue" collapsible />
                <InfoCard icon={AlertTriangle} title="Warnings" content={result.fda_info.warnings} color="amber" collapsible />
                <InfoCard icon={Shield} title="Side Effects" content={result.fda_info.side_effects} color="red" collapsible />
                <InfoCard icon={Zap} title="Drug Interactions" content={result.fda_info.drug_interactions} color="purple" collapsible />
                <InfoCard icon={BookOpen} title="Precautions" content={result.fda_info.precautions} color="emerald" collapsible />

                {/* Raw OCR */}
                <details className="group">
                  <summary className="cursor-pointer text-xs text-text-muted hover:text-text-secondary p-3 bg-bg-secondary rounded-xl border border-border-subtle flex items-center gap-2">
                    <FlaskConical size={13} />
                    View Raw OCR Text
                  </summary>
                  <pre className="mt-2 p-4 bg-bg-surface rounded-xl text-xs text-text-muted overflow-auto max-h-40 leading-relaxed whitespace-pre-wrap">
                    {result.raw_ocr_text}
                  </pre>
                </details>

                {/* Re-analyze button */}
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl border border-border-subtle hover:border-brand-purple/50 text-text-secondary hover:text-white transition-all text-sm font-bold"
                >
                  Analyze Another Medicine
                </button>
              </motion.div>
            )}

            {!isAnalyzing && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-80 gap-4 bg-bg-secondary rounded-3xl border border-dashed border-border-subtle text-center p-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
                  <FlaskConical size={28} className="text-brand-purple/50" />
                </div>
                <p className="text-text-secondary font-semibold">Upload a medicine image to get started</p>
                <p className="text-text-muted text-xs">AI will identify the medicine, fetch FDA data,<br />and explain it in simple language</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
