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
// 빈 화면 테스트용: 아래 배열을 []로 바꾸면 빈 화면을 볼 수 있습니다
// const mockSessions: Session[] = [];

// 원본 데이터 (테스트 후 복원용)
const mockSessions: Session[] = [
  // Call 세션 (8개) - 정상 5, 주의 2, 개입 1
  {
    id: 'S001',
    time: '00:09:15',
    source: 'call',
    status: 'normal',
    duration: '4분 32초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '잔액 조회 부탁합니다', time: '00:09:15', emotion: 'neutral' },
      { type: 'bot', message: '잔액 조회를 도와드리겠습니다. 계좌번호를 말씀해주세요.', time: '00:09:16', responseTime: '0.7s' },
      { type: 'user', message: '110-123-456789', time: '00:09:22', emotion: 'neutral' },
      { type: 'bot', message: '현재 잔액은 1,234,567원입니다.', time: '00:09:24', responseTime: '0.9s' },
      { type: 'user', message: '좋아요 감사합니다!', time: '00:09:26', emotion: 'positive' },
      { type: 'bot', message: '도움이 되셨다니 기쁩니다. 추가 문의사항이 있으시면 언제든지 말씀해주세요.', time: '00:09:27', responseTime: '0.8s' }
    ],
    customerInfo: {
      name: '김철수',
      customerId: 'FDW5000021',
      phone: '010-1111-2222',
      email: 'kim@example.com'
    },
    summary: {
      tags: ['잔액 조회'],
      description: '잔액 조회 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.8, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.6초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S002',
    time: '00:09:42',
    source: 'call',
    status: 'normal',
    duration: '3분 18초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '카드 사용 내역 알려주세요', time: '00:09:42' },
      { type: 'bot', message: '카드 사용 내역을 확인해드리겠습니다. 카드번호 뒷 4자리를 말씀해주세요.', time: '00:09:43', responseTime: '0.6s' },
      { type: 'user', message: '1234', time: '00:09:48' },
      { type: 'bot', message: '오늘 사용 내역은 2건, 총 45,000원입니다.', time: '00:09:50', responseTime: '1.1s' }
    ],
    customerInfo: {
      name: '이순신',
      customerId: 'FDW5000022',
      phone: '010-2222-3333',
      email: 'lee@example.com'
    },
    summary: {
      tags: ['카드 사용내역'],
      description: '카드 사용 내역 조회 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.9, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.5초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S003',
    time: '00:10:05',
    source: 'call',
    status: 'warning',
    duration: '6분 45초',
    isDelayed: false, // 개발자가 지연 로직 구현 필요 (예: 10분 이상 상담 등)
    progress: generateProgress(),
    alerts: [
      { type: 'delay', title: '응답 지연', message: 'AI 응답 지연이 반복되고 있습니다. 연결 안정성 점검 또는 상담사 개입을 권장합니다.', highlight: 'AI 응답 지연이 반복' }
    ],
    conversation: [
      { type: 'user', message: '안녕하세요. 자동이체 변경하고 싶습니다.', time: '00:10:05', emotion: 'neutral' },
      { type: 'bot', message: '안녕하세요. 자동이체 변경을 도와드리겠습니다. 먼저 본인 확인을 위해 고객님의 성함과 생년월일을 말씀해 주시겠습니까?', time: '00:10:08', responseTime: '1.2s' },
      { type: 'user', message: '홍길동이고요, 1990년 5월 15일입니다.', time: '00:10:15', emotion: 'neutral' },
      { type: 'bot', message: '확인되었습니다. 변경하실 자동이체 계좌번호를 알려주시겠습니까?', time: '00:10:22', responseTime: '2.8s' },
      { type: 'user', message: '국민은행 123-456-789012로 변경하고 싶습니다.', time: '00:10:30', emotion: 'negative' },
      { type: 'bot', message: '변경 완료되었습니다!', time: '00:10:35', responseTime: '2.0s' },
      { type: 'user', message: '빠르게 처리해주셔서 정말 감사합니다!', time: '00:10:38', emotion: 'very_positive' }
    ],
    customerInfo: {
      name: '홍길동',
      customerId: 'FDW5000024',
      phone: '010-1234-5678',
      email: 'hong@example.com'
    },
    summary: {
      tags: ['자동이체 변경', '인증문자 요청'],
      description: '자동이체 변경 요청에 대한 인증 절차 안내 중(고객 인증 대기)'
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.2, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.2초' },
      { label: '인텐트 인식 성공률', value: 80, unit: '%', trend: 'decrease', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 32, unit: '회', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: 'Fallback', value: 2, unit: '회', trend: 'rise', changeText: '오늘 평균보다 10%' }
    ]
  },
  {
    id: 'S004',
    time: '00:10:33',
    source: 'call',
    status: 'normal',
    duration: '2분 55초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '정기예금 이율이 어떻게 되나요?', time: '00:10:33' },
      { type: 'bot', message: '정기예금 금리는 기간에 따라 다릅니다. 12개월 기준 연 3.5%입니다.', time: '00:10:35', responseTime: '1.0s' },
      { type: 'user', message: '알겠습니다. 감사합니다', time: '00:10:42' },
      { type: 'bot', message: '도움이 되셨다니 다행입니다. 추가 문의사항이 있으시면 언제든지 연락주세요.', time: '00:10:43', responseTime: '0.8s' }
    ],
    customerInfo: {
      name: '박영희',
      customerId: 'FDW5000025',
      phone: '010-3333-4444',
      email: 'park@example.com'
    },
    summary: {
      tags: ['정기예금 금리'],
      description: '정기예금 금리 문의 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.9, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.5초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S005',
    time: '00:11:12',
    source: 'call',
    status: 'critical',
    duration: '9분 12초',
    isDelayed: false,
    progress: generateProgress(),
    alerts: [
      { type: 'fallback', title: 'Fallback 반복', message: '고객 의도를 연속 2회 인식하지 못했습니다. 상담사 전환을 권장합니다.', highlight: '고객 의도를 연속 2회' },
      { type: 'delay', title: '응답 지연', message: '누적 응답 지연 시간이 기준을 초과했습니다.' }
    ],
    conversation: [
      { type: 'user', message: '신용카드 발급 문의드립니다.', time: '00:11:12' },
      { type: 'bot', message: '신용카드 발급 문의 주셔서 감사합니다. 어떤 카드를 원하시나요?', time: '00:11:14', responseTime: '0.9s' },
      { type: 'user', message: '아니 그게 아니고, 분실신고를 하려고요.', time: '00:11:20' },
      { type: 'bot', message: '죄송합니다. 다시 한번 말씀해 주시겠습니까?', time: '00:11:28', responseTime: '3.5s' },
      { type: 'user', message: '카드 분실신고요!!', time: '00:11:35' },
      { type: 'bot', message: '이해하지 못했습니다. 상담사와 연결하시겠습니까?', time: '00:11:42', responseTime: '4.2s' }
    ],
    customerInfo: {
      name: '정민호',
      customerId: 'FDW5000026',
      phone: '010-4444-5555',
      email: 'jung@example.com'
    },
    summary: {
      tags: ['카드 분실신고', '인텐트 실패'],
      description: '카드 분실신고 요청 중 인텐트 인식 실패로 상담사 연결 필요'
    },
    metrics: [
      { label: '평균 응답 속도', value: 2.9, unit: '초', trend: 'rise', changeText: '오늘 평균보다 1.5초' },
      { label: '인텐트 인식 성공률', value: 50, unit: '%', trend: 'decrease', changeText: '오늘 평균보다 40%' },
      { label: '대화턴', value: 6, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 16%' },
      { label: 'Fallback', value: 2, unit: '회', trend: 'rise', changeText: '오늘 평균보다 2회' }
    ]
  },
  {
    id: 'S006',
    time: '00:11:48',
    source: 'call',
    status: 'normal',
    duration: '5분 08초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '적금 만기일이 언제인가요?', time: '00:11:48' },
      { type: 'bot', message: '적금 만기일을 확인해드리겠습니다. 계좌번호를 말씀해주세요.', time: '00:11:50', responseTime: '1.1s' },
      { type: 'user', message: '110-987-654321', time: '00:11:58' },
      { type: 'bot', message: '해당 적금의 만기일은 2025년 3월 15일입니다.', time: '00:12:01', responseTime: '1.3s' }
    ],
    customerInfo: {
      name: '강유진',
      customerId: 'FDW5000027',
      phone: '010-5555-6666',
      email: 'kang@example.com'
    },
    summary: {
      tags: ['적금 만기일'],
      description: '적금 만기일 조회 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.2, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.2초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S007',
    time: '00:13:25',
    source: 'call',
    status: 'warning',
    duration: '7분 33초',
    isDelayed: false,
    progress: generateProgress(),
    alerts: [
      { type: 'emotion', title: '고객 감정 악화', message: '인증/결제 등 중요단계 고객이 인증 절차 중 어려움을 겪는 것으로보입니다. 상담사 개입을 권장합니다.', highlight: '인증 절차 중 어려움' }
    ],
    conversation: [
      { type: 'user', message: '송금하려고 하는데 인증이 안돼요', time: '00:13:25' },
      { type: 'bot', message: '송금 인증에 문제가 있으시군요. 어떤 오류 메시지가 나타나나요?', time: '00:13:28', responseTime: '1.5s' },
      { type: 'user', message: '문자가 안와요. 계속 기다리는 중인데', time: '00:13:35' },
      { type: 'bot', message: '인증 문자가 오지 않는 경우 재발송을 요청해주세요. 앱에서 재발송 버튼을 눌러보세요.', time: '00:13:40', responseTime: '2.2s' },
      { type: 'user', message: '그래도 안와요...', time: '00:13:50' },
      { type: 'bot', message: '고객님의 불편을 해결하기 위해 상담사와 연결해드리겠습니다.', time: '00:13:55', responseTime: '2.5s' }
    ],
    customerInfo: {
      name: '윤서준',
      customerId: 'FDW5000028',
      phone: '010-6666-7777',
      email: 'yoon@example.com'
    },
    summary: {
      tags: ['송금 인증 문제', '상담사 연결'],
      description: '송금 인증 문자 미수신으로 상담사 연결'
    },
    metrics: [
      { label: '평균 응답 속도', value: 2.1, unit: '초', trend: 'rise', changeText: '오늘 평균보다 0.7초' },
      { label: '인텐트 인식 성공률', value: 85, unit: '%', trend: 'decrease', changeText: '오늘 평균보다 5%' },
      { label: '대화턴', value: 6, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 16%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S008',
    time: '00:14:01',
    source: 'call',
    status: 'normal',
    duration: '3분 42초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '체크카드 재발급 하고 싶어요', time: '00:14:01' },
      { type: 'bot', message: '체크카드 재발급을 도와드리겠습니다. 분실하신 건가요?', time: '00:14:03', responseTime: '0.9s' },
      { type: 'user', message: '네 분실했어요', time: '00:14:08' },
      { type: 'bot', message: '우선 분실 신고를 진행하고 재발급 신청을 도와드리겠습니다. 카드 사용 정지 처리를 먼저 하겠습니다.', time: '00:14:11', responseTime: '1.2s' }
    ],
    customerInfo: {
      name: '조하늘',
      customerId: 'FDW5000029',
      phone: '010-7777-8888',
      email: 'cho@example.com'
    },
    summary: {
      tags: ['체크카드 재발급', '분실신고'],
      description: '체크카드 분실신고 및 재발급 신청 중'
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.1, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.3초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },

  // Chat 세션 (12개) - 정상 7, 주의 3, 개입 2
  {
    id: 'S009',
    time: '00:09:23',
    source: 'chat',
    status: 'normal',
    duration: '2분 15초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '내일 환율이 어떻게 되나요?', time: '00:09:23' },
      { type: 'bot', message: '환율은 실시간으로 변동되며 내일 환율을 정확히 예측하기는 어렵습니다. 현재 USD 환율은 1,350원입니다.', time: '00:09:25', responseTime: '0.7s' }
    ],
    customerInfo: {
      name: '송민재',
      customerId: 'FDW5000034',
      phone: '010-8888-9999',
      email: 'song@example.com'
    },
    summary: {
      tags: ['환율 문의'],
      description: '환율 정보 문의 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.7, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.7초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 2, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 20%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S010',
    time: '00:09:55',
    source: 'chat',
    status: 'normal',
    duration: '3분 28초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '통장 사본 발급 어떻게 하나요?', time: '00:09:55' },
      { type: 'bot', message: '통장 사본은 모바일 앱이나 영업점에서 발급 가능합니다. 앱에서 발급 원하시나요?', time: '00:09:57', responseTime: '0.9s' },
      { type: 'user', message: '네 앱에서 할게요', time: '00:10:05' },
      { type: 'bot', message: '앱 메뉴 > 증명서 발급 > 통장 사본 선택하시면 됩니다.', time: '00:10:07', responseTime: '0.8s' }
    ],
    customerInfo: {
      name: '한서영',
      customerId: 'FDW5000035',
      phone: '010-9999-0000',
      email: 'han@example.com'
    },
    summary: {
      tags: ['통장 사본 발급'],
      description: '통장 사본 발급 방법 안내 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.9, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.5초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S011',
    time: '00:10:18',
    source: 'chat',
    status: 'warning',
    duration: '5분 52초',
    isDelayed: false,
    progress: generateProgress(),
    alerts: [
      { type: 'delay', title: '응답 지연', message: 'AI 응답 지연이 반복되고 있습니다. 연결 안정성 점검 또는 상담사 개입을 권장합니다.', highlight: 'AI 응답 지연이 반복' }
    ],
    conversation: [
      { type: 'user', message: '대출 한도 조회 부탁합니다', time: '00:10:18' },
      { type: 'bot', message: '대출 한도 조회를 도와드리겠습니다. 본인확인을 위해 주민등록번호 뒷자리를 입력해주세요.', time: '00:10:20', responseTime: '0.8s' },
      { type: 'user', message: '1234567', time: '00:10:28' },
      { type: 'bot', message: '입력하신 정보를 확인하고 있습니다. 잠시만 기다려주세요.', time: '00:10:35', responseTime: '3.1s' },
      { type: 'user', message: '아직인가요?', time: '00:10:50' },
      { type: 'bot', message: '확인 중입니다...', time: '00:10:58', responseTime: '4.5s', isTyping: true }
    ],
    customerInfo: {
      name: '이영희',
      customerId: 'FDW5000031',
      phone: '010-2345-6789',
      email: 'lee@example.com'
    },
    summary: {
      tags: ['대출 한도 조회', '본인 확인'],
      description: '대출 한도 조회 요청 중 본인 확인 절차 진행 중'
    },
    metrics: [
      { label: '평균 응답 속도', value: 2.8, unit: '초', trend: 'rise', changeText: '오늘 평균보다 1.4초' },
      { label: '인텐트 인식 성공률', value: 95, unit: '%', trend: 'rise', changeText: '오늘 평균보다 5%' },
      { label: '대화턴', value: 12, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 5%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 1회' }
    ]
  },
  {
    id: 'S012',
    time: '00:10:47',
    source: 'chat',
    status: 'normal',
    duration: '1분 45초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '영업시간 알려주세요', time: '00:10:47' },
      { type: 'bot', message: '평일 09:00~18:00, 토요일 09:00~13:00 운영하며 일요일 및 공휴일은 휴무입니다.', time: '00:10:48', responseTime: '0.5s' }
    ],
    customerInfo: {
      name: '박민수',
      customerId: 'FDW5000032',
      phone: '010-3456-7890',
      email: 'park@example.com'
    },
    summary: {
      tags: ['영업시간 문의'],
      description: '영업시간 문의 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.5, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.9초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 2, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 20%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S013',
    time: '00:11:20',
    source: 'chat',
    status: 'critical',
    duration: '8분 35초',
    isDelayed: true,
    progress: generateProgress(),
    alerts: [
      { type: 'fallback', title: 'Fallback 반복', message: '인텐트 인식 불가가 연속 2회 발생했습니다. 상담사 개입을 권장합니다.', highlight: '인텐트 인식 불가가 연속 2회' }
    ],
    conversation: [
      { type: 'user', message: '환전 가능한가요?', time: '00:11:20' },
      { type: 'bot', message: '죄송합니다. 다시 한번 말씀해 주시겠습니까?', time: '00:11:25', responseTime: '2.8s' },
      { type: 'user', message: '외화 환전이요!', time: '00:11:30' },
      { type: 'bot', message: '이해하지 못했습니다. 상담사와 연결하시겠습니까?', time: '00:11:38', responseTime: '3.5s' },
      { type: 'user', message: '네 연결해주세요', time: '00:11:45' },
      { type: 'bot', message: '상담사 연결 중입니다...', time: '00:11:50', responseTime: '1.8s', isTyping: true }
    ],
    customerInfo: {
      name: '최지훈',
      customerId: 'FDW5000033',
      phone: '010-4567-8901',
      email: 'choi@example.com'
    },
    summary: {
      tags: ['환전 문의', '상담사 연결'],
      description: '외화 환전 문의 중 인텐트 인식 실패로 상담사 연결 중'
    },
    metrics: [
      { label: '평균 응답 속도', value: 2.7, unit: '초', trend: 'rise', changeText: '오늘 평균보다 1.3초' },
      { label: '인텐트 인식 성공률', value: 33, unit: '%', trend: 'decrease', changeText: '오늘 평균보다 57%' },
      { label: '대화턴', value: 6, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 15%' },
      { label: 'Fallback', value: 2, unit: '회', trend: 'rise', changeText: '오늘 평균보다 2회' }
    ]
  },
  {
    id: 'S014',
    time: '00:12:05',
    source: 'chat',
    status: 'normal',
    duration: '2분 58초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '비밀번호 변경하려고요', time: '00:12:05' },
      { type: 'bot', message: '비밀번호 변경을 도와드리겠습니다. 앱 설정 > 보안 > 비밀번호 변경에서 진행하실 수 있습니다.', time: '00:12:07', responseTime: '1.0s' }
    ],
    customerInfo: {
      name: '임동욱',
      customerId: 'FDW5000036',
      phone: '010-0000-1111',
      email: 'lim@example.com'
    },
    summary: {
      tags: ['비밀번호 변경'],
      description: '비밀번호 변경 방법 안내 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.0, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.4초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 2, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 20%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S015',
    time: '00:12:38',
    source: 'chat',
    status: 'warning',
    duration: '6분 12초',
    isDelayed: false,
    progress: generateProgress(),
    alerts: [
      { type: 'emotion2', title: '고객 감정 악화', message: '고객 부정 감정이 감지되었습니다. 상담사 전환을 권장합니다.', highlight: '고객 부정 감정' }
    ],
    conversation: [
      { type: 'user', message: '대출 승인이 왜 안되는거죠?', time: '00:12:38' },
      { type: 'bot', message: '대출 승인 결과는 심사 기준에 따라 결정됩니다. 구체적인 사유를 확인해드리겠습니다.', time: '00:12:42', responseTime: '2.1s' },
      { type: 'user', message: '작년엔 되더니 왜 올해는 안되는거예요??', time: '00:12:55' },
      { type: 'bot', message: '고객님의 불편한 심정 충분히 이해합니다. 상담사와 연결하여 자세히 안내드리겠습니다.', time: '00:13:02', responseTime: '3.2s' }
    ],
    customerInfo: {
      name: '오정민',
      customerId: 'FDW5000037',
      phone: '010-1111-2222',
      email: 'oh@example.com'
    },
    summary: {
      tags: ['대출 승인 거절', '감정 악화'],
      description: '대출 승인 거절로 인한 불만, 상담사 연결'
    },
    metrics: [
      { label: '평균 응답 속도', value: 2.7, unit: '초', trend: 'rise', changeText: '오늘 평균보다 1.3초' },
      { label: '인텐트 인식 성공률', value: 75, unit: '%', trend: 'decrease', changeText: '오늘 평균보다 15%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S016',
    time: '00:13:10',
    source: 'chat',
    status: 'normal',
    duration: '3분 05초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: 'ATM 위치 알려주세요', time: '00:13:10' },
      { type: 'bot', message: '현재 위치를 알려주시면 가까운 ATM을 찾아드리겠습니다.', time: '00:13:12', responseTime: '0.8s' },
      { type: 'user', message: '강남역 근처요', time: '00:13:18' },
      { type: 'bot', message: '강남역 3번 출구 앞 편의점과 역 내부 2층에 ATM이 있습니다.', time: '00:13:20', responseTime: '1.1s' }
    ],
    customerInfo: {
      name: '신우진',
      customerId: 'FDW5000038',
      phone: '010-2222-3333',
      email: 'shin@example.com'
    },
    summary: {
      tags: ['ATM 위치'],
      description: 'ATM 위치 안내 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.0, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.4초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S017',
    time: '00:13:45',
    source: 'chat',
    status: 'critical',
    duration: '7분 48초',
    isDelayed: false,
    progress: generateProgress(),
    alerts: [
      { type: 'fallback', title: 'Fallback 반복', message: '고객 의도를 연속 2회 인식하지 못했습니다. 상담사 전환을 권장합니다.', highlight: '고객 의도를 연속 2회' }
    ],
    conversation: [
      { type: 'user', message: '마케팅 동의 철회하고 싶어요', time: '00:13:45' },
      { type: 'bot', message: '죄송합니다. 다시 한번 말씀해 주시겠습니까?', time: '00:13:52', responseTime: '3.8s' },
      { type: 'user', message: '마케팅 수신 동의 해제요!', time: '00:14:00' },
      { type: 'bot', message: '이해하지 못했습니다. 상담사와 연결하시겠습니까?', time: '00:14:08', responseTime: '4.5s' },
      { type: 'user', message: '네 연결해주세요', time: '00:14:15' },
      { type: 'bot', message: '상담사 연결 중입니다...', time: '00:14:20', responseTime: '2.1s', isTyping: true }
    ],
    customerInfo: {
      name: '백수현',
      customerId: 'FDW5000039',
      phone: '010-3333-4444',
      email: 'baek@example.com'
    },
    summary: {
      tags: ['마케팅 동의 철회', '인텐트 실패'],
      description: '마케팅 수신 동의 철회 요청 중 인텐트 인식 실패로 상담사 연결'
    },
    metrics: [
      { label: '평균 응답 속도', value: 3.5, unit: '초', trend: 'rise', changeText: '오늘 평균보다 2.1초' },
      { label: '인텐트 인식 성공률', value: 33, unit: '%', trend: 'decrease', changeText: '오늘 평균보다 57%' },
      { label: '대화턴', value: 6, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 16%' },
      { label: 'Fallback', value: 2, unit: '회', trend: 'rise', changeText: '오늘 평균보다 2회' }
    ]
  },
  {
    id: 'S018',
    time: '00:14:12',
    source: 'chat',
    status: 'normal',
    duration: '4분 22초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '공과금 자동이체 신청하려고요', time: '00:14:12' },
      { type: 'bot', message: '공과금 자동이체 신청을 도와드리겠습니다. 어떤 공과금인가요?', time: '00:14:14', responseTime: '1.0s' },
      { type: 'user', message: '전기요금이요', time: '00:14:22' },
      { type: 'bot', message: '전기요금 자동이체는 앱에서 신청 가능합니다. 안내해드릴까요?', time: '00:14:24', responseTime: '1.2s' },
      { type: 'user', message: '네 알려주세요', time: '00:14:30' },
      { type: 'bot', message: '앱 메뉴 > 자동이체 > 공과금 자동이체 > 전기요금 선택하시면 됩니다.', time: '00:14:32', responseTime: '0.9s' }
    ],
    customerInfo: {
      name: '안지원',
      customerId: 'FDW5000040',
      phone: '010-4444-5555',
      email: 'ahn@example.com'
    },
    summary: {
      tags: ['공과금 자동이체'],
      description: '전기요금 자동이체 신청 방법 안내 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 1.0, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.4초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 6, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 16%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S019',
    time: '00:14:35',
    source: 'chat',
    status: 'warning',
    duration: '5분 38초',
    isDelayed: false,
    progress: generateProgress(),
    alerts: [
      { type: 'delay', title: '응답 지연', message: 'AI 응답 시간이 평균보다 느립니다.' }
    ],
    conversation: [
      { type: 'user', message: '해외송금 수수료가 얼마인가요?', time: '00:14:35' },
      { type: 'bot', message: '해외송금 수수료를 확인하고 있습니다...', time: '00:14:42', responseTime: '3.5s' },
      { type: 'user', message: '아직인가요?', time: '00:14:55' },
      { type: 'bot', message: '해외송금 수수료는 국가와 송금액에 따라 다릅니다. 미국 기준 15,000원부터입니다.', time: '00:15:02', responseTime: '4.2s' }
    ],
    customerInfo: {
      name: '김태양',
      customerId: 'FDW5000041',
      phone: '010-5555-6666',
      email: 'kimt@example.com'
    },
    summary: {
      tags: ['해외송금 수수료', '응답 지연'],
      description: '해외송금 수수료 문의 중 응답 지연 발생'
    },
    metrics: [
      { label: '평균 응답 속도', value: 3.9, unit: '초', trend: 'rise', changeText: '오늘 평균보다 2.5초' },
      { label: '인텐트 인식 성공률', value: 90, unit: '%', trend: 'rise', changeText: '오늘 평균과 동일' },
      { label: '대화턴', value: 4, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 18%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
  {
    id: 'S020',
    time: '00:14:58',
    source: 'chat',
    status: 'normal',
    duration: '2분 41초',
    isDelayed: false,
    progress: generateProgress(),
    conversation: [
      { type: 'user', message: '고객센터 전화번호 알려주세요', time: '00:14:58' },
      { type: 'bot', message: '고객센터 전화번호는 1588-1234입니다. 평일 09:00~18:00 운영합니다.', time: '00:14:59', responseTime: '0.6s' }
    ],
    customerInfo: {
      name: '이하늘',
      customerId: 'FDW5000042',
      phone: '010-6666-7777',
      email: 'leeh@example.com'
    },
    summary: {
      tags: ['고객센터 문의'],
      description: '고객센터 전화번호 안내 완료'
    },
    metrics: [
      { label: '평균 응답 속도', value: 0.6, unit: '초', trend: 'decrease', changeText: '오늘 평균보다 0.8초' },
      { label: '인텐트 인식 성공률', value: 100, unit: '%', trend: 'rise', changeText: '오늘 평균보다 10%' },
      { label: '대화턴', value: 2, unit: '회', trend: 'decrease', changeText: '오늘 평균보다 20%' },
      { label: 'Fallback', value: 0, unit: '회', trend: 'decrease', changeText: '오늘 평균과 동일' }
    ]
  },
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
