import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useConsultationHistoryStore } from '@/stores/consultationHistoryStore';
import EmotionChart from '../common/EmotionChart';
import AudioWaveform from '../common/AudioWaveform';
import type { EmotionPoint } from '@/types';

const ConsultationDetailPanel: React.FC = () => {
  const { selectedHistory, setIsDetailPanelOpen } = useConsultationHistoryStore();
  const conversationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // 모든 키워드 목록
  const allKeywords = useMemo(() => {
    const keywords: string[] = [];
    if (selectedHistory?.keywords?.forbidden) {
      keywords.push(...selectedHistory.keywords.forbidden);
    }
    if (selectedHistory?.keywords?.negative) {
      keywords.push(...selectedHistory.keywords.negative);
    }
    return keywords;
  }, [selectedHistory]);

  // 대화 내역에서 감정 데이터 추출 (사용자 발화만)
  const emotionData = useMemo<EmotionPoint[]>(() => {
    if (!selectedHistory || !selectedHistory.conversation) return [];

    return selectedHistory.conversation
      .filter(msg => msg.type === 'user' && msg.emotion)
      .map((msg, index) => {
        const emotionValues: Record<string, number> = {
          'very_positive': 4,
          'positive': 3,
          'neutral': 2,
          'negative': 1,
          'very_negative': 0,
        };

        return {
          index: index + 1,
          emotion: msg.emotion!,
          value: emotionValues[msg.emotion!] || 2,
          message: msg.text,
          time: msg.time,
        };
      });
  }, [selectedHistory]);

  // WaveSurfer에서 현재 재생 시간 받기
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // 현재 재생 중인 대화 찾기
  const activeConversationIndex = selectedHistory?.conversation?.findIndex(
    conv => currentTime >= conv.startTime && currentTime < conv.endTime
  ) ?? -1;

  // 활성화된 대화로 자동 스크롤
  useEffect(() => {
    if (activeConversationIndex !== -1 && conversationRefs.current[activeConversationIndex]) {
      conversationRefs.current[activeConversationIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeConversationIndex]);

  // 키워드 클릭 시 해당 대화로 스크롤
  const handleKeywordClick = (keyword: string) => {
    setSelectedKeyword(keyword);

    // 키워드가 포함된 대화 찾기
    const conversationIndex = selectedHistory?.conversation?.findIndex(
      conv => conv.text.includes(keyword)
    ) ?? -1;

    if (conversationIndex !== -1 && conversationRefs.current[conversationIndex]) {
      conversationRefs.current[conversationIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // 텍스트에서 키워드를 찾아 <span class="detect">로 감싸기
  const highlightKeywords = (text: string) => {
    if (allKeywords.length === 0) return text;

    let highlightedText = text;
    allKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="detect">$1</span>');
    });

    return highlightedText;
  };

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
                      className={`detail-source-icon detail-source-icon--${selectedHistory.channel === '콜' ? 'call' : 'chat'}`}
                    /> 
                    <div className="detail-panel__title-consult-left">
                      <div className="detail-panel__title-consult-title">{selectedHistory.consultationType}</div>
                      <div className="detail-panel__title-consult-dec">상담일시 : {selectedHistory.createdAt}  상담결과 : {selectedHistory.status}</div>
                    </div>
                  </div>
                 </div>
                <button className="detail-panel__close" onClick={() => setIsDetailPanelOpen(false)}>×</button>
              </div>
              <div className="detail-panel__body">
                  <div className='detail-panel-left'>
                     <div className='detail-panel-stt'>
                      <h3 className="detail-section-title">상담내용</h3>
                      <div className="detail-conversation-area">
                          {selectedHistory.conversation?.map((conv, index) => (
                            <div
                              key={index}
                              ref={(el) => { conversationRefs.current[index] = el; }}
                              className={`conversation-item conversation-item--${conv.type} ${activeConversationIndex === index ? 'Play' : ''}`}
                            >
                              <div className="conversation-bubble">
                                <div
                                  className="conversation-text"
                                  dangerouslySetInnerHTML={{ __html: highlightKeywords(conv.text) }}
                                />
                              </div>
                              <div className="conversation-meta">
                                <span className="conversation-time">{conv.time}</span>
                                {conv.responseTime && (
                                  <span className="conversation-response-time">{conv.responseTime}</span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                     </div>
                    {selectedHistory.channel === '콜' && selectedHistory.audioUrl && (
                      <div className='detail-panel-record'>
                        <h3 className="detail-section-title">상담정보</h3>
                        <AudioWaveform
                          audioUrl={selectedHistory.audioUrl}
                          onTimeUpdate={handleTimeUpdate}
                          className="consultation-audio-player"
                        />
                      </div>
                    )}
                  </div>
                  <div className='detail-panael-right'>
                       <div className="detail-info-section border-section">
                        <h3 className="detail-section-title">기본 정보</h3>
                        <div className="detail-info-item">
                          <span className="detail-info-label">고객명</span>
                          <span className="detail-info-value">{selectedHistory.customerName}</span>
                        </div>
                        {selectedHistory.customerId && (
                          <div className="detail-info-item">
                            <span className="detail-info-label">고객 ID</span>
                            <span className="detail-info-value">{selectedHistory.customerId}</span>
                          </div>
                        )}
                        <div className="detail-info-item">
                          <span className="detail-info-label">연락처</span>
                          <span className="detail-info-value">{selectedHistory.contactPhone}</span>
                        </div>
                        <div className="detail-info-item">
                          <span className="detail-info-label">이메일</span>
                          <span className="detail-info-value">{selectedHistory.email}</span>
                        </div>
                      </div>
                      {selectedHistory.summary && (
                        <div className="detail-info-section border-section">
                          <h3 className="detail-section-title">실시간 요약</h3>
                          <div className="summary-item">
                            <div className="summary-item__wrap">
                              {selectedHistory.summary.tags.map((tag, index) => (
                                <span key={index} className="summary-item__label">{tag}</span>
                              ))}
                            </div>
                            <div className="summary-item__desc">{selectedHistory.summary.description}</div>
                          </div>
                        </div>
                      )}
                     <div className="detail-info-section">
                      <h3 className="detail-section-title">감정흐름</h3>
                        {emotionData.length > 0 && (
                          <EmotionChart data={emotionData} />
                        )}
                     </div>
                    {selectedHistory.metrics && selectedHistory.metrics.length > 0 && (
                      <div className="detail-info-section">
                        <h3 className="detail-section-title">상담분석</h3>
                        <div className="metrics-grid">
                          {selectedHistory.metrics.map((metric, index) => (
                            <div key={index} className="metric-card">
                              <div className="metric-card__header">{metric.label}</div>
                              <div className="metric-card__value">
                                <span className="metric-card__number">{metric.value}</span>
                                <span className="metric-card__unit">{metric.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                     {selectedHistory.keywords && (
                       <div className="detail-info-section">
                        <h3 className="detail-section-title">키워드 감지</h3>
                          <div className="detail-keywords-wrap">
                            {selectedHistory.keywords.forbidden && selectedHistory.keywords.forbidden.length > 0 && (
                              <div className="detail-keywords-con">
                                <div className="detail-keywords-label">금지어</div>
                                <div className="detail-keywords-list">
                                  {selectedHistory.keywords.forbidden.map((keyword, index) => (
                                    <button
                                      key={index}
                                      className={`detail-keywords-btn ${selectedKeyword === keyword ? 'active' : ''}`}
                                      onClick={() => handleKeywordClick(keyword)}
                                    >
                                      {keyword}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedHistory.keywords.negative && selectedHistory.keywords.negative.length > 0 && (
                              <div className="detail-keywords-con">
                                <div className="detail-keywords-label">부정어</div>
                                <div className="detail-keywords-list">
                                  {selectedHistory.keywords.negative.map((keyword, index) => (
                                    <button
                                      key={index}
                                      className={`detail-keywords-btn ${selectedKeyword === keyword ? 'active' : ''}`}
                                      onClick={() => handleKeywordClick(keyword)}
                                    >
                                      {keyword}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                       </div>
                     )}
                  </div>
              </div>
          </div>
        </div>
    </div>
  );
};

export default ConsultationDetailPanel;
