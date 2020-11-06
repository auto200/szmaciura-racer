import { Link } from "gatsby";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Achievements from "../components/Achievements";
import Cars from "../components/Cars";
import Input from "../components/Input";
import Layout from "../components/Layout";
import OnCompleteModal from "../components/OnCompleteModal";
import ProgressIndicator from "../components/ProgressIndicator";
import History from "../components/Tables/History";
import TopRaces from "../components/Tables/TopRaces";
import Timer from "../components/Timer";
import Word from "../components/Word";
import { useCarsContext } from "../contexts/CarsContext";
import { useStore } from "../contexts/Store";

const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;
const TextWrapper = styled.div`
  padding: 30px;
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
      inputLength,
      lastValidCharIndex,
      inputMaxLength,
      error,
      timePassed,
      onCompleteModalShown,
      history,
    },
    dispatch,
  } = useStore();

  const { currentCarIndex } = useCarsContext();

  const startTimestampRef = useRef<number>();
  const timerAnimationFrameRef = useRef<number>();
  //reset
  const resetEveryting = () => {
    dispatch({ type: "RESET" });
    startTimestampRef.current = undefined;
    timerAnimationFrameRef.current = undefined;
  };
  const resetTimer = () => {
    if (timerAnimationFrameRef.current) {
      cancelAnimationFrame(timerAnimationFrameRef.current);
    }
  };

  useEffect(() => {
    //cleanup
    return resetTimer;
  }, []);

  useEffect(() => {
    if (wordIndex === 0 && inputLength === 0) {
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

    //first keystroke of first word
    if (wordIndex === 0 && inputLength === 1) {
      startTimestampRef.current = Date.now();
      if (!timerAnimationFrameRef.current) {
        timerAnimationFrameRef.current = updateTimer();
      }
    }
  }, [wordIndex, inputLength]);

  return (
    <Layout>
      <Link to={"/online"}>
        <button>GO online</button>
      </Link>
      <ResetButton onClick={resetEveryting}>reset</ResetButton>
      <ProgressContainer>
        <ProgressIndicator
          players={[
            {
              id: "player",
              carIndex: currentCarIndex,
              progress: wordIndex / text.length,
            },
          ]}
        />
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
                charIndex={active ? inputLength : 0}
              />{" "}
            </React.Fragment>
          );
        })}
      </TextWrapper>
      <Input
        word={text[wordIndex]}
        error={error}
        maxLength={inputMaxLength}
        isLastWord={wordIndex === text.length - 1}
        onChange={value => {
          dispatch({ type: "SET_INPUT_LENGTH", payload: value.length });
        }}
        onWordCompleted={() => dispatch({ type: "PROCEED_TO_NEXT_WORD" })}
        onLastWordCompleted={() => {
          dispatch({ type: "RACE_COMPLETED" });
          resetTimer();
        }}
        onEmpty={() => dispatch({ type: "INPUT_EMPTY" })}
        onCorrectLetter={() => dispatch({ type: "CORRECT_INPUT_VALUE" })}
        onError={() => dispatch({ type: "SET_ERROR", payload: true })}
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
