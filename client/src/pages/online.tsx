import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Layout from "../components/Layout";
import styled from "styled-components";
import { SOCKET_EVENTS } from "../../../shared/";
import ProgressIndicator from "../components/ProgressIndicator";
import { Room } from "../../../shared/interfaces";
import {
  GameModeLink,
  ProgressContainer,
  TextWrapper,
} from "../components/sharedStyled";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import Word from "../components/Word";
import { useStore } from "../contexts/Store";
import Input from "../components/Input";
import Timer, { TimerFunctions } from "../components/Timer";

const JoinRace = styled.div`
  font-size: 2.3rem;
  color: ${({ theme }) => theme.colors.golden};
  border-bottom: 2px solid black;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
`;
const InQueTimer = styled.div`
  font-weight: bold;
  span {
    color: ${({ theme }) => theme.colors.golden};
  }
`;

enum STATES {
  INITIAL,
  IN_QUE,
  IN_ROOM,
}
const getTimeInQueString = (startTime: number) => {
  const minutes = differenceInMinutes(Date.now(), startTime);
  const seconds = differenceInSeconds(Date.now(), startTime)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const Online: React.FC = () => {
  const {
    state: {
      text,
      textId,
      wordIndex,
      inputLength,
      lastValidCharIndex,
      inputMaxLength,
      error,
      // onCompleteModalShown,
    },
    dispatch,
  } = useStore();

  const [socket] = useState<SocketIOClient.Socket>(() => {
    const socket = io(process.env.SOCKET_URL!);
    socket.on(SOCKET_EVENTS.UPDATE_ROOM, (room: Room) => {
      setState(STATES.IN_ROOM);
      setRoom(room);
      if (room.textId !== textId) {
        dispatch({ type: "SET_TEXT_BY_ID", payload: room.textId });
      }
    });
    socket.on(SOCKET_EVENTS.ROOM_EXPIRED, () => {
      setState(STATES.INITIAL);
      setRoom(undefined);
    });
    return socket;
  });
  const [state, setState] = useState(STATES.INITIAL);
  const [room, setRoom] = useState<Room>();
  const [timeInQue, setTimeInQue] = useState<string>("0:00");
  const queStartTSRef = useRef<number>(0);
  const timerIntervalRef = useRef<number>(0);

  const timerRef = useRef<TimerFunctions>(null);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (state === STATES.IN_QUE && !room) {
      queStartTSRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setTimeInQue(getTimeInQueString(queStartTSRef.current));
      }, 1000);
    }
    if (state == STATES.IN_ROOM) {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [state]);

  const joinQue = () => {
    if (!socket.connected) socket.connect();

    socket.emit(SOCKET_EVENTS.JOIN_QUE);
    setState(STATES.IN_QUE);
  };

  return (
    <Layout>
      <GameModeLink to={"/"} onClick={() => dispatch({ type: "RESET" })}>
        <button>Powrót do offline</button>
      </GameModeLink>
      {state == STATES.INITIAL && (
        <JoinRace onClick={joinQue}>
          Weź udział w wyścigu o złote galoty
        </JoinRace>
      )}
      {state === STATES.IN_QUE && (
        <InQueTimer>
          Czekanie na oponenta <span>{timeInQue}</span>
        </InQueTimer>
      )}
      {state === STATES.IN_ROOM && room && (
        <>
          <ProgressContainer>
            <ProgressIndicator
              players={room.players}
              highlightPlayer={socket.id}
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
            onWordCompleted={() => {
              dispatch({ type: "PROCEED_TO_NEXT_WORD" });
              socket.emit(SOCKET_EVENTS.WORD_COMPLETED, room.id, wordIndex);
            }}
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
        </>
      )}
    </Layout>
  );
};

export default Online;
