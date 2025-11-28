import React from 'react';
import { X } from 'lucide-react';

interface DetailPanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ title, onClose, children }) => {
  return (
    <div className="detail-panel">
      {/* 헤더 */}
      <div className="detail-header">
        <div className="detail-header-content">
          <div className="detail-indicator"></div>
          <h3 className="detail-title">{title}</h3>
        </div>
        <button
          className="detail-close-btn"
          onClick={onClose}
        >
          <X className="icon" />
        </button>
      </div>

      {/* 내용 */}
      <div className="detail-body">
        {children}
      </div>
    </div>
  );
};

export default DetailPanel;
