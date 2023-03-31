import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Achievements from "../components/Achievements";
import Cars from "../components/Cars";
import Input from "../components/Input";
import Layout from "../components/Layout";
import GoOnline from "../components/Links/GoOnline";
import OnCompleteModal from "../components/OnCompleteModal";
import ProgressIndicator from "../components/ProgressIndicator";
import { ProgressContainer } from "../components/sharedStyledComponents";
import History from "../components/Tables/History";
import TopRaces from "../components/Tables/TopRaces";
import Text from "../components/Text";
import Timer, { TimerFunctions } from "../components/Timer";
import { useCarsContext } from "../contexts/CarsContext";
import { useStore } from "../contexts/Store";

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
      textID,
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
  const currentTextHistory = history[textID] || [];

  //reset
  const resetEverything = () => {
    dispatch({ type: "RESET" });
    timerRef.current?.reset();
  };

  useEffect(() => {
    //cleanup
    return timerRef.current?.reset;
  }, []);

  useEffect(() => {
    if (wordIndex === 0 && inputLength === 0) {
      resetEverything();
      return;
    }

    //first keystroke of first word
    if (wordIndex === 0 && inputLength === 1) {
      timerRef.current?.start();
    }
  }, [wordIndex, inputLength]);

  return (
    <>
      <GoOnline to={"/online"} onClick={() => dispatch({ type: "RESET" })} />
      <Layout>
        <ResetButton onClick={resetEverything}>reset</ResetButton>
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
        <Text
          text={text}
          wordIndex={wordIndex}
          error={error}
          lastValidCharIndex={lastValidCharIndex}
          inputLength={inputLength}
        />
        <Input
          word={text[wordIndex]}
          error={error}
          maxLength={inputMaxLength}
          isLastWord={wordIndex === text.length - 1}
          onChange={(value) => {
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
        <TopRaces history={currentTextHistory} />
        <History history={currentTextHistory} />
        <Achievements history={currentTextHistory} />
        <Cars history={currentTextHistory} />
        {onCompleteModalShown && (
          <OnCompleteModal
            onClose={resetEverything}
            time={timerRef.current?.getTime()!}
          />
        )}
      </Layout>
    </>
  );
};

export default IndexPage;
