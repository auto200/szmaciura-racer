import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Layout from "../components/Layout";
import styled from "styled-components";
import { SOCKET_EVENTS } from "../../../shared/";
import ProgressIndicator from "../components/ProgressIndicator";
import { Room } from "../../../shared/interfaces";
import { GameModeLink } from "../components/sharedStyled";
import { differenceInMinutes, differenceInSeconds } from "date-fns";

const JoinRace = styled.div`
  font-size: 2.3rem;
  color: ${({ theme }) => theme.colors.golden};
  border-bottom: 2px solid black;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
`;
const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;
enum STATES {
  INITIAL,
  IN_QUE,
}

const Online: React.FC = () => {
  const [socket] = useState<SocketIOClient.Socket>(() => {
    const socket = io(process.env.SOCKET_URL!);
    socket.on(SOCKET_EVENTS.COUNTDOWN_START, () => {});
    socket.on(SOCKET_EVENTS.UPDATE_ROOM, (room: Room) => setRoom(room));
    socket.on(SOCKET_EVENTS.ROOM_EXPIRED, () => {
      setState(STATES.INITIAL);
      setRoom(undefined);
    });
    socket.on(SOCKET_EVENTS.IN_QUE, () => {});
    return socket;
  });
  const [state, setState] = useState(STATES.INITIAL);
  const [room, setRoom] = useState<Room>();
  const [timeInQue, setTimeInQue] = useState<string>("00:00");
  const queStartTSRef = useRef<number>(0);
  console.log(room);
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);
  useEffect(() => {
    let interval: number = 0;
    if (state === STATES.IN_QUE && !room) {
      queStartTSRef.current = Date.now();
      interval = setInterval(() => {
        const minutes = differenceInMinutes(Date.now(), queStartTSRef.current)
          .toString()
          .padStart(2, "0");
        const seconds = differenceInSeconds(Date.now(), queStartTSRef.current)
          .toString()
          .padStart(2, "0");
        setTimeInQue(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const joinQue = () => {
    socket.emit(SOCKET_EVENTS.JOIN_QUE);
    setState(STATES.IN_QUE);
  };

  return (
    <Layout>
      <GameModeLink to={"/"}>
        <button>Powrót do offline</button>
      </GameModeLink>
      {state == STATES.INITIAL && (
        <JoinRace onClick={joinQue}>
          Weź udział w wyścigu o złote galoty
        </JoinRace>
      )}
      {state === STATES.IN_QUE && !room && <div>{timeInQue}</div>}
      {room && (
        <ProgressContainer>
          <ProgressIndicator
            players={room.players}
            highlightPlayer={socket.id}
          />
        </ProgressContainer>
      )}
    </Layout>
  );
};

export default Online;
