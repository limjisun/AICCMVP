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

// Customer info types
export interface CustomerInfo {
  name: string;
  customerId: string;
  phone: string;
  email: string;
}

// Summary types
export interface SessionSummary {
  tags: string[];
  description: string;
}

// Metric types for session detail
export interface SessionMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'rise' | 'decrease';
  changeText: string;
}

// Session types
export interface Session {
  id: string;
  time: string;
  source: 'call' | 'chat';
  status: 'normal' | 'warning' | 'critical';
  duration: string;
  isDelayed?: boolean; // 지연 상태 (개발자가 로직 구현 필요)
  progress?: Progress[]; // 인식률, 응답속도, 감정구간
  responseTime?: string;
  intentRate?: number;
  satisfaction?: number;
  emotion?: number;
  alerts?: SessionAlert[]; // 알림 목록
  conversation?: ConversationMessage[]; // 대화 내역
  customerInfo?: CustomerInfo; // 고객 정보
  summary?: SessionSummary; // 실시간 요약
  metrics?: SessionMetric[]; // 성능 메트릭
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
  responseTime?: string; // 봇 응답 시간 (예: "1.2s")
  isTyping?: boolean; // 봇이 입력 중인지 여부
  emotion?: EmotionType; // 감정 상태
}

// Emotion types
export type EmotionType = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

export interface EmotionPoint {
  index: number; // 발화 순서 (X축)
  emotion: EmotionType; // 감정 (Y축)
  value: number; // 감정 수치 (2: 매우긍정, 1: 긍정, 0: 중립, -1: 부정, -2: 매우부정)
  message: string; // 발화 내용
  time: string; // 발화 시간
}

export interface EmotionAnalysis {
  stable: number; // 감정 안정 구간 (부정 → 긍정 이상)
  recovery: number; // 감정 회복 구간 (부정 → 중립/긍정)
  deterioration: number; // 감정 악화 구간 (부정 → 부정 → 매우부정)
}

// Keyword types
export type KeywordTabType = 'synonym' | 'misrecognition';
export type UsageAreaType = 'forbidden' | 'negative'; // 금지어, 부정어

// 동의어 항목
export interface SynonymItem {
  id: string;
  date: string; // 최근수정일시
  representative: string; // 대표 키워드
  synonyms: string; // 유사어 (쉼표로 구분)
  usageArea: UsageAreaType; // 사용영역 (금지어/부정어)
  isNew?: boolean; // 신규건 여부
  isDirty?: boolean; // 수정된 상태 (저장 버튼 표시용)
}

// 오인식 교정 항목
export interface MisrecognitionItem {
  id: string;
  date: string; // 최근수정일시
  correctedWord: string; // 교정어
  misrecognizedWord: string; // 오인식어
  isNew?: boolean; // 신규건 여부
  isDirty?: boolean; // 수정된 상태 (저장 버튼 표시용)
}

// 통합 타입
export type KeywordItem = SynonymItem | MisrecognitionItem;
