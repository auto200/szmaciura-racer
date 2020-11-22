import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Layout from "../components/Layout";
import styled from "styled-components";
import { ROOM_STATES, SOCKET_EVENTS } from "../../../shared/";
import ProgressIndicator from "../components/ProgressIndicator";
import { Room } from "../../../shared/interfaces";
import { ProgressContainer, TextWrapper } from "../components/sharedStyled";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import Word from "../components/Word";
import { useStore } from "../contexts/Store";
import Input from "../components/Input";
import Timer, { TimerFunctions } from "../components/Timer";
import GoOffline from "../components/Links/GoOffline";
import { random } from "lodash";

const IN_QUE_GIFS: string[] = [
  "https://thumbs.gfycat.com/DevotedEasygoingAnnashummingbird-size_restricted.gif",
  "https://thumbs.gfycat.com/EsteemedAthleticGerbil-size_restricted.gif",
  "https://thumbs.gfycat.com/ConcernedJovialGrub-size_restricted.gif",
  "https://thumbs.gfycat.com/GleamingPinkGnu-size_restricted.gif",
  "https://thumbs.gfycat.com/DelayedImpartialCalf-size_restricted.gif",
];

const JoinRace = styled.div`
  font-size: 2.3rem;
  color: ${({ theme }) => theme.colors.golden};
  border-bottom: 2px solid black;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
`;
const StartRaceCountdown = styled.div`
  position: absolute;
  top: 0;
  font-weight: bold;
  span {
    color: ${({ theme }) => theme.colors.golden};
  }
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
  const seconds = (differenceInSeconds(Date.now(), startTime) % 60)
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
    socket.on(SOCKET_EVENTS.UPDATE_TIME_TO_START, (time: number) => {
      console.log(time);
      setTimeToStart(time);
    });
    socket.on(SOCKET_EVENTS.START_MATCH, () => {
      timerRef.current?.start();
    });
    return socket;
  });
  const [state, setState] = useState(STATES.INITIAL);
  const [room, setRoom] = useState<Room>();
  const [timeInQue, setTimeInQue] = useState<string>("0:00");
  const [timeToStart, setTimeToStart] = useState<number>(0);
  const [inQueGifSrc, setInQueGifSrc] = useState<string>(IN_QUE_GIFS[0]);
  const queStartTSRef = useRef<number>(0);
  const timerIntervalRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const timerRef = useRef<TimerFunctions>(null);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (state === STATES.IN_QUE) {
      setInQueGifSrc(IN_QUE_GIFS[random(0, IN_QUE_GIFS.length - 1)]);
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

  useEffect(() => {
    if (room?.state === ROOM_STATES.STARTED) {
      inputRef.current?.focus();
    }
  }, [room]);

  const joinQue = () => {
    if (!socket.connected) socket.connect();

    socket.emit(SOCKET_EVENTS.JOIN_QUE);
    setState(STATES.IN_QUE);
  };

  return (
    <>
      <GoOffline to={"/"} onClick={() => dispatch({ type: "RESET" })} />
      <Layout>
        {!!timeToStart && (
          <StartRaceCountdown>
            gra startuje za: <span>{timeToStart}</span>
          </StartRaceCountdown>
        )}
        {state == STATES.INITIAL && (
          <JoinRace onClick={joinQue}>
            Weź udział w wyścigu o złote galoty
          </JoinRace>
        )}
        {state === STATES.IN_QUE && (
          <>
            <img src={inQueGifSrc} />
            <InQueTimer>
              Czekanie na oponenta <span>{timeInQue}</span>
            </InQueTimer>
          </>
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
                socket.emit(
                  SOCKET_EVENTS.WORD_COMPLETED,
                  room.id,
                  wordIndex + 1
                );
              }}
              onLastWordCompleted={() => {
                timerRef.current?.stop();
                socket.emit(
                  SOCKET_EVENTS.WORD_COMPLETED,
                  room.id,
                  wordIndex + 1
                );
                // show scoreboard
                // dispatch({
                //   type: "RACE_COMPLETED",
                //   payload: timerRef.current?.getTime()!,
                // });
                // TODO: online match history
              }}
              onEmpty={() => dispatch({ type: "INPUT_EMPTY" })}
              onCorrectLetter={() => dispatch({ type: "CORRECT_INPUT_VALUE" })}
              onError={() => dispatch({ type: "SET_ERROR", payload: true })}
              disabled={room.state === ROOM_STATES.WAITING}
              ref={inputRef}
            />
          </>
        )}
      </Layout>
    </>
  );
};

export default Online;
