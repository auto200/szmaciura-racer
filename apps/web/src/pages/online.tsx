import Input from "@components/Input";
import Layout from "@components/Layout";
import GoOffline from "@components/Links/GoOffline";
import ProgressIndicator from "@components/ProgressIndicator";
import { ProgressContainer } from "@components/sharedStyledComponents";
import Text from "@components/Text";
import Timer, { TimerFunctions } from "@components/Timer";
import { GAMES_HISTORY_LS_KEY } from "@consts/consts";
import { useStore } from "@contexts/Store";
import { useGamesHistory } from "@hooks/useGamesHistory";
import { useOfflineCarAvatars } from "@hooks/useOfflineCarAvatars";
import { Room, ROOM_STATES, SOCKET_EVENTS } from "@szmaciura/shared";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import sample from "lodash/sample";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { ImArrowLeft, ImArrowUp2, ImArrowUpLeft2, ImArrowUpRight2 } from "react-icons/im";
import io, { Socket } from "socket.io-client";
import styled from "styled-components";

const IN_QUE_GIFS = [
  "https://thumbs.gfycat.com/DevotedEasygoingAnnashummingbird-size_restricted.gif",
  "https://thumbs.gfycat.com/EsteemedAthleticGerbil-size_restricted.gif",
  "https://thumbs.gfycat.com/ConcernedJovialGrub-size_restricted.gif",
  "https://thumbs.gfycat.com/GleamingPinkGnu-size_restricted.gif",
  "https://thumbs.gfycat.com/DelayedImpartialCalf-size_restricted.gif",
] as const;

const JoinRace = styled.div`
  font-size: 2.3rem;
  color: ${({ theme }) => theme.colors.golden};
  border-bottom: 2px solid black;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
`;
const Arrows = styled.div`
  width: 500px;
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
`;
interface IStartRaceCountdown {
  scaleTime: boolean;
}
const StartRaceCountdown = styled.div<IStartRaceCountdown>`
  position: absolute;
  top: 0;
  font-size: 1.7rem;
  font-weight: bold;
  span {
    color: ${({ theme }) => theme.colors.golden};
    animation: ${({ scaleTime }) => scaleTime && "anim 1s ease"};
    display: inline-block;
  }
  @keyframes anim {
    from {
      transform: scale(2);
    }
    to {
      transform: scale(1.3);
    }
  }
`;
const InQueTimer = styled.div`
  font-weight: bold;
  span {
    color: ${({ theme }) => theme.colors.golden};
  }
`;
const PlayAgainButton = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0 30px 0;
  font-size: 30px;
  text-decoration: underline;
  cursor: pointer;
  background: linear-gradient(
    to right,
    #fff 20%,
    ${({ theme }) => theme.colors.golden} 40%,
    ${({ theme }) => theme.colors.golden} 60%,
    #fff 80%
  );
  background-size: 200% auto;
  color: ${({ theme }) => theme.colors.secondary};
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: shine 3s linear infinite;
  @keyframes shine {
    to {
      background-position: -200% center;
    }
  }
  svg {
    margin-left: 5px;
    color: ${({ theme }) => theme.colors.golden};
  }
