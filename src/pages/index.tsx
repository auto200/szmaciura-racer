import React, { useEffect, ChangeEvent, useRef } from "react";
import SEO from "../components/Seo";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { darkTheme } from "../utils/theme";
import ProgressIndicator from "../components/ProgressIndicator";
import Timer from "../components/Timer";
import Word from "../components/Word";
import OnCompleteModal from "../components/OnCompleteModal";
import TopRaces from "../components/Tables/TopRaces";
import History from "../components/Tables/History";
import { useStore } from "../contexts/Store";

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

const getTimePassedInSec = (startTime: number): string => {
  const msPassed = Date.now() - startTime;
  const seconds = msPassed / 1000;
  return seconds.toFixed(2);
};

// Pomysły:
// samochody do wybierania odblokowywane za lepszy czas

//TODO: fix poor performance of interval, setting state in interval here causes all the components to rerender

const IndexPage = () => {
  const {
    state: {
      text,
      wordIndex,
      lastValidCharIndex,
      inputValue,
      inputMaxLength,
      error,
      timePassed,
      onCompletedModalShown,
      history,
    },
    dispatch,
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimestamp = useRef<number>();
  const timerIntervalRef = useRef<number>();

  //reset
  const onCompleteModalClose = () => {
    dispatch({ type: "RESET" });
    startTimestamp.current = undefined;
    timerIntervalRef.current = undefined;
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
          dispatch({ type: "SET_TIME_PASSED", payload: seconds });
        }
      }
      dispatch({ type: "RACE_COMPLETED" });
      return;
    }
    //word correctly typed
    if (inputValue === text[wordIndex] + " ") {
      dispatch({ type: "PROCEED_TO_NEXT_WORD" });
      return;
    }
    if (!inputValue) {
      dispatch({ type: "INPUT_EMPTY" });
      return;
    }
    if (text[wordIndex].startsWith(inputValue)) {
      dispatch({ type: "CORRECT_INPUT_VALUE" });
      return;
    }
    dispatch({ type: "SET_ERROR", payload: true });
  }, [inputValue]);

  useEffect(() => {
    if (wordIndex >= text.length) {
      dispatch({ type: "SET_WORD_INDEX", payload: 0 });
      return;
    }
  }, [wordIndex]);

  //start/restart timer on first character of first word
  useEffect(() => {
    if (wordIndex === 0 && inputValue.length === 1) {
      startTimestamp.current = Date.now();
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          if (startTimestamp.current) {
            const seconds = getTimePassedInSec(startTimestamp.current);
            dispatch({ type: "SET_TIME_PASSED", payload: seconds });
          }
        }, 300);
      }
    }
  }, [wordIndex, inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputValue.length - 1 >= inputMaxLength) {
      //add alert later on with instructions to user how to play
      return;
    }
    dispatch({ type: "SET_INPUT_VALUE", payload: e.target.value });
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
