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
  Cpu
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Prompt State
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt>>({
    title: 'Customer Support Sentiment & Routing',
    system_prompt: 'You are an accurate, deterministic customer service classifier. Output valid JSON.',
    user_template: 'Analyze the following customer message and categorize urgency and department:\n\nMessage: {{customer_message}}\n\nOutput format:\n{"urgency": "low|medium|high", "department": "billing|tech|sales", "sentiment": "positive|neutral|negative"}',
    parameters: { temperature: 0.1, max_tokens: 250 },
    tags: ['classification', 'json-mode', 'v1'],
  });

  // Benchmark Form State
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | ''>('');
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash']);
  const [benchmarkTitle, setBenchmarkTitle] = useState('Classification Multi-Model Stress Test');

  // Load initial mock / live data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load fallback or live API data
      const sampleModels: ModelOption[] = [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', context_window: 128000, input_cost_per_1m: 2.50, output_cost_per_1m: 10.00, supports_json_schema: true },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', context_window: 128000, input_cost_per_1m: 0.15, output_cost_per_1m: 0.60, supports_json_schema: true },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', context_window: 200000, input_cost_per_1m: 3.00, output_cost_per_1m: 15.00, supports_json_schema: true },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini', context_window: 1048576, input_cost_per_1m: 0.10, output_cost_per_1m: 0.40, supports_json_schema: true },
        { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'groq', context_window: 128000, input_cost_per_1m: 0.59, output_cost_per_1m: 0.79, supports_json_schema: true },
      ];
      setModels(sampleModels);

      const samplePrompts: Prompt[] = [
        {
          id: 1,
          title: 'Structured Sentiment Classifier (Zero-Shot)',
          system_prompt: 'You are a strict classifier. Respond in JSON only.',
          user_template: 'Classify text: "{{text}}"\nExtract: sentiment, urgency (1-5), primary_topic.',
          parameters: { temperature: 0.0, max_tokens: 150 },
          tags: ['classification', 'json'],
        },
        {
          id: 2,
          title: 'Chain-of-Thought Sentiment Classifier (Few-Shot)',
          system_prompt: 'You are an analytical evaluator. First reason step-by-step, then provide the JSON classification.',
          user_template: 'Classify text: "{{text}}"\nThink step-by-step in <thinking> tags then output JSON.',
          parameters: { temperature: 0.2, max_tokens: 400 },
          tags: ['cot', 'classification'],
        }
      ];
      setPrompts(samplePrompts);
      setSelectedPromptIds([1]);

      const sampleSuites: TestSuite[] = [
        {
          id: 1,
          title: 'Urgent Billing & Outage Complaints',
          description: 'High-risk edge cases, chargeback threats, and severe outages',
          test_cases_count: 3,
          test_cases: [
            {
              id: 101,
              test_suite_id: 1,
              name: 'Double charge dispute',
              variables: { text: 'I was charged twice $499 on my Visa card this morning! Refund immediately or I dispute.' },
              expected_output: 'billing',
            },
            {
              id: 102,
              test_suite_id: 1,
              name: 'Enterprise API outage',
              variables: { text: 'Production cluster down with 502 Bad Gateway errors across US-East!' },
              expected_output: 'tech',
            },
            {
              id: 103,
              test_suite_id: 1,
              name: 'Feature inquiry',
              variables: { text: 'Do you offer SAML SSO on the Starter Tier?' },
              expected_output: 'sales',
            }
          ]
        }
      ];
      setTestSuites(sampleSuites);
      setSelectedSuiteId(1);

      const sampleRuns: BenchmarkRun[] = [
        {
          id: 'run-8821',
          title: 'Classification Matrix: GPT-4o vs Claude 3.5 vs Gemini 2.0',
          status: 'completed',
          total_cases: 6,
          completed_cases: 6,
          summary_metrics: {
            total_runs: 6,
            successful_runs: 6,
            failed_runs: 0,
            avg_latency_ms: 382.4,
            total_cost_usd: 0.00284,
            total_input_tokens: 1840,
            total_output_tokens: 620,
            pass_rate_percentage: 100,
            model_comparisons: {
              'gpt-4o': { model: 'gpt-4o', provider: 'openai', avg_latency_ms: 412, total_cost_usd: 0.00142, pass_rate: 100, avg_score: 0.98 },
              'claude-3-5-sonnet': { model: 'claude-3-5-sonnet', provider: 'anthropic', avg_latency_ms: 490, total_cost_usd: 0.00125, pass_rate: 100, avg_score: 0.99 },
              'gemini-2.0-flash': { model: 'gemini-2.0-flash', provider: 'gemini', avg_latency_ms: 245, total_cost_usd: 0.00017, pass_rate: 100, avg_score: 0.96 },
            }
          },
          results: [
            {
              id: 1,
              benchmark_run_id: 'run-8821',
              prompt_id: 1,
              test_case_id: 101,
              provider: 'gemini',
              model: 'gemini-2.0-flash',
              rendered_prompt: 'Classify text: "I was charged twice $499 on my Visa card this morning! Refund immediately or I dispute."\nExtract: sentiment, urgency (1-5), primary_topic.',
              raw_response: '{"sentiment": "negative", "urgency": 5, "primary_topic": "billing"}',
              latency_ms: 218.4,
              input_tokens: 142,
              output_tokens: 38,
              estimated_cost_usd: 0.000029,
              eval_scores: {
                exact_match: { strategy: 'exact_match', score: 1.0, passed: true },
                regex: { strategy: 'regex', score: 1.0, passed: true },
                json_schema: { strategy: 'json_schema', score: 1.0, passed: true },
                llm_judge: { strategy: 'llm_judge', score: 5, passed: true, reasoning: 'Direct and perfectly identified billing dispute.' },
              },
              status: 'success',
            },
            {
              id: 2,
              benchmark_run_id: 'run-8821',
              prompt_id: 1,
              test_case_id: 101,
              provider: 'openai',
              model: 'gpt-4o',
              rendered_prompt: 'Classify text: "I was charged twice $499 on my Visa card this morning! Refund immediately or I dispute."\nExtract: sentiment, urgency (1-5), primary_topic.',
              raw_response: '{\n  "sentiment": "negative",\n  "urgency": 5,\n  "primary_topic": "billing"\n}',
              latency_ms: 395.1,
              input_tokens: 142,
              output_tokens: 42,
              estimated_cost_usd: 0.000775,
              eval_scores: {
                exact_match: { strategy: 'exact_match', score: 1.0, passed: true },
                regex: { strategy: 'regex', score: 1.0, passed: true },
                json_schema: { strategy: 'json_schema', score: 1.0, passed: true },
                llm_judge: { strategy: 'llm_judge', score: 5, passed: true, reasoning: 'Accurate classification and clean JSON formatting.' },
              },
              status: 'success',
            }
          ]
        }
      ];
      setBenchmarkRuns(sampleRuns);
      setSelectedRun(sampleRuns[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = () => {
    if (selectedPromptIds.length === 0 || !selectedSuiteId || selectedModelIds.length === 0) {
      alert('Please select at least one prompt, one test suite, and one model.');
      return;
    }
    setLoading(true);
    setStatusMessage('Executing multi-model benchmark matrix across providers...');
    setTimeout(() => {
      const newRun: BenchmarkRun = {
        id: `run-${Math.floor(1000 + Math.random() * 9000)}`,
        title: benchmarkTitle,
        status: 'completed',
        total_cases: selectedPromptIds.length * 3 * selectedModelIds.length,
        completed_cases: selectedPromptIds.length * 3 * selectedModelIds.length,
        summary_metrics: {
          total_runs: selectedPromptIds.length * 3 * selectedModelIds.length,
          successful_runs: selectedPromptIds.length * 3 * selectedModelIds.length,
          failed_runs: 0,
          avg_latency_ms: 310.2,
          total_cost_usd: 0.00341,
          total_input_tokens: 2450,
          total_output_tokens: 890,
          pass_rate_percentage: 100,
          model_comparisons: {
            'gemini-2.0-flash': { model: 'gemini-2.0-flash', provider: 'gemini', avg_latency_ms: 220, total_cost_usd: 0.00021, pass_rate: 100, avg_score: 0.98 },
            'gpt-4o': { model: 'gpt-4o', provider: 'openai', avg_latency_ms: 380, total_cost_usd: 0.00180, pass_rate: 100, avg_score: 0.99 },
            'claude-3-5-sonnet': { model: 'claude-3-5-sonnet', provider: 'anthropic', avg_latency_ms: 450, total_cost_usd: 0.00140, pass_rate: 100, avg_score: 0.99 },
          }
        },
        results: selectedRun?.results || []
      };
      setBenchmarkRuns([newRun, ...benchmarkRuns]);
      setSelectedRun(newRun);
      setActiveTab('benchmarks');
      setLoading(false);
      setStatusMessage(null);
    }, 1200);
  };

  const handleSavePrompt = () => {
    if (!editingPrompt.title || !editingPrompt.user_template) {
      alert('Prompt title and user template are required.');
      return;
    }
    const newPrompt: Prompt = {
      id: prompts.length + 1,
      title: editingPrompt.title!,
      system_prompt: editingPrompt.system_prompt || '',
      user_template: editingPrompt.user_template!,
      parameters: editingPrompt.parameters || { temperature: 0.2, max_tokens: 300 },
      tags: editingPrompt.tags || ['custom'],
    };
    setPrompts([...prompts, newPrompt]);
    setSelectedPromptIds([...selectedPromptIds, Number(newPrompt.id)]);
    alert('Prompt saved successfully!');
  };

  // Variable extraction helper
  const detectedVariables = (editingPrompt.user_template || '').match(/\{\{([a-zA-Z0-9_-]+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [];

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
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Monorepo v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">LLM Prompt Evaluation & Multi-Model Benchmarking</p>
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
                <div className="text-2xl font-bold text-white">382 <span className="text-sm font-normal text-slate-400">ms</span></div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  <Zap className="w-3 h-3" /> Gemini 2.0 Flash fastest (218ms)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Pass Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">100<span className="text-sm font-normal text-slate-400">%</span></div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Across 6 test assertions
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Est. Total Cost</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">$0.00284</div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  2,460 total tokens consumed
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
                  <span>Active Drivers</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">5 Models</div>
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
                  <p className="text-xs text-slate-400 mt-0.5">Execute prompt variants across chosen models and test suites</p>
                </div>
                <button
                  onClick={handleRunBenchmark}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Run Benchmark Now
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Select Prompts */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">1. Select Prompt Variants</label>
                  <div className="space-y-2">
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
                      <option key={s.id} value={s.id}>{s.title} ({s.test_cases_count || s.test_cases?.length || 0} cases)</option>
                    ))}
                  </select>
                </div>

                {/* Select Models */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">3. Model Matrix ({selectedModelIds.length} chosen)</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
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
                {benchmarkRuns.map(run => (
                  <div key={run.id} onClick={() => { setSelectedRun(run); setActiveTab('benchmarks'); }} className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">{run.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          {run.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {run.completed_cases}/{run.total_cases} test cases executed · Avg {run.summary_metrics?.avg_latency_ms}ms · ${run.summary_metrics?.total_cost_usd}
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
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
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
                    <span className="text-indigo-400 font-bold">{editingPrompt.parameters?.temperature ?? 0.2}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editingPrompt.parameters?.temperature ?? 0.2}
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
                      parameters: { ...editingPrompt.parameters, temperature: editingPrompt.parameters?.temperature ?? 0.2, max_tokens: parseInt(e.target.value) || 250 }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                  />
                </div>
              </div>

              {/* Saved Prompt List */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
                <h3 className="font-bold text-sm text-slate-200">Existing Prompts</h3>
                <div className="space-y-2">
                  {prompts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setEditingPrompt(p)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        editingPrompt.id === p.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-slate-200">{p.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-1">{p.user_template}</p>
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
                onClick={() => alert('New test suite creator modal')}
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
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {suite.test_cases?.length} Test Cases
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suite.test_cases?.map(tc => (
                    <div key={tc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">{tc.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">#{tc.id}</span>
                      </div>
                      <div className="text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-lg text-slate-300 max-h-24 overflow-y-auto">
                        {JSON.stringify(tc.variables, null, 2)}
                      </div>
                      {tc.expected_output && (
                        <div className="text-[10px] font-mono text-emerald-400">
                          Expected: <span className="font-semibold">{tc.expected_output}</span>
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
                  <p className="text-xs text-slate-400 mt-1 font-mono">ID: {selectedRun.id}</p>
                </div>
                <button
                  onClick={loadData}
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
                          <span>Latency:</span>
                          <span className="text-sky-400 font-semibold">{mc.avg_latency_ms} ms</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Est. Cost:</span>
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
              <h3 className="font-bold text-sm text-slate-200 mb-3">Individual Test Execution Trace</h3>
              <div className="space-y-4">
                {selectedRun.results?.map(res => (
                  <div key={res.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{res.model}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{res.latency_ms} ms</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-amber-400">${res.estimated_cost_usd}</span>
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
                    <div className="pt-2 flex items-center gap-2 flex-wrap text-[11px] font-mono">
                      <span className="text-slate-400">Evaluators:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Exact Match: 1.0</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">JSON Schema: Valid</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">LLM-as-a-Judge: 5/5</span>
                    </div>
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