`;

enum STATES {
  INITIAL,
  IN_QUE,
  IN_ROOM,
}
const getTimeInQue = (startTime: number): string => {
  const minutes = differenceInMinutes(Date.now(), startTime);
  const seconds = (differenceInSeconds(Date.now(), startTime) % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const Online: React.FC = () => {
  const {
    state: { text, textID, wordIndex, inputLength, lastValidCharIndex, inputMaxLength, error },
    dispatch,
  } = useStore();
  const { cars } = useOfflineCarAvatars();

  const [socket] = useState<Socket>(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    socket.on(SOCKET_EVENTS.UPDATE_ROOM, (room: Room) => {
      setState(STATES.IN_ROOM);
      setRoom(room);
      if (room.textID !== textID) {
        dispatch({ type: "SET_TEXT_BY_ID", payload: room.textID });
      }
    });
    socket.on(SOCKET_EVENTS.START_MATCH, () => {
      timerRef.current?.start();
    });
    return socket;
  });
  const [state, setState] = useState(STATES.INITIAL);
  const [room, setRoom] = useState<Room>();
  const [timeInQue, setTimeInQue] = useState<string>("0:00");
  const [inQueGifSrc, setInQueGifSrc] = useState<string>(IN_QUE_GIFS[0]);
  const [raceCompleted, setRaceCompleted] = useState<boolean>(false);
  const { addToGamesHistory } = useGamesHistory(GAMES_HISTORY_LS_KEY.online);
  const queStartTSRef = useRef<number>(0);
  const timerIntervalRef = useRef<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<TimerFunctions>(null);

  const joinQue = () => {
    if (!socket.connected) socket.connect();

    socket.emit(SOCKET_EVENTS.JOIN_QUE);
    setState(STATES.IN_QUE);
  };

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (state === STATES.IN_QUE) {
      setInQueGifSrc(sample(IN_QUE_GIFS) || IN_QUE_GIFS[0]);
      queStartTSRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setTimeInQue(getTimeInQue(queStartTSRef.current));
      }, 1000);
    }

    if (state == STATES.IN_ROOM) {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [state]);

  useEffect(() => {
    if (!room) return;
    if (room.state === ROOM_STATES.STARTED) {
      inputRef.current?.focus();
      setTimeInQue("0:00");
    }
    if (room.players.length === room.players.filter((p) => p.completeTime).length) {
      timerRef.current?.stop();
    }
  }, [room]);

  return (
    <>
      <GoOffline to={"/"} onClick={() => dispatch({ type: "RESET" })} />
      <Layout>
        {room && !!room.msToStart && (
          <StartRaceCountdown
            key={room.msToStart <= 3000 ? room.msToStart : null}
            scaleTime={room.msToStart <= 3000}
          >
            gra startuje za: <span>{room.msToStart / 1000}</span>
          </StartRaceCountdown>
        )}
        {state == STATES.INITIAL && (
          <>
            <JoinRace onClick={joinQue}>Weź udział w wyścigu o złote galoty</JoinRace>
            <Arrows>
              <ImArrowUpRight2 />
              <ImArrowUp2 />
              <ImArrowUpLeft2 />
            </Arrows>
          </>
        )}
        {state === STATES.IN_QUE && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={inQueGifSrc} alt="rafon" />
            <InQueTimer>
              Czekanie na oponenta <span>{timeInQue}</span>
            </InQueTimer>
          </>
        )}
        {state === STATES.IN_ROOM && room && (
          <>
            <ProgressContainer>
              <ProgressIndicator players={room.players} highlightPlayer={socket.id} />
              <Timer ref={timerRef} />
            </ProgressContainer>
            <Text
              text={text}
              wordIndex={wordIndex}
              error={error}
              lastValidCharIndex={lastValidCharIndex}
              inputLength={inputLength}
            />
            {raceCompleted ? (
              <PlayAgainButton
                onClick={() => {
                  dispatch({ type: "RESET" });
                  setRoom(undefined);
                  setRaceCompleted(false);
                  socket.emit(SOCKET_EVENTS.LEAVE_ROOM);
                  joinQue();
                }}
              >
                Dobra robota wariacie, pierdolnij se jeszcze rundkę <ImArrowLeft />
              </PlayAgainButton>
            ) : (
              <Input
                ref={inputRef}
                word={text[wordIndex] || ""}
                error={error}
                maxLength={inputMaxLength}
                isLastWord={wordIndex === text.length - 1}
                onChange={(value) => {
                  dispatch({ type: "SET_INPUT_LENGTH", payload: value.length });
                }}
                onWordCompleted={() => {
                  dispatch({ type: "PROCEED_TO_NEXT_WORD" });
                  socket.emit(SOCKET_EVENTS.WORD_COMPLETED);
                }}
                onLastWordCompleted={() => {
                  socket.emit(SOCKET_EVENTS.WORD_COMPLETED);
                  setRaceCompleted(true);
                  dispatch({ type: "RESET" });
                  dispatch({
                    type: "RACE_COMPLETED",
                  });
                  addToGamesHistory(textID, timerRef.current!.getTime());
                }}
                onEmpty={() => dispatch({ type: "INPUT_EMPTY" })}
                onCorrectLetter={() => dispatch({ type: "CORRECT_INPUT_VALUE" })}
                onError={() => dispatch({ type: "SET_ERROR", payload: true })}
                disabled={room.state === ROOM_STATES.WAITING}
              />
            )}
            {room.players
              .filter(({ completeTime }) => completeTime)
              .map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Image src={player.carAvatarSrc} width={150} height={100} alt="" />
                  {player.completeTime}s {player.id === socket.id && "(ty)"}
                </div>
              ))}
          </>
        )}
      </Layout>
    </>
  );
};

export default Online;
