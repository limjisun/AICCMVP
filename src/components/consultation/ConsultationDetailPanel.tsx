import React from 'react';
import { useConsultationHistoryStore } from '@/stores/consultationHistoryStore';
import EmotionChart from '../common/EmotionChart';
const ConsultationDetailPanel: React.FC = () => {
  const { selectedHistory, setIsDetailPanelOpen } = useConsultationHistoryStore();

  if (!selectedHistory) return null;

  const getStatusBadgeClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'badge-purple',
      blue: 'badge-blue',
      gray: 'badge-gray',
      orange: 'badge-orange',
      yellow: 'badge-yellow',
      green: 'badge-green',
    };
    return colorMap[color] || 'badge-gray';
  };

  return (
    <div className="ai-session-detail detail-open">
       <div className='session-detail-panel'>
          <div className="detail-panel__content">
              <div className="detail-panel__header">
                <div className="detail-panel__title-section">
                  <div className="detail-panel__title-consult">
                   <div
                      className={`detail-source-icon detail-source-icon--call`}
                    /> 
                    <div className="detail-panel__title-consult-left">
                      <div className="detail-panel__title-consult-title">자동이체 변경</div>
                      <div className="detail-panel__title-consult-dec">상담일시 : 2025.11.03 14:07:31  상담결과 : 상담완료</div>
                    </div>
                  </div>
                 </div>
                <button className="detail-panel__close">×</button>
              </div>
              <div className="detail-panel__body">
                  <div className='detail-panel-left'>
                     <div className='detail-panel-stt'>
                      <h3 className="detail-section-title">상담내용</h3>
                      <div className="detail-conversation-area">
                          <div className="conversation-item conversation-item--user">
                            <div className="conversation-bubble">
                              <div className="conversation-text">안녕하세요. 자동이체 변경하고 싶습니다.</div>
                            </div>
                            <div className="conversation-meta">
                              <span className="conversation-time">00:10:05</span>
                              </div>
                            </div>

                           <div className="conversation-item conversation-item--bot Play">
                            <div className="conversation-bubble">
                              <div className="conversation-text">안녕하세요. 자동이체 변경을 도와드리겠습니다. 먼저 본인 확인을 위해 고객님의 성함과 생년월일을 말씀해 주시겠습니까?</div>
                            </div>
                           <div className="conversation-meta">
                            <span className="conversation-time">00:10:08</span>
                            <span className="conversation-response-time">1.2s</span>
                            </div>
                          </div>

                          <div className="conversation-item conversation-item--user">
                            <div className="conversation-bubble">
                              <div className="conversation-text">안녕하세요. 자동이체 변경하고 싶습니다.</div>
                            </div>
                            <div className="conversation-meta">
                              <span className="conversation-time">00:10:05</span>
                              </div>
                          </div>
                      </div>
                     </div>
                    <div className='detail-panel-record'>
                      <h3 className="detail-section-title">상담정보</h3>
                      <div>오디오</div>
                     </div>
                  </div>
                  <div className='detail-panael-right'>
                       <div className="detail-info-section border-section">
                        <h3 className="detail-section-title">기본 정보</h3>
                        <div className="detail-info-item">
                          <span className="detail-info-label">고객명</span>
                          <span className="detail-info-value">홍길동</span>
                        </div>
                        <div className="detail-info-item">
                          <span className="detail-info-label">고객 ID</span>
                          <span className="detail-info-value">FDW5000024</span>
                        </div>
                        <div className="detail-info-item">
                          <span className="detail-info-label">연락처</span>
                          <span className="detail-info-value">010-1234-5678</span>
                        </div>
                        <div className="detail-info-item">
                          <span className="detail-info-label">이메일</span>
                          <span className="detail-info-value">sdfk3223@naver.com</span>
                        </div>
                      </div>
                      <div className="detail-info-section border-section">
                        <h3 className="detail-section-title">실시간 요약</h3>
                        <div className="summary-item">
                          <div className="summary-item__wrap">
                              <span  className="summary-item__label">자동이체 변경</span>
                              <span  className="summary-item__label">자동이체 변경</span>
                          </div>
                          <div className="summary-item__desc">고객은 보험료 자동이체 계좌 변경방법에 대해 문의하였고, 변경방법을 안내하였음. 추가로 납부금액 변경에 대해 요청하여 본인 인증 후 자동이체 계좌를 변경하고 납부금액을 변경 처리하였음. 추가 문의사항은 더이상 없어 상담을 종료함.</div>
                        </div>
                    </div>
                     <div className="detail-info-section">
                      <h3 className="detail-section-title">감정흐름</h3>
                        <EmotionChart />
                     </div>
                    <div className="detail-info-section">
                      <h3 className="detail-section-title">상담분석</h3>
                      <div className="metrics-grid">
                      
                          <div className="metric-card">
                            <div className="metric-card__header">평균 응답 속도</div>
                            <div className="metric-card__value">
                              <span className="metric-card__number">1.2</span>
                              <span className="metric-card__unit">초</span>
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-card__header">인텐트 인식 성공률</div>
                            <div className="metric-card__value">
                              <span className="metric-card__number">80</span>
                              <span className="metric-card__unit">%</span>
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-card__header">대화턴</div>
                            <div className="metric-card__value">
                              <span className="metric-card__number">32</span>
                              <span className="metric-card__unit">회</span>
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-card__header">Fallback</div>
                            <div className="metric-card__value">
                              <span className="metric-card__number">2</span>
                              <span className="metric-card__unit">회</span>
                            </div>
                          </div>
                      </div>
                    </div>
                     <div className="detail-info-section">
                      <h3 className="detail-section-title">키워드 감지</h3>
                        <div className="detail-keywords-wrap">

                          <div className="detail-keywords-con">
                            <div className="detail-keywords-label">금지어</div>
                            <div className="detail-keywords-list">
                              <button className="detail-keywords-btn active">젠장</button>
                              <button className="detail-keywords-btn">개판</button>
                            </div>
                          </div>
                          <div className="detail-keywords-con">
                            <div className="detail-keywords-label">부정어</div>
                            <div className="detail-keywords-list">
                              <button className="detail-keywords-btn">오류메세지</button>
                              <button className="detail-keywords-btn">에러</button>
                            </div>
                          </div>

                        </div>
                     </div>
                  </div>
              </div>
          </div>
        </div>
    </div>
  );
};

export default ConsultationDetailPanel;
