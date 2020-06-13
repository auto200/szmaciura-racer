import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import SEO from "../components/seo";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { darkTheme } from "../utils/theme";
import ProgressIndicator from "../components/ProgressIndicator";
import Timer from "../components/Timer";
import Word from "../components/Word";

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
  padding: 5px 20px;
`;
const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
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

const getInputMaxLength = (activeWord: string): number => {
  const length = activeWord.length * 2;
  return length >= 8 ? length : 8;
};

const IndexPage = () => {
  const [text] = useState<string[]>(szmaciuraText.split(" "));
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [lastValidCharIndex, setLastValidCharIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputMaxLength, setInputMaxLength] = useState<number>(
    getInputMaxLength(text[0])
  );
  const [error, setError] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimestamp = useRef<number>();
  const [timePassed, setTimePassed] = useState<string>("0");
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    timerIntervalRef.current = setInterval(() => {
      if (!startTimestamp.current) return;
      const msPassed = Date.now() - startTimestamp.current;
      const seconds = msPassed / 1000;
      setTimePassed(seconds.toFixed(2));
    }, 300);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    //correct final word
    if (inputValue === text[wordIndex] && wordIndex === text.length - 1) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      alert(timePassed + "s");
      return;
    }
    if (inputValue === text[wordIndex] + " ") {
      setWordIndex(i => i + 1);
      setInputValue("");
      setLastValidCharIndex(-1);
      return;
    }
    if (!inputValue) {
      setLastValidCharIndex(-1);
      if (error) setError(false);
      return;
    }
    if (text[wordIndex].startsWith(inputValue)) {
      setLastValidCharIndex(inputValue.length - 1);
      if (error) setError(false);
      return;
    }
    setError(true);
  }, [inputValue]);

  useEffect(() => {
    if (wordIndex >= text.length) {
      setWordIndex(0);
      return;
    }
    setInputMaxLength(getInputMaxLength(text[wordIndex]));
  }, [wordIndex]);

  useEffect(() => {
    if (wordIndex === 0 && inputValue) {
      startTimestamp.current = Date.now();
    }
  }, [wordIndex, inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputValue.length - 1 >= inputMaxLength) {
      //add alert later on with instructions to user how to play
      return;
    }
    setInputValue(e.target.value);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <>
        <SEO title="Home" />
        <GlobalStyle />
        <InnerWrapper>
          <ProgressContainer>
            <ProgressIndicator progress={wordIndex / text.length} />
            <Timer timePassed={timePassed} />
          </ProgressContainer>
          <TextWrapper>
            {text.map((word, i) => {
              const active = wordIndex === i;
              return (
                <React.Fragment key={"word" + i}>
                  <Word
                    word={word}
                    active={active}
                    error={active ? error : false}
                    lastValidCharIndex={active ? lastValidCharIndex : -1}
                    charIndex={active ? inputValue.length : 0}
                  />
                  <span> </span>
                </React.Fragment>
              );
            })}
          </TextWrapper>
          <Input
            type="text"
            ref={inputRef}
            value={inputValue}
            error={error}
            onChange={handleInputChange}
            maxLength={inputMaxLength}
          ></Input>
        </InnerWrapper>
      </>
    </ThemeProvider>
  );
};

export default IndexPage;
