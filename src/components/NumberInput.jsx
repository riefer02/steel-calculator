import React from "react";

const NumberInput = ({ value, onChange }) => {
  const handleChange = (event) => {
    const inputValue = event.target.value;
    if (/^\d*\.?\d*$/.test(inputValue)) {
      onChange(event);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      inputMode="decimal"
      className="input-material"
    />
  );
};

export default NumberInput;
