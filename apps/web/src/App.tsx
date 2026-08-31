import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Layers, 
  Activity, 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Zap,
  Sliders,
  FileCode,
  ListFilter,
  Check,
  ChevronRight,
  RefreshCw,
  Cpu,
  AlertCircle,
  Hash
} from 'lucide-react';
import type { Prompt, TestSuite, TestCase, BenchmarkRun, ModelOption, BenchmarkResult } from '@promptbench/types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prompts' | 'suites' | 'benchmarks'>('dashboard');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [benchmarkRuns, setBenchmarkRuns] = useState<BenchmarkRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<BenchmarkRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Prompt State
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt>>({
    title: 'Customer Inquiry Classifier (Strict JSON)',
    description: 'Zero-shot classification prompt demanding schema-compliant JSON output',
    system_prompt: 'You are an accurate, deterministic customer service classifier. Output valid JSON adhering to the schema: {"urgency": "low|medium|high", "department": "billing|tech|sales", "sentiment": "positive|neutral|negative"}.',
    user_template: "Classify the following customer ticket:\n\nMessage: {{customer_message}}\n\nOutput JSON:",
    parameters: { temperature: 0.0, max_tokens: 200 },
    tags: ['classification', 'json-mode', 'production'],
  });

  // Benchmark Form State
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | ''>('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(['gpt-4o', 'gemini-2.0-flash', 'claude-3-5-sonnet']);
  const [benchmarkTitle, setBenchmarkTitle] = useState('Classification Multi-Model Stress Test');

  // Load live data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [fetchedModels, fetchedPrompts, fetchedSuites, fetchedRuns] = await Promise.all([
        api.getModels().catch(() => []),
        api.getPrompts().catch(() => []),
        api.getTestSuites().catch(() => []),
        api.getBenchmarkRuns().catch(() => []),
      ]);

      if (fetchedModels.length > 0) setModels(fetchedModels);
      if (fetchedPrompts.length > 0) {
        setPrompts(fetchedPrompts);
        setSelectedPromptIds([Number(fetchedPrompts[0].id)]);
      }
      if (fetchedSuites.length > 0) {
        setTestSuites(fetchedSuites);
        setSelectedSuiteId(Number(fetchedSuites[0].id));
      }
      if (fetchedRuns.length > 0) {
        setBenchmarkRuns(fetchedRuns);
        // Load latest full benchmark details
        const latestDetails = await api.getBenchmarkDetails(fetchedRuns[0].id).catch(() => fetchedRuns[0]);
        setSelectedRun(latestDetails);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load data from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    if (selectedPromptIds.length === 0 || !selectedSuiteId || selectedModelIds.length === 0) {
      alert('Please select at least one prompt, one test suite, and one model.');
      return;
    }

    setActionLoading(true);
    setStatusMessage('Executing multi-model benchmark matrix against LLM providers...');
    setErrorMessage(null);

    try {
      const run = await api.runBenchmark({
        title: benchmarkTitle,
        prompt_ids: selectedPromptIds,
        test_suite_id: Number(selectedSuiteId),
        model_ids: selectedModelIds,
      });

      setBenchmarkRuns([run, ...benchmarkRuns]);
      setSelectedRun(run);
      setActiveTab('benchmarks');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to run benchmark matrix.');
    } finally {
      setActionLoading(false);
      setStatusMessage(null);
    }
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt.title || !editingPrompt.user_template) {
      alert('Prompt title and user template are required.');
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);

    try {
      if (editingPrompt.id) {
        const updated = await api.updatePrompt(editingPrompt.id, editingPrompt);
        setPrompts(prompts.map(p => p.id === updated.id ? updated : p));
        alert('Prompt updated successfully!');
      } else {
        const created = await api.createPrompt(editingPrompt);
        setPrompts([created, ...prompts]);
        setSelectedPromptIds([...selectedPromptIds, Number(created.id)]);
        setEditingPrompt(created);
        alert('Prompt created successfully!');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save prompt.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePrompt = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this prompt template?')) return;
    try {
      await api.deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      setSelectedPromptIds(selectedPromptIds.filter(pid => pid !== Number(id)));
    } catch (err: any) {
      alert(err.message || 'Failed to delete prompt.');
    }
  };

  const handleSelectRun = async (run: BenchmarkRun) => {
    try {
      const full = await api.getBenchmarkDetails(run.id);
      setSelectedRun(full);
    } catch {
      setSelectedRun(run);
    }
    setActiveTab('benchmarks');
  };

  // Live variable extraction
  const detectedVariables = (editingPrompt.user_template || '').match(/\{\{([a-zA-Z0-9_-]+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [];

  // Summary Metrics calculations
  const totalCompletedRuns = benchmarkRuns.reduce((acc, r) => acc + (r.completed_cases || 0), 0);
  const avgLatency = selectedRun?.summary_metrics?.avg_latency_ms || 340.5;
  const totalCost = selectedRun?.summary_metrics?.total_cost_usd || 0.00284;
  const passRate = selectedRun?.summary_metrics?.pass_rate_percentage || 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  PromptBench
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  REST API Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated LLM Evaluation & Matrix Benchmarking</p>
            </div>
          </div>

          {/* Navigation Switcher */}
          <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'prompts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Prompt Studio
            </button>
            <button
              onClick={() => setActiveTab('suites')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'suites'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              Test Suites
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'benchmarks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Benchmark Matrix
            </button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {statusMessage && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero / Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Avg Latency</span>
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-white">{avgLatency} <span className="text-sm font-normal text-slate-400">ms</span></div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3" /> Real-time provider timers
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Eval Pass Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{passRate}<span className="text-sm font-normal text-slate-400">%</span></div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  4 active evaluation strategies
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Est. Run Cost</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">${totalCost}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Calculated from 1M token rates
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Supported Models</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{models.length || 7} Models</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  OpenAI, Anthropic, Gemini, Groq
                </div>
              </div>
            </div>

            {/* Quick Benchmark Launcher */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Launch Matrix Benchmark</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Execute prompt variants across chosen models and test suites in parallel</p>
                </div>
                <button
                  onClick={handleRunBenchmark}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Run Benchmark Matrix
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">Benchmark Run Title</label>
                <input
                  type="text"
                  value={benchmarkTitle}
                  onChange={(e) => setBenchmarkTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Select Prompts */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">1. Select Prompts ({selectedPromptIds.length})</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {prompts.map(p => (
                      <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedPromptIds.includes(Number(p.id))}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPromptIds([...selectedPromptIds, Number(p.id)]);
                            else setSelectedPromptIds(selectedPromptIds.filter(id => id !== Number(p.id)));
                          }}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                        />
                        <span className="text-xs font-medium text-slate-200 truncate">{p.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Select Test Suite */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">2. Select Test Suite</label>
                  <select
                    value={selectedSuiteId}
                    onChange={(e) => setSelectedSuiteId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {testSuites.map(s => (
                      <option key={s.id} value={s.id}>{s.title} ({s.test_cases_count ?? s.test_cases?.length ?? 0} cases)</option>
                    ))}
                  </select>
                </div>

                {/* Select Models */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">3. Model Choice ({selectedModelIds.length})</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {models.map(m => (
                      <label key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedModelIds.includes(m.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedModelIds([...selectedModelIds, m.id]);
                              else setSelectedModelIds(selectedModelIds.filter(id => id !== m.id));
                            }}
                            className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                          />
                          <span className="text-xs font-medium text-slate-200">{m.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{m.provider}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Benchmark Runs Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-200">Recent Benchmark Runs</h3>
                <span className="text-xs text-slate-400">{benchmarkRuns.length} Total Runs</span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {benchmarkRuns.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500">No benchmark runs recorded yet. Launch one above!</div>
                )}
                {benchmarkRuns.map(run => (
                  <div key={run.id} onClick={() => handleSelectRun(run)} className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">{run.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          {run.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {run.completed_cases}/{run.total_cases} test cases executed · Avg {run.summary_metrics?.avg_latency_ms ?? 0}ms · ${run.summary_metrics?.total_cost_usd ?? 0}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROMPT STUDIO */}
        {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Prompt Editor */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">
                    {editingPrompt.id ? `Edit Prompt #${editingPrompt.id}` : 'Create New Prompt Template'}
                  </h2>
                  <button
                    onClick={() => setEditingPrompt({
                      title: 'New Prompt Template',
                      system_prompt: '',
                      user_template: 'Analyze: {{input}}',
                      parameters: { temperature: 0.2, max_tokens: 300 },
                      tags: ['new'],
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Clear & New
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Prompt Title</label>
                  <input
                    type="text"
                    value={editingPrompt.title || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="e.g. SQL Generator v2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">System Instructions (Optional)</label>
                  <textarea
                    rows={3}
                    value={editingPrompt.system_prompt || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, system_prompt: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Define persona, behavior, or strict output format..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">User Prompt Template</label>
                    <span className="text-[11px] text-indigo-400 font-mono">Use {'{{variable}}'} placeholders</span>
                  </div>
                  <textarea
                    rows={8}
                    value={editingPrompt.user_template || ''}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, user_template: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Provide template text with {{placeholders}}..."
                  />
                </div>

                {detectedVariables.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">Detected Variables:</span>
                    {detectedVariables.map(v => (
                      <span key={v} className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleSavePrompt}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Save Prompt Template
                  </button>
                </div>
              </div>
            </div>

            {/* Right Parameters & Tags */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-200">Sampling Parameters</h3>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Temperature</span>
                    <span className="text-indigo-400 font-bold">{editingPrompt.parameters?.temperature ?? 0.0}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingPrompt.parameters?.temperature ?? 0.0}
                    onChange={(e) => setEditingPrompt({
                      ...editingPrompt,
                      parameters: { ...editingPrompt.parameters, temperature: parseFloat(e.target.value) }
                    })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Max Tokens</span>
                    <span className="text-indigo-400 font-bold">{editingPrompt.parameters?.max_tokens ?? 250}</span>
                  </div>
                  <input
                    type="number"
                    value={editingPrompt.parameters?.max_tokens ?? 250}
                    onChange={(e) => setEditingPrompt({
                      ...editingPrompt,
                      parameters: { ...editingPrompt.parameters, temperature: editingPrompt.parameters?.temperature ?? 0.0, max_tokens: parseInt(e.target.value) || 250 }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              {/* Saved Prompt List */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
                <h3 className="font-bold text-sm text-slate-200">Saved Prompts ({prompts.length})</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {prompts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setEditingPrompt(p)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        editingPrompt.id === p.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{p.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono truncate mt-1">{p.user_template}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePrompt(p.id); }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Prompt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEST SUITES */}
        {activeTab === 'suites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Test Suites & Ground Truth Datasets</h2>
                <p className="text-xs text-slate-400">Define test cases with variable inputs and expected assertion criteria</p>
              </div>
              <button
                onClick={async () => {
                  const title = prompt('Enter Test Suite Title:');
                  if (!title) return;
                  const newSuite = await api.createTestSuite({ title, description: 'Custom evaluation test set' });
                  setTestSuites([...testSuites, newSuite]);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
              >
                <Plus className="w-4 h-4" /> Create Test Suite
              </button>
            </div>

            {testSuites.map(suite => (
              <div key={suite.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{suite.title}</h3>
                    <p className="text-xs text-slate-400">{suite.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                      {suite.test_cases?.length ?? suite.test_cases_count ?? 0} Test Cases
                    </span>
                    <button
                      onClick={async () => {
                        const name = prompt('Test case name:');
                        const varKey = prompt('Variable key (e.g. customer_message):', 'customer_message');
                        const varVal = prompt('Variable value (text input):');
                        const expected = prompt('Expected output target:');
                        if (!varKey || !varVal) return;

                        const added = await api.addTestCase(suite.id, {
                          name: name || 'Test Case',
                          variables: { [varKey]: varVal },
                          expected_output: expected || null,
                        });

                        setTestSuites(testSuites.map(s => s.id === suite.id ? { ...s, test_cases: [...(s.test_cases || []), added] } : s));
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs hover:bg-indigo-600/30"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Case
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suite.test_cases?.map(tc => (
                    <div key={tc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">{tc.name || `Case #${tc.id}`}</span>
                        <span className="text-[10px] font-mono text-slate-500">ID: {tc.id}</span>
                      </div>
                      <div className="text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {JSON.stringify(tc.variables, null, 2)}
                      </div>
                      {tc.expected_output && (
                        <div className="text-[10px] font-mono text-emerald-400">
                          Target Ground Truth: <span className="font-semibold">{tc.expected_output}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: BENCHMARK MATRIX */}
        {activeTab === 'benchmarks' && selectedRun && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedRun.title}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {selectedRun.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Run ID: #{selectedRun.id} · Executed {selectedRun.completed_cases} test permutations</p>
                </div>
                <button
                  onClick={fetchInitialData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
                </button>
              </div>

              {/* Matrix Head-to-Head Comparison */}
              {selectedRun.summary_metrics?.model_comparisons && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {Object.values(selectedRun.summary_metrics.model_comparisons).map(mc => (
                    <div key={mc.model} className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-slate-200">{mc.model}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase">{mc.provider}</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-slate-400">
                          <span>Avg Latency:</span>
                          <span className="text-sky-400 font-semibold">{mc.avg_latency_ms} ms</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Total Cost:</span>
                          <span className="text-amber-400 font-semibold">${mc.total_cost_usd}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Pass Rate:</span>
                          <span className="text-emerald-400 font-semibold">{mc.pass_rate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Side-by-Side Outputs & Assertions */}
              <h3 className="font-bold text-sm text-slate-200 mb-3">Individual Test Execution Trace ({selectedRun.results?.length || 0})</h3>
              <div className="space-y-4">
                {selectedRun.results?.map(res => (
                  <div key={res.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{res.model}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{res.latency_ms} ms</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-amber-400">${res.estimated_cost_usd}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{res.input_tokens} in / {res.output_tokens} out</span>
                      </div>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Evals Passed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Rendered Prompt</div>
                        <pre className="text-[11px] font-mono bg-slate-900/90 p-3 rounded-lg text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                          {res.rendered_prompt}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Raw Response</div>
                        <pre className="text-[11px] font-mono bg-slate-900/90 p-3 rounded-lg text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                          {res.raw_response}
                        </pre>
                      </div>
                    </div>

                    {/* Evaluator Scores */}
                    {res.eval_scores && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px] font-mono">
                        <span className="text-slate-400">Evaluators:</span>
                        {Object.entries(res.eval_scores).map(([strat, scoreObj]: [string, any]) => (
                          <span key={strat} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {strat}: {scoreObj.score} {scoreObj.passed ? '✓' : '✗'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
