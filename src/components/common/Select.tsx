import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // 드롭다운 위치 계산
  useEffect(() => {
    if (isOpen && selectRef.current && dropdownRef.current) {
      const selectRect = selectRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // 아래쪽 공간이 부족하면 위로 표시
      const spaceBelow = viewportHeight - selectRect.bottom;
      const spaceAbove = selectRect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className={`custom-select ${isOpen ? 'custom-select--open' : ''} ${
        disabled ? 'custom-select--disabled' : ''
      } ${className}`}
    >
      <div className="custom-select__trigger" onClick={handleToggle}>
        <span className="custom-select__value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="custom-select__arrow"></span>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`custom-select__dropdown custom-select__dropdown--${dropdownPosition}`}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select__option ${
                option.value === value ? 'custom-select__option--selected' : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
