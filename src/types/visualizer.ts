export interface VisualizerVariable {
  name: string;
  value: string;
  type?: string;
  changed?: boolean;
}

export interface CallStackFrame {
  frame: string;
  detail?: string;
  status?: 'running' | 'paused' | 'returning';
}

export interface ScopeEnvironment {
  name: string;
  kind: 'global' | 'function' | 'block' | 'closure';
  retained?: boolean;
  bindings: Array<{
    key: string;
    value: string;
    changed?: boolean;
  }>;
}

export interface StackEntry {
  name: string;
  value: string;
  refId?: string;
  changed?: boolean;
}

export interface HeapObject {
  id: string;
  label: string;
  entries: Array<{
    key: string;
    value: string;
    refId?: string;
    changed?: boolean;
  }>;
}

export interface EventLoopSnapshot {
  webApis: string[];
  microtasks: string[];
  macrotasks: string[];
  loopStatus: string;
  activePhase: 'sync' | 'microtask' | 'macrotask' | 'idle';
}

export type FetchStageId = 'call' | 'request' | 'server' | 'response' | 'parse' | 'ui';

export interface FetchFlowSnapshot {
  activeStage: FetchStageId;
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  status?: string;
  ok?: boolean;
  responseHeaders?: Record<string, string>;
  rawJson?: string;
  parsedObject?: string;
  uiPreview?: string;
}

export interface VisualizerStep {
  activeLine: number;
  phaseLabel: string;
  explanation: string;
  variables?: VisualizerVariable[];
  tableRows?: string[][];
  callStack?: CallStackFrame[];
  scopes?: ScopeEnvironment[];
  memory?: {
    stack: StackEntry[];
    heap: HeapObject[];
  };
  eventLoop?: EventLoopSnapshot;
  fetchFlow?: FetchFlowSnapshot;
  consoleOutput?: string[];
}

export type VisualizerFocus =
  | 'variables-table'
  | 'call-stack-scope'
  | 'memory-heap'
  | 'event-loop'
  | 'async-await'
  | 'fetch-flow';

export interface VisualizerScenario {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  focus: VisualizerFocus;
  codeLines: string[];
  tableColumns?: string[];
  steps: VisualizerStep[];
}
