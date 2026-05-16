'use client';

import { create } from 'zustand';
import { comparePipelines, listDocuments } from '@/services/api';
import { demoCompare, demoDocuments } from '@/lib/mock-data';
import type { ArenaSettings, CompareResponse, DocumentRecord, PipelineId } from '@/types/rag';

type ArenaState = {
  query: string;
  comparison: CompareResponse;
  documents: DocumentRecord[];
  settings: ArenaSettings;
  activePipeline: PipelineId | null;
  isRunning: boolean;
  uploadProgress: number;
  setQuery: (query: string) => void;
  setSettings: (settings: Partial<ArenaSettings>) => void;
  setActivePipeline: (pipeline: PipelineId | null) => void;
  runComparison: () => Promise<void>;
  hydrateDocuments: () => Promise<void>;
  simulateUpload: (fileName: string) => Promise<void>;
};

const defaultSettings: ArenaSettings = {
  chunkSize: 720,
  overlap: 96,
  embeddingModel: 'text-embedding-3-large',
  topK: 5,
  temperature: 0.2,
  retrievalMode: 'balanced',
  rerankerEnabled: true,
  metadataFilter: 'all documents'
};

export const useArenaStore = create<ArenaState>((set, get) => ({
  query: demoCompare.query,
  comparison: demoCompare,
  documents: demoDocuments,
  settings: defaultSettings,
  activePipeline: null,
  isRunning: false,
  uploadProgress: 100,
  setQuery: (query) => set({ query }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setActivePipeline: (pipeline) => set({ activePipeline: pipeline }),
  hydrateDocuments: async () => {
    const documents = await listDocuments();
    set({ documents });
  },
  runComparison: async () => {
    const { query, settings } = get();
    set({ isRunning: true });
    const comparison = await comparePipelines(query, settings);
    set({ comparison, isRunning: false });
  },
  simulateUpload: async (fileName) => {
    set({ uploadProgress: 0 });
    const stages = [18, 42, 64, 84, 100];
    for (const progress of stages) {
      await new Promise((resolve) => setTimeout(resolve, 260));
      set({ uploadProgress: progress });
    }
    const extension = fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : fileName.toLowerCase().endsWith('.docx') ? 'docx' : 'txt';
    set((state) => ({
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: fileName,
          type: extension,
          status: 'ready',
          chunkCount: Math.max(12, Math.round(fileName.length * 1.4)),
          tokenCount: Math.max(2100, fileName.length * 410),
          createdAt: new Date().toISOString()
        },
        ...state.documents
      ]
    }));
  }
}));
