import { create } from 'zustand';

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
    createdAt: '2025.11.05 16:13:31',
    consultationId: '65147454123',
    status: '상담완료',
    statusColor: 'gray',
    consultationType: '자동이체문의',
    channel: '콜',
    company: '자동이체문의',
    category: '청구',
    customerName: '김*수',
    contactPhone: '010-1234-****',
    email: 'g*******@naver.com',
    notes: '자동이체 설정 관련 문의 접수 완료'
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
  startDate: '2025-10-10',
  endDate: '2025-10-10',
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
