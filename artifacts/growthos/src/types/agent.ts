export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'error' | 'stopped';
  lastRunAt?: string;
  description?: string;
}

export interface AgentTask {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  agentId?: string;
  result?: string;
}
