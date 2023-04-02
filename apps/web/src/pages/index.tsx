import Input from "@components/Input";
import Layout from "@components/Layout";
import GoOnline from "@components/Links/GoOnline";
import OnCompleteModal from "@components/OnCompleteModal";
import ProgressIndicator from "@components/ProgressIndicator";
import Text from "@components/Text";
import Timer, { TimerFunctions } from "@components/Timer";
import { ProgressContainer } from "@components/sharedStyledComponents";
import { GAMES_HISTORY_LS_KEY } from "@consts/consts";
import { useStore } from "@contexts/Store";
import { useGamesHistory } from "@hooks/useGamesHistory";
import { useOfflineCarAvatars } from "@hooks/useOfflineCarAvatars";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

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
    },
    dispatch,
  } = useStore();
  const { cars, currentCarAvatarSrc, setCurrentCarAvatarSrc } =
    useOfflineCarAvatars();
  const { gamesHistory, addToGamesHistory } = useGamesHistory(
    GAMES_HISTORY_LS_KEY.offline
  );

  const timerRef = useRef<TimerFunctions>(null);

  const currentTextHistory = gamesHistory[textID]?.history || [];

  const resetEverything = useCallback(() => {
    dispatch({ type: "RESET" });
    timerRef.current?.reset();
  }, [dispatch]);

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
  }, [wordIndex, inputLength, resetEverything]);

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
                carAvatarSrc: currentCarAvatarSrc,
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
          word={text[wordIndex] || ""}
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
            });
            addToGamesHistory(textID, timerRef.current!.getTime());
          }}
          onEmpty={() => dispatch({ type: "INPUT_EMPTY" })}
          onCorrectLetter={() => dispatch({ type: "CORRECT_INPUT_VALUE" })}
          onError={() => dispatch({ type: "SET_ERROR", payload: true })}
          autoFocus
        />
        <TopRaces history={currentTextHistory} />
        <History history={currentTextHistory} />
        <Achievements history={currentTextHistory} />
        <Cars
          history={currentTextHistory}
          cars={cars}
          currentCarAvatarSrc={currentCarAvatarSrc}
          setCurrentCarAvatarSrc={setCurrentCarAvatarSrc}
        />
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

const TopRaces = dynamic(
  import("../components/Tables/TopRaces").then((module) => module.TopRaces),
  { ssr: false }
);
const History = dynamic(
  import("../components/Tables/History").then((module) => module.History),
  { ssr: false }
);
const Achievements = dynamic(
  import("../components/Achievements").then((module) => module.Achievements),
  { ssr: false }
);
const Cars = dynamic(
  import("../components/Cars").then((module) => module.Cars),
  { ssr: false }
);

export default IndexPage;
