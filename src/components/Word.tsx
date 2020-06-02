import React from "react";
import styled, { css } from "styled-components";
import cursorGIF from "../assets/cursor.gif";

const StyledWord = styled.span<{ readonly active: boolean }>`
  text-decoration: ${({ active }) => active && "underline"};
`;
const Char = styled.span<{
  readonly cursor: boolean;
  readonly success: boolean;
  readonly error: boolean;
}>`
  ${({ cursor }) =>
    cursor &&
    css`
      background-image: url(${cursorGIF});
      background-repeat: repeat-y;
    `}
  ${({ success }) =>
    success &&
    css`
      background-color: ${({ theme }) => theme.colors.success};
    `}
    ${({ error }) =>
      error &&
      css`
        background-color: ${({ theme }) => theme.colors.error};
      `}
`;

interface Props {
  word: string;
  active: boolean;
  charIndex: number;
  error: boolean;
  lastValidCharIndex: number;
}

const Word = ({
  word,
  active,
  charIndex,
  error,
  lastValidCharIndex,
}: Props) => {
  return (
    <StyledWord
      active={active}
      onClick={() => console.log(word, active, charIndex)}
    >
      {word.split("").map((char, i) => (
        <Char
          key={"char" + i}
          cursor={active && i === charIndex}
          success={active && i <= lastValidCharIndex}
          error={active && error && i < charIndex && i > lastValidCharIndex}
        >
          {char}
        </Char>
      ))}
    </StyledWord>
  );
};

export default Word;
