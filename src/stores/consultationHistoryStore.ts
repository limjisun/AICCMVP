import { create } from 'zustand';

export interface ConversationMessage {
  type: 'user' | 'bot';
  text: string;
  time: string;
  startTime: number;  // 오디오 시작 시간 (초)
  endTime: number;    // 오디오 종료 시간 (초)
  responseTime?: string;
  emotion?: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
}

export interface ConsultationMetric {
  label: string;
  value: number;
  unit: string;
}

export interface ConsultationHistory {
  id: string;
  createdAt: string;
  consultationId: string;
  status: string;
  statusColor: string;
  consultationType: string;
  channel: string;
  company: string;
  category: string;
  customerName: string;
  contactPhone: string;
  email: string;
  notes?: string;

  // 상세 패널용 추가 데이터
  customerId?: string;
  conversation?: ConversationMessage[];
  summary?: {
    tags: string[];
    description: string;
  };
  metrics?: ConsultationMetric[];
  keywords?: {
    forbidden?: string[];
    negative?: string[];
  };
  audioUrl?: string;
}

interface ConsultationHistoryState {
  histories: ConsultationHistory[];
  selectedHistory: ConsultationHistory | null;
  isDetailPanelOpen: boolean;
  filters: {
    startDate: string;
    endDate: string;
    status: string;
    channel: string;
    search: string;
  };
  setHistories: (histories: ConsultationHistory[]) => void;
  setSelectedHistory: (history: ConsultationHistory | null) => void;
  setIsDetailPanelOpen: (isOpen: boolean) => void;
  setFilters: (filters: Partial<ConsultationHistoryState['filters']>) => void;
  resetFilters: () => void;
}

