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
import Timer, { TimerFunctions } from "../components/Timer";
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

const IndexPage: React.FC = () => {
  const {
    state: {
      text,
      wordIndex,
      inputLength,
      lastValidCharIndex,
      inputMaxLength,
      error,
      onCompleteModalShown,
      history,
    },
    dispatch,
  } = useStore();

  const { currentCarIndex } = useCarsContext();
  const timerRef = useRef<TimerFunctions>(null);

  //reset
  const resetEveryting = () => {
    dispatch({ type: "RESET" });
    timerRef.current?.reset();
  };

  useEffect(() => {
    //cleanup
    return timerRef.current?.reset;
  }, []);

  useEffect(() => {
    if (wordIndex === 0 && inputLength === 0) {
      resetEveryting();
      return;
    }

    //first keystroke of first word
    if (wordIndex === 0 && inputLength === 1) {
      timerRef.current?.start();
      }
  }, [wordIndex, inputLength]);

  return (
    <Layout>
      <Link to={"/online"} onClick={() => dispatch({ type: "RESET" })}>
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
        <Timer ref={timerRef} />
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
          timerRef.current?.stop();
          dispatch({
            type: "RACE_COMPLETED",
            payload: timerRef.current?.getTime()!,
          });
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
        <OnCompleteModal
          onClose={resetEveryting}
          time={timerRef.current?.getTime()!}
        />
      )}
    </Layout>
  );
};

export default IndexPage;
