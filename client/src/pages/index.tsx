import { Link } from "gatsby";
import React, { ChangeEvent, useEffect, useRef } from "react";
import styled from "styled-components";
import Achievements from "../components/Achievements";
import Cars from "../components/Cars";
import Layout from "../components/Layout";
import OnCompleteModal from "../components/OnCompleteModal";
import ProgressIndicator from "../components/ProgressIndicator";
import History from "../components/Tables/History";
import TopRaces from "../components/Tables/TopRaces";
import Timer from "../components/Timer";
import Word from "../components/Word";
import { useStore } from "../contexts/Store";

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
const ResetButton = styled.button`
  all: unset;
  align-self: flex-end;
  padding: 5px;
  font-size: 1.5rem;
  :hover {
    color: ${({ theme }) => theme.colors.error};
    cursor: pointer;
  }
`;

const getTimePassedInSec = (startTime: number): string => {
  const msPassed = Date.now() - startTime;
  const seconds = msPassed / 1000;
  return seconds.toFixed(2);
};

const IndexPage: React.FC = () => {
  const {
    state: {
      text,
      wordIndex,
      lastValidCharIndex,
      inputValue,
      inputMaxLength,
      error,
      timePassed,
      onCompleteModalShown,
      history,
    },
    dispatch,
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimestampRef = useRef<number>();
  const timerAnimationFrameRef = useRef<number>();
  //reset
  const resetEveryting = () => {
    dispatch({ type: "RESET" });
    startTimestampRef.current = undefined;
    timerAnimationFrameRef.current = undefined;
  };

  useEffect(() => {
    //cleanup
    return () => {
      if (timerAnimationFrameRef.current) {
        cancelAnimationFrame(timerAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    //correct final word
    if (inputValue === text[wordIndex] && wordIndex === text.length - 1) {
      if (timerAnimationFrameRef.current) {
        cancelAnimationFrame(timerAnimationFrameRef.current);
        if (startTimestampRef.current) {
          const seconds = getTimePassedInSec(startTimestampRef.current);
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
    if (wordIndex === 0 && inputValue.length === 0) {
      resetEveryting();
      return;
    }
    const updateTimer = () =>
      requestAnimationFrame(() => {
        if (startTimestampRef.current) {
          const seconds = getTimePassedInSec(startTimestampRef.current);
          dispatch({ type: "SET_TIME_PASSED", payload: seconds });
          timerAnimationFrameRef.current = updateTimer();
        }
      });

    if (wordIndex === 0 && inputValue.length === 1) {
      startTimestampRef.current = Date.now();
      if (!timerAnimationFrameRef.current) {
        timerAnimationFrameRef.current = updateTimer();
      }
    }
  }, [wordIndex, inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputValue.length - 1 >= inputMaxLength) {
      //add alert later on with instructions to user how to play
      return;
    }
    dispatch({
      type: "SET_INPUT_VALUE",
      payload: e.target.value.toLowerCase(),
    });
  };

  return (
    <Layout>
      <Link to="/online">
        <button>GO online!</button>
      </Link>
      <ResetButton onClick={resetEveryting}>reset</ResetButton>
      <ProgressContainer>
        <ProgressIndicator progress={wordIndex / text.length} />
        <Timer timePassed={timePassed} />
      </ProgressContainer>
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
        autoFocus
      />
      <TopRaces history={history} />
      <History history={history} />
      <Achievements history={history} />
      <Cars history={history} />
      {onCompleteModalShown && (
        <OnCompleteModal onClose={resetEveryting} time={timePassed} />
      )}
    </Layout>
  );
};

export default IndexPage;
