import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Layout from "../components/Layout";
import styled from "styled-components";
import { SOCKET_EVENTS } from "../../../shared/";
import ProgressIndicator from "../components/ProgressIndicator";
import { useCarsContext } from "../contexts/CarsContext";
import { Room } from "../../../shared/interfaces";
import { GameModeLink } from "../components/sharedStyled";

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
    socket.on(SOCKET_EVENTS.ROOM_EXPIRED, () => {});
    return socket;
  });
  const { cars } = useCarsContext();
  const [state, setState] = useState(STATES.INITIAL);
  const [room, setRoom] = useState<Room>();

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const joinQue = () => {
    socket.emit(SOCKET_EVENTS.JOIN_QUE);
    setState(STATES.IN_QUE);
  };

  return (
    <Layout>
      <GameModeLink to={"/"}>
        <button>Powrót do offline</button>
      </GameModeLink>
      {state !== STATES.IN_QUE && (
        <JoinRace onClick={joinQue}>
          Weź udział w wyścigu o złote galoty
        </JoinRace>
      )}
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
