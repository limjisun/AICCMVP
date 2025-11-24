import { create } from 'zustand';
import type { Session, SessionAlert } from '../types';

/*
SessionState 인터페이스 정의
- sessions: 전체 세션 리스트
- isLoading: 로딩 상태
- error: 에러 메시지
- fetchSessions(): API에서 세션 데이터 가져오기 (현재는 mock 데이터)
- addSession(): 새 세션 추가
- updateSession(): 세션 업데이트
- deleteSession(): 세션 삭제
- addAlert(): 세션에 실시간 alert 추가
- removeAlert(): 세션에서 alert 제거
*/

interface SessionState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  fetchSessions: () => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, session: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  addAlert: (sessionId: string, alert: SessionAlert) => void;
  removeAlert: (sessionId: string, alertIndex: number) => void;
}

// 랜덤 프로그레스 데이터 생성 헬퍼
const generateProgress = () => [
  { name: '인식률', value: Math.floor(Math.random() * 100) },
  { name: '응답속도', value: Math.floor(Math.random() * 100) },
  { name: '감정구간', value: Math.floor(Math.random() * 100) },
];

// Mock 데이터 - 나중에 API로 교체 가능
const mockSessions: Session[] = [
  // Call 세션 (8개) - 정상 5, 주의 2, 개입 1
  { id: 'S001', time: '00:09:15', source: 'call', status: 'normal', duration: '4분 32초', progress: generateProgress() },
  { id: 'S002', time: '00:09:42', source: 'call', status: 'normal', duration: '3분 18초', progress: generateProgress() },
  {
    id: 'S003',
    time: '00:10:05',
    source: 'call',
    status: 'warning',
    duration: '6분 45초',
    progress: generateProgress(),
    alerts: [
      { type: 'delay', title: '응답 지연', message: 'AI 응답 지연이 반복되고 있습니다. 연결 안정성 점검 또는 상담사 개입을 권장합니다.', highlight: 'AI 응답 지연이 반복' }
    ]
  },
  { id: 'S004', time: '00:10:33', source: 'call', status: 'normal', duration: '2분 55초', progress: generateProgress() },
  {
    id: 'S005',
    time: '00:11:12',
    source: 'call',
    status: 'critical',
    duration: '9분 12초',
    progress: generateProgress(),
    alerts: [
      { type: 'fallback', title: 'Fallback 반복', message: '고객 의도를 연속 2회 인식하지 못했습니다. 상담사 전환을 권장합니다.', highlight: '고객 의도를 연속 2회' },
      { type: 'delay', title: '응답 지연', message: '누적 응답 지연 시간이 기준을 초과했습니다.' }
    ]
  },
  { id: 'S006', time: '00:11:48', source: 'call', status: 'normal', duration: '5분 08초', progress: generateProgress() },
  {
    id: 'S007',
    time: '00:13:25',
    source: 'call',
    status: 'warning',
    duration: '7분 33초',
    progress: generateProgress(),
    alerts: [
      { type: 'emotion', title: '고객 감정 악화', message: '인증/결제 등 중요단계 고객이 인증 절차 중 어려움을 겪는 것으로보입니다. 상담사 개입을 권장합니다.', highlight: '인증 절차 중 어려움' }
    ]
  },
  { id: 'S008', time: '00:14:01', source: 'call', status: 'normal', duration: '3분 42초', progress: generateProgress() },

  // Chat 세션 (12개) - 정상 7, 주의 3, 개입 2
  { id: 'S009', time: '00:09:23', source: 'chat', status: 'normal', duration: '2분 15초', progress: generateProgress() },
  { id: 'S010', time: '00:09:55', source: 'chat', status: 'normal', duration: '3분 28초', progress: generateProgress() },
  {
    id: 'S011',
    time: '00:10:18',
    source: 'chat',
    status: 'warning',
    duration: '5분 52초',
    progress: generateProgress(),
    alerts: [
      { type: 'delay', title: '응답 지연', message: 'AI 응답 지연이 반복되고 있습니다. 연결 안정성 점검 또는 상담사 개입을 권장합니다.', highlight: 'AI 응답 지연이 반복' }
    ]
  },
  { id: 'S012', time: '00:10:47', source: 'chat', status: 'normal', duration: '1분 45초', progress: generateProgress() },
  {
    id: 'S013',
    time: '00:11:20',
    source: 'chat',
    status: 'critical',
    duration: '8분 35초',
    progress: generateProgress(),
    alerts: [
      { type: 'fallback', title: 'Fallback 반복', message: '인텐트 인식 불가가 연속 2회 발생했습니다. 상담사 개입을 권장합니다.', highlight: '인텐트 인식 불가가 연속 2회' }
    ]
  },
  { id: 'S014', time: '00:12:05', source: 'chat', status: 'normal', duration: '2분 58초', progress: generateProgress() },
  {
    id: 'S015',
    time: '00:12:38',
    source: 'chat',
    status: 'warning',
    duration: '6분 12초',
    progress: generateProgress(),
    alerts: [
      { type: 'emotion2', title: '고객 감정 악화', message: '고객 부정 감정이 감지되었습니다. 상담사 전환을 권장합니다.', highlight: '고객 부정 감정' }
    ]
  },
  { id: 'S016', time: '00:13:10', source: 'chat', status: 'normal', duration: '3분 05초', progress: generateProgress() },
  {
    id: 'S017',
    time: '00:13:45',
    source: 'chat',
    status: 'critical',
    duration: '7분 48초',
    progress: generateProgress(),
    alerts: [
      { type: 'fallback', title: 'Fallback 반복', message: '고객 의도를 연속 2회 인식하지 못했습니다. 상담사 전환을 권장합니다.', highlight: '고객 의도를 연속 2회' }
    ]
  },
  { id: 'S018', time: '00:14:12', source: 'chat', status: 'normal', duration: '4분 22초', progress: generateProgress() },
  {
    id: 'S019',
    time: '00:14:35',
    source: 'chat',
    status: 'warning',
    duration: '5분 38초',
    progress: generateProgress(),
    alerts: [
      { type: 'delay', title: '응답 지연', message: 'AI 응답 시간이 평균보다 느립니다.' }
    ]
  },
  { id: 'S020', time: '00:14:58', source: 'chat', status: 'normal', duration: '2분 41초', progress: generateProgress() },
];

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  isLoading: false,
  error: null,

  // 세션 데이터 가져오기 (현재는 mock, 나중에 API 호출로 변경)
  fetchSessions: () => {
    set({ isLoading: true, error: null });

    // 실제 API 호출 예시:
    // try {
    //   const response = await fetch('/api/sessions');
    //   const data = await response.json();
    //   set({ sessions: data, isLoading: false });
    // } catch (error) {
    //   set({ error: error.message, isLoading: false });
    // }

    // Mock 데이터 사용 (실시간 효과를 위해 setTimeout 사용)
    setTimeout(() => {
      set({ sessions: mockSessions, isLoading: false });
      console.log('[SessionStore] Mock 세션 데이터 로드 완료:', mockSessions.length, '개');
    }, 100);
  },

  // 새 세션 추가
  addSession: (session) => {
    set((state) => ({
      sessions: [...state.sessions, session],
    }));
    console.log('[SessionStore] 세션 추가:', session.id);
  },

  // 세션 업데이트
  updateSession: (id, updatedSession) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id ? { ...session, ...updatedSession } : session
      ),
    }));
    console.log('[SessionStore] 세션 업데이트:', id);
  },

  // 세션 삭제
  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== id),
    }));
    console.log('[SessionStore] 세션 삭제:', id);
  },

  // 실시간 Alert 추가 (WebSocket/Polling으로 감지 시 호출)
  addAlert: (sessionId, alert) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              alerts: [...(session.alerts || []), { ...alert, timestamp: new Date().toISOString() }],
            }
          : session
      ),
    }));
    console.log('[SessionStore] 실시간 Alert 추가:', sessionId, alert.type);
  },

  // Alert 제거 (문제 해결 시)
  removeAlert: (sessionId, alertIndex) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              alerts: session.alerts?.filter((_, index) => index !== alertIndex),
            }
          : session
      ),
    }));
    console.log('[SessionStore] Alert 제거:', sessionId, alertIndex);
  },
}));
