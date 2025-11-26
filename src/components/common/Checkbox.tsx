import React from 'react';
import checkboxOn from '../../assets/images/checkbox_on.png';
import checkboxOff from '../../assets/images/checkbox_off.png';
import './Checkbox.css';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  indeterminate = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  return (
    <div
      className={`checkbox-wrapper ${disabled ? 'checkbox-disabled' : ''}`}
      onClick={handleClick}
    >
      <img
        src={checked || indeterminate ? checkboxOn : checkboxOff}
        alt={checked ? 'checked' : 'unchecked'}
        className="checkbox-image"
      />
    </div>
  );
};
