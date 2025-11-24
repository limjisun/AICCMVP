// Progress types
export interface Progress {
  name: string;
  value: number; // 0-100
}

// Alert types
export interface SessionAlert {
  type: 'delay' | 'fallback' | 'emotion' | 'emotion2';
  title: string;
  message: string;
  highlight?: string; // 강조할 텍스트
  timestamp?: string; // 발생 시간
}

// Session types
export interface Session {
  id: string;
  time: string;
  source: 'call' | 'chat';
  status: 'normal' | 'warning' | 'critical';
  duration: string;
  progress?: Progress[]; // 인식률, 응답속도, 감정구간
  responseTime?: string;
  intentRate?: number;
  satisfaction?: number;
  emotion?: number;
  alerts?: SessionAlert[]; // 알림 목록
}

// Bot status types
export type BotStatus = 'normal' | 'warning' | 'error' | 'pending';

// Metric types
export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  tooltip?: string;
}

// Tab types
export type TabType = 'all' | 'call' | 'chat';
export type FilterStatus = 'all' | 'normal' | 'warning' | 'critical';

// Conversation types
export interface ConversationMessage {
  type: 'user' | 'bot';
  message: string;
  time: string;
}
