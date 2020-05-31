import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import SEO from "../components/seo";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { darkTheme } from "../utils/theme";

const szmaciuraText =
  "ty no nie wiem jak tam twoja szmaciura jebana zrogowaciala niedzwiedzica co sie kurwi pod mostem za wojaka i siada kurwa na butle od vanisha i kurwe w taczce pijana wozili po osiedlu wiesz o co chodzi mnie nie przegadasz bo mi sperme z paly zjadasz frajerze zrogowacialy frajerska chmuro chuj ci na matule i jebac ci starego";

const GlobalStyle = createGlobalStyle<any>`
  html,body{
    margin:0;
    padding:0;
    box-sizing:border-box;
    background-color:${({ theme }) => theme.colors.primary};
    color:${({ theme }) => theme.colors.secondary};
    display: flex;
    justify-content: center;
    min-height:100vh;
    font-size:1.3rem;
  }
  #gatsby-focus-wrapper{
    height:100%;
  }
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1024px;
  height: 100%;
  border: 2px solid white;
`;
const TextWrapper = styled.div`
  padding: 30px;
`;
const Input = styled.input<{ error: boolean }>`
  width: 50%;
  height: 30px;
  font-size: 25px;
  color: white;
  background-color: ${({ theme, error }) =>
    error ? theme.colors.error : "transparent"};
`;

const IndexPage = () => {
  const [text] = useState<string[]>(szmaciuraText.split(" "));
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!inputValue) {
      if (error) setError(false);
      return;
    }
    if (text[wordIndex].startsWith(inputValue)) {
      if (error) setError(false);
    }
    if (inputValue === text[wordIndex] + " ") {
      setWordIndex(i => i + 1);
      setInputValue("");
      return;
    }
    setError(true);
  }, [inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInputValue(e.target.value);

  return (
    <ThemeProvider theme={darkTheme}>
      <>
        <SEO title="Home" />
        <GlobalStyle />
        <InnerWrapper>
          <TextWrapper>
            {text.map((word, i) => (
              <React.Fragment key={"word" + i}>
                <Word
                  word={word}
                  active={wordIndex === i}
                  charIndex={wordIndex === i ? inputValue.length : 0}
                />
                <span> </span>
              </React.Fragment>
            ))}
          </TextWrapper>
          <Input
            type="text"
            ref={inputRef}
            value={inputValue}
            error={error}
            onChange={handleInputChange}
          ></Input>
        </InnerWrapper>
      </>
    </ThemeProvider>
  );
};

const SyledWord = styled.span<{ active: boolean }>`
  text-decoration: ${({ active }) => active && "underline"};

  .activeChar {
    color: red;
  }
`;

interface WordProps {
  word: string;
  active: boolean;
  charIndex: number;
  error?: boolean;
}
const Word = ({ word, active, charIndex }: WordProps) => {
  return (
    <SyledWord
      active={active}
      onClick={() => console.log(word, active, charIndex)}
    >
      {word.split("").map((char, i) => (
        <span
          key={"char" + i}
          className={active && charIndex === i ? "activeChar" : ""}
        >
          {char}
        </span>
      ))}
    </SyledWord>
  );
};

export default IndexPage;
