import React from 'react';
import { Head } from '@inertiajs/react';
import { Sparkles, Terminal, Activity, Layers } from 'lucide-react';

interface Props {
    appName?: string;
    version?: string;
}

export default function Dashboard({ appName = 'PromptBench', version = '1.0.0' }: Props) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <Head title="AI Benchmarking & Prompt Evaluation" />

            {/* Top Navigation */}
            <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                {appName}
                            </span>
                            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                v{version}
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 shadow-2xl">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            System Ready · Laravel 11 + React + Inertia
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                            Prompt Evaluation & LLM Benchmarking
                        </h1>
                        <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
                            Evaluate prompt variants, compare LLM responses side-by-side, score quality, latency, token consumption, and cost across OpenAI, Anthropic, Gemini, and local models.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                            <Terminal className="w-5 h-5 text-indigo-400 mb-2" />
                            <h3 className="font-semibold text-slate-200 text-sm">Prompt Variants</h3>
                            <p className="text-xs text-slate-400 mt-1">Iterate with parameter controls, system instructions, and variables.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                            <Activity className="w-5 h-5 text-purple-400 mb-2" />
                            <h3 className="font-semibold text-slate-200 text-sm">Automated Evaluators</h3>
                            <p className="text-xs text-slate-400 mt-1">Exact match, regex schemas, JSON validation, and LLM-as-a-judge.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                            <Layers className="w-5 h-5 text-sky-400 mb-2" />
                            <h3 className="font-semibold text-slate-200 text-sm">Multi-Model Matrix</h3>
                            <p className="text-xs text-slate-400 mt-1">Benchmark latency, token counts, and cost side-by-side.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
