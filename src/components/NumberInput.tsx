import React from "react";

interface NumberInputProps {
  value: number | string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  noDecimals?: boolean;
  id?: string;
  placeholder?: string;
}

const NumberInput = ({
  value,
  onChange,
  noDecimals = false,
  id,
  placeholder,
}: NumberInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    let regex;
    if (noDecimals) {
      regex = /^\d*$/;
    } else {
      regex = /^\d*\.?\d*$/;
    }
    if (regex.test(inputValue)) {
      onChange(event);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={handleChange}
      inputMode="decimal"
      className="input-material"
      placeholder={placeholder}
      onFocus={handleFocus}
    />
  );
};

export default NumberInput;
