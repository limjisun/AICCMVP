import React, { useState, useEffect } from 'react';

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      className="table-input"
      placeholder={placeholder}
    />
  );
};
