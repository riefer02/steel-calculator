import React from "react";

interface NumberInputProps {
  value: number | string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  noDecimals?: boolean;
}

const NumberInput = ({
  value,
  onChange,
  noDecimals = false,
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
      value={value}
      onChange={handleChange}
      inputMode="decimal"
      className="input-material"
      onFocus={handleFocus}
    />
  );
};

export default NumberInput;
