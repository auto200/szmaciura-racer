import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import SEO from "../components/seo";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { darkTheme } from "../utils/theme";
import ProgressIndicator from "../components/ProgressIndicator";
import Timer from "../components/Timer";
import Word from "../components/Word";
import OnCompleteModal from "../components/OnCompleteModal";
import { v4 as uuid } from "uuid";
import TopRaces from "../components/Tables/TopRaces";
import History from "../components/Tables/History";

const szmaciuraText =
  "ty no nie wiem jak tam twoja szmaciura jebana zrogowaciala niedzwiedzica co sie kurwi pod mostem za wojaka i siada kurwa na butle od vanisha i kurwe w taczce pijana wozili po osiedlu wiesz o co chodzi mnie nie przegadasz bo mi sperme z paly zjadasz frajerze zrogowacialy frajerska chmuro chuj ci na matule i jebac ci starego";

const GlobalStyle = createGlobalStyle<any>`
  html, body {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};
    display: flex;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.3rem;
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  #gatsby-focus-wrapper{
    padding-top: 300px;
    border: 2px solid white;
    height: 100%;
  }
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1024px;
  height: 100%;
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

const getTimePassedInSec = (startTime: number): string => {
  const msPassed = Date.now() - startTime;
  const seconds = msPassed / 1000;
  return seconds.toFixed(2);
};

export type historyType = {
  id: string;
  timestamp: number;
  time: string;
};
// Pomysły:
// samochody do wybierania odblokowywane za lepszy czas

const text = szmaciuraText.split(" ").slice(0, 10);

//TODO: fix poor performance of interval, setting state in interval here causes all the components to rerender

const IndexPage = () => {
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
  const timerIntervalRef = useRef<number>();
  const [onCompletedModalShown, setOnCompletedModalShown] = useState<boolean>(
    false
  );
  const [history, setHistory] = useState<historyType[]>([]);

  //reset
  const onCompleteModalClose = () => {
    setWordIndex(0);
    setLastValidCharIndex(-1);
    setInputValue("");
    setTimePassed("0");
    startTimestamp.current = undefined;
    timerIntervalRef.current = undefined;
    setOnCompletedModalShown(false);
  };

  useEffect(() => {
    inputRef.current?.focus();

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
        if (startTimestamp.current) {
          const seconds = getTimePassedInSec(startTimestamp.current);
          setTimePassed(seconds);
        }
      }
      setOnCompletedModalShown(true);
      setHistory(prev => [
        { id: uuid(), timestamp: Date.now(), time: timePassed },
        ...prev,
      ]);
      return;
    }
    //word correctly typed
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

  //start/restart timer on first character of first word
  useEffect(() => {
    if (wordIndex === 0 && inputValue.length === 1) {
      startTimestamp.current = Date.now();
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          if (startTimestamp.current) {
            const seconds = getTimePassedInSec(startTimestamp.current);
            setTimePassed(seconds);
          }
        }, 300);
      }
    }
  }, [wordIndex, inputValue]);

  useEffect(() => {
    if (!history.length) {
      try {
        const storedHistory = window.localStorage.getItem("history");
        if (!storedHistory) return;
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) setHistory(parsedHistory);
      } catch (err) {
        return;
      }
    }
    try {
      window.localStorage.setItem("history", JSON.stringify(history));
    } catch (err) {}
    console.log("hisotry changed");
  }, [history]);

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
        <SEO title="SzmaciuraRacer - Rafonix szmaciura" />
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
                  />{" "}
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
          <TopRaces history={history} />
          <History history={history} />
        </InnerWrapper>
        <OnCompleteModal
          isOpen={onCompletedModalShown}
          onClose={onCompleteModalClose}
          time={timePassed}
        />
      </>
    </ThemeProvider>
  );
};

export default IndexPage;
