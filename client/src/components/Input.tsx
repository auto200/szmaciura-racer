import React, { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";

const StyledInput = styled.input<{ error: boolean }>`
  width: 50%;
  height: 30px;
  font-size: 25px;
  color: white;
  background-color: ${({ theme, error }) =>
    error ? theme.colors.error : "transparent"};
`;
interface InputProps {
  word: string;
  maxLength: number;
  error: boolean;
  isLastWord: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  onError: () => void;
  onCorrectLetter: () => void;
  onEmpty: () => void;
  onWordCompleted: () => void;
  onLastWordCompleted: () => void;
  onChange: (value: string) => void;
  onMaxLenghtReached?: () => void;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      word,
      maxLength,
      error,
      isLastWord,
      autoFocus,
      disabled,
      onError = () => {},
      onCorrectLetter = () => {},
      onEmpty = () => {},
      onWordCompleted = () => {},
      onLastWordCompleted = () => {},
      onChange = () => {},
      onMaxLenghtReached = () => {},
    },
    ref
  ) => {
    const [value, setValue] = useState<string>("");
    useEffect(() => {
      if (isLastWord && value === word) {
        onLastWordCompleted();
        setValue("");
        return;
      }
      //word correctly typed
      if (value === word + " ") {
        onWordCompleted();
        setValue("");
        return;
      }
      if (!value) {
        onEmpty();
        return;
      }
      if (word.startsWith(value)) {
        onCorrectLetter();
        return;
      }
      onError();
    }, [value]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toLowerCase();
      if (val.length - 1 >= maxLength) {
        //TODO add alert later on with instructions to user how to play
        onMaxLenghtReached();
        return;
      }
      onChange(val);
      setValue(val);
    };

    return (
      <StyledInput
        ref={ref}
        type="text"
        value={value}
        error={error}
        onChange={handleInputChange}
        autoFocus={autoFocus}
        disabled={disabled}
      />
    );
  }
);

export default Input;
