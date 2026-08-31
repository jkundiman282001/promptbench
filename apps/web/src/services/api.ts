import axios from 'axios';
import type { Prompt, TestSuite, TestCase, BenchmarkRun, BenchmarkResult, ModelOption, ApiResponse } from '@promptbench/types';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const api = {
  // Prompts
  getPrompts: async (): Promise<Prompt[]> => {
    const res = await apiClient.get<ApiResponse<Prompt[]>>('/prompts');
    return res.data.data;
  },
  createPrompt: async (data: Partial<Prompt>): Promise<Prompt> => {
    const res = await apiClient.post<ApiResponse<Prompt>>('/prompts', data);
    return res.data.data;
  },
  updatePrompt: async (id: number | string, data: Partial<Prompt>): Promise<Prompt> => {
    const res = await apiClient.put<ApiResponse<Prompt>>(`/prompts/${id}`, data);
    return res.data.data;
  },
  deletePrompt: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/prompts/${id}`);
  },

  // Test Suites
  getTestSuites: async (): Promise<TestSuite[]> => {
    const res = await apiClient.get<ApiResponse<TestSuite[]>>('/test-suites');
    return res.data.data;
  },
  createTestSuite: async (data: Partial<TestSuite>): Promise<TestSuite> => {
    const res = await apiClient.post<ApiResponse<TestSuite>>('/test-suites', data);
    return res.data.data;
  },
  addTestCase: async (suiteId: number | string, data: Partial<TestCase>): Promise<TestCase> => {
    const res = await apiClient.post<ApiResponse<TestCase>>(`/test-suites/${suiteId}/cases`, data);
    return res.data.data;
  },

  // Models
  getModels: async (): Promise<ModelOption[]> => {
    const res = await apiClient.get<ApiResponse<ModelOption[]>>('/models');
    return res.data.data;
  },

  // Benchmarks
  getBenchmarkRuns: async (): Promise<BenchmarkRun[]> => {
    const res = await apiClient.get<ApiResponse<BenchmarkRun[]>>('/benchmarks');
    return res.data.data;
  },
  runBenchmark: async (payload: {
    title: string;
    prompt_ids: (number | string)[];
    test_suite_id: number | string;
    model_ids: string[];
  }): Promise<BenchmarkRun> => {
    const res = await apiClient.post<ApiResponse<BenchmarkRun>>('/benchmarks/run', payload);
    return res.data.data;
  },
  getBenchmarkDetails: async (id: number | string): Promise<BenchmarkRun> => {
    const res = await apiClient.get<ApiResponse<BenchmarkRun>>(`/benchmarks/${id}`);
    return res.data.data;
  },
};
