import React, { useState } from 'react';
import type { KeywordTabType } from '../types';
import KeywordsTable from '../components/keywords/KeywordsTable';

const Keywords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KeywordTabType>('synonym');

  return (
    <div className="page-keywords">
      <h3 className="page-title">Keyword Dictionary</h3>

      {/* 탭 */}
      <div className="keywords-tabs">
        <button
          className={`keywords-tab ${
            activeTab === 'synonym' ? 'keywords-tab--active' : ''
          }`}
          onClick={() => setActiveTab('synonym')}
        >
          동의어 <span className="keywords-count">0</span>
        </button>
        <button
          className={`keywords-tab ${
            activeTab === 'misrecognition' ? 'keywords-tab--active' : ''
          }`}
          onClick={() => setActiveTab('misrecognition')}
        >
          오인식 교정 <span className="keywords-count">0</span>
        </button>
      </div>

      {/* 테이블 */}
      <KeywordsTable tabType={activeTab} />
    </div>
  );
};

export default Keywords;
