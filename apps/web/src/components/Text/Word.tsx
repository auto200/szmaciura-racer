import React, { memo } from "react";
import styled, { css } from "styled-components";

const StyledWord = styled.span<{ readonly active: boolean }>`
  text-decoration: ${({ active }) => active && "underline"};
`;
const Char = styled.span<{
  readonly $cursor: boolean;
  readonly success: boolean;
  readonly error: boolean;
}>`
  ${({ $cursor }) =>
    $cursor &&
    css`
      background-image: url(/cursor.gif);
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

const Word: React.FC<Props> = ({
  word,
  active,
  charIndex,
  error,
  lastValidCharIndex,
}) => {
  return (
    <StyledWord active={active}>
      {word.split("").map((char, i) => (
        <Char
          key={i}
          $cursor={active && i === charIndex}
          success={i <= lastValidCharIndex}
          error={error && i < charIndex && i > lastValidCharIndex}
        >
          {char}
        </Char>
      ))}
    </StyledWord>
  );
};

export default memo(Word);
