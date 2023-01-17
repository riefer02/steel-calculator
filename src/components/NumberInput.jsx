import React from "react";

const NumberInput = ({ value, onChange, noDecimals = false }) => {
  const handleChange = (event) => {
    const inputValue = event.target.value;
    // if (/^\d*\.?\d*$/.test(inputValue)) {
    //   onChange(event);
    // }

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

  const handleFocus = (event) => {
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