const mockHistories: ConsultationHistory[] = [
  {
    id: '1',
    createdAt: '2025.11.03 14:07:31',
    consultationId: '65147454123',
    status: '상담완료',
    statusColor: 'gray',
    consultationType: '자동이체 변경',
    channel: '콜',
    company: '자동이체문의',
    category: '청구',
    customerName: '홍길동',
    contactPhone: '010-1234-5678',
    email: 'sdfk3223@naver.com',
    notes: '자동이체 설정 관련 문의 접수 완료',
    customerId: 'FDW5000024',
    audioUrl: '/sample-audio.mp3',
    conversation: [
      {
        type: 'user',
        text: '안녕하세요. 자동이체 변경하고 싶습니다. 오류메세지',
        time: '00:00:05',
        startTime: 5,
        endTime: 8,
        emotion: 'neutral',
      },
      {
        type: 'bot',
        text: '안녕하세요. 자동이체 변경을 도와드리겠습니다. 먼저 본인 확인을 위해 고객님의 성함과 생년월일을 말씀해 주시겠습니까?',
        time: '00:00:08',
        startTime: 8,
        endTime: 15,
        responseTime: '1.2s',
      },
      {
        type: 'user',
        text: '홍길동이고요, 생년월일은 1990년 3월 15일입니다. 에러아니에요?',
        time: '00:00:15',
        startTime: 15,
        endTime: 20,
        emotion: 'positive',
      },
      {
        type: 'bot',
        text: '확인되었습니다. 어떤 계좌로 변경하시겠습니까?',
        time: '00:00:20',
        startTime: 20,
        endTime: 23,
        responseTime: '0.8s',
      },
      {
        type: 'user',
        text: '신한은행 110-123-456789로 변경해주세요. 개판이구만',
        time: '00:00:23',
        startTime: 23,
        endTime: 27,
        emotion: 'positive',
      },
      {
        type: 'bot',
        text: '변경이 완료되었습니다. 추가로 도와드릴 사항이 있으신가요?',
        time: '00:00:27',
        startTime: 27,
        endTime: 31,
        responseTime: '1.0s',
      },
      {
        type: 'user',
        text: '아 젠장 감사합니다!',
        time: '00:00:31',
        startTime: 31,
        endTime: 33,
        emotion: 'very_positive',
      },
    ],
    summary: {
      tags: ['자동이체 변경', '계좌 변경'],
      description: '고객은 보험료 자동이체 계좌 변경방법에 대해 문의하였고, 변경방법을 안내하였음. 추가로 납부금액 변경에 대해 요청하여 본인 인증 후 자동이체 계좌를 변경하고 납부금액을 변경 처리하였음. 추가 문의사항은 더이상 없어 상담을 종료함.',
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.2, unit: '초' },
      { label: '인텐트 인식 성공률', value: 80, unit: '%' },
      { label: '대화턴', value: 32, unit: '회' },
      { label: 'Fallback', value: 2, unit: '회' },
    ],
    keywords: {
      forbidden: ['젠장', '개판'],
      negative: ['오류메세지', '에러'],
    },
  },
  {
    id: '2',
    createdAt: '2025.11.05 15:13:31',
    consultationId: '65147454124',
    status: '상담사전환',
    statusColor: 'blue',
    consultationType: '자동이체문의',
    channel: '채팅',
    company: '자동이체문의',
    category: '청구',
    customerName: '이*영',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '3',
    createdAt: '2025.11.05 14:13:31',
    consultationId: '65147454125',
    status: '상담실패',
    statusColor: 'purple',
    consultationType: '자동이체문의',
    channel: '콜',
    company: '자동이체문의',
    category: '청구',
    customerName: '박*호',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '4',
    createdAt: '2025.11.05 13:13:31',
    consultationId: '65147454126',
    status: '재연락',
    statusColor: 'orange',
    consultationType: '자동이체문의',
    channel: '채팅',
    company: '자동이체문의',
    category: '청구',
    customerName: '최*미',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '5',
    createdAt: '2025.11.05 12:13:31',
    consultationId: '65147454127',
    status: '부재',
    statusColor: 'yellow',
    consultationType: '자동이체문의',
    channel: '콜',
    company: '자동이체문의',
    category: '청구',
    customerName: '정*준',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '6',
    createdAt: '2025.11.05 11:13:31',
    consultationId: '65147454128',
    status: '무응답',
    statusColor: 'green',
    consultationType: '자동이체문의',
    channel: '채팅',
    company: '자동이체문의',
    category: '청구',
    customerName: '강*희',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '7',
    createdAt: '2025.11.05 10:13:31',
    consultationId: '65147454129',
    status: '상담완료',
    statusColor: 'gray',
    consultationType: '자동이체문의',
    channel: '콜',
    company: '자동이체문의',
    category: '청구',
    customerName: '윤*서',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '8',
    createdAt: '2025.11.05 09:13:31',
    consultationId: '65147454130',
    status: '상담사전환',
    statusColor: 'blue',
    consultationType: '자동이체문의',
    channel: '채팅',
    company: '자동이체문의',
    category: '청구',
    customerName: '조*원',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '9',
    createdAt: '2025.11.04 16:13:31',
    consultationId: '65147454131',
    status: '상담실패',
    statusColor: 'purple',
    consultationType: '자동이체문의',
    channel: '콜',
    company: '자동이체문의',
    category: '청구',
    customerName: '한*진',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
  {
    id: '10',
    createdAt: '2025.11.04 15:13:31',
    consultationId: '65147454132',
    status: '재연락',
    statusColor: 'orange',
    consultationType: '자동이체문의',
    channel: '채팅',
    company: '자동이체문의',
    category: '청구',
    customerName: '오*아',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
  },
];

const defaultFilters = {
  startDate: '',
  endDate: '',
  status: '',
  channel: '',
  search: '',
};

export const useConsultationHistoryStore = create<ConsultationHistoryState>((set) => ({
  histories: mockHistories,
  selectedHistory: null,
  isDetailPanelOpen: false,
  filters: defaultFilters,
  setHistories: (histories) => set({ histories }),
  setSelectedHistory: (history) => set({
    selectedHistory: history,
    isDetailPanelOpen: !!history
  }),
  setIsDetailPanelOpen: (isOpen) => set({
    isDetailPanelOpen: isOpen,
    selectedHistory: isOpen ? undefined : null
  }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
