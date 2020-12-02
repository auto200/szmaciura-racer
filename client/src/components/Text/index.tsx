import React from "react";
import styled from "styled-components";
import Word from "./Word";

export const TextWrapper = styled.div`
  padding: 30px;
`;

interface Props {
  text: string[];
  wordIndex: number;
  error: boolean;
  lastValidCharIndex: number;
  inputLength: number;
}

const Text: React.FC<Props> = ({
  text,
  wordIndex,
  error,
  lastValidCharIndex,
  inputLength,
}) => {
  return (
    <TextWrapper>
      {text.map((word, i) => {
        const active = wordIndex === i;
        return (
          <React.Fragment key={i}>
            <Word
              word={word}
              active={active}
              error={active ? error : false}
              lastValidCharIndex={active ? lastValidCharIndex : -1}
              charIndex={active ? inputLength : 0}
            />{" "}
          </React.Fragment>
        );
      })}
    </TextWrapper>
  );
};

export default Text;
