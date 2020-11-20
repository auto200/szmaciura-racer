import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import socketio from "socket.io";
import { nanoid } from "nanoid";
import { SOCKET_EVENTS, ROOM_STATES } from "../../shared";
import { Player, Room, TextId } from "../../shared/interfaces";
import texts from "../../shared/texts.json";
import { getParsedTexts, sleep } from "../../shared/utils";
import config from "./config.json";
import { random } from "lodash";

const parsedTexts = getParsedTexts();

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

let server = null;
if (process.env.DEV_PORT) {
  server = app.listen(process.env.DEV_PORT, () => {
    console.log("listening...", "specified port:", process.env.DEV_PORT);
  });
} else {
  server = app.listen(() => {
    console.log("listening", "no port specified");
  });
}
type RoomsObj = { [key: string]: Room };

const _publicRooms: RoomsObj = {};
// const privateRooms: RoomsObj = {};
let _queue: Player[] = [];
const io = socketio(server);

io.of("/game").on("connection", async (socket) => {
  console.log("new client connected");
  socket.on("disconnect", (reason) => {
    _queue = _queue.filter((player) => player.id !== socket.id);

    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    //Join existing room
    const freeRoom = getFreeRoom();
    if (freeRoom) {
      socket.join(freeRoom.id);
      freeRoom.players.push(getNewPlayer(socket.id));
      io.of("/game").to(freeRoom.id).emit(SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
      console.log(
        "player found open room and joined, room id:",
        freeRoom.id,
        "players:",
        freeRoom.players.map(({ id }) => id)
      );
      return;
    }

    _queue.push(getNewPlayer(socket.id));
    console.log("user added to que");

    if (_queue.length >= 2) {
      createAndHandleNewRoom();
    }
    console.log(_queue);
  });
  socket.on(
    SOCKET_EVENTS.WORD_COMPLETED,
    (roomId: string, wordIndex: number) => {
      const player = _publicRooms[roomId]?.players.find(
        ({ id }) => id === socket.id
      );
      if (player) {
        player.progress =
          wordIndex / parsedTexts[_publicRooms[roomId].textId].length;
        io.of("/game")
          .to(roomId)
          .emit(SOCKET_EVENTS.UPDATE_ROOM, _publicRooms[roomId]);
      }
    }
  );
  //add fake players
  if (config.fakePlayers.enabled) {
    while (true) {
      await sleep(random(3000, 5000));
      const fakePlayer: Player = getNewPlayer(
        `${config.fakePlayers.idPrefix}${nanoid()}`
      );
      if (_queue.length) {
        _queue.push(fakePlayer);
        const roomId = createAndHandleNewRoom();
        handleFakePlayer(roomId, fakePlayer.id);
      } else {
        const freeRoom = getFreeRoom();
        if (freeRoom) {
          const fakePlayersInRoom = freeRoom.players.reduce((acc, player) => {
            if (player.id.includes(config.fakePlayers.idPrefix)) return acc + 1;
            return acc;
          }, 0);
          if (fakePlayersInRoom >= 2) continue;
          freeRoom.players.push(fakePlayer);
          io.of("/game")
            .to(freeRoom.id)
            .emit(SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
          handleFakePlayer(freeRoom.id, fakePlayer.id);
        }
      }
    }
  }
  async function handleFakePlayer(roomId: string, fakePlayerId: string) {
    let raceFinished = false;
    while (true) {
      const room = _publicRooms[roomId];
      const player = room?.players.find((player) => player.id === fakePlayerId);
      if (!room || !player) return;
      if (room.state === ROOM_STATES.STARTED && player.progress < 1) {
        console.log(fakePlayerId);
        player.progress += random(0.015, 0.025);
        if (player.progress > 1) player.progress = 1;
        // progress based on word length?
      }
      if (player?.progress === 1) {
        raceFinished = true;
      }
      // pause based on word length?
      await sleep(random(200, 2000));
      io.of("/game")
        .to(roomId)
        .emit(SOCKET_EVENTS.UPDATE_ROOM, _publicRooms[roomId]);
      if (raceFinished) return;
    }
  }
});
/**
 * @returns new room id
 */
function createAndHandleNewRoom(): string {
  const roomId = nanoid(6);

  _publicRooms[roomId] = {
    id: roomId,
    state: ROOM_STATES.WAITING,
    players: [..._queue],
    expireTS: Date.now() + config.roomExpireTime,
    textId: Object.keys(texts)[0] as TextId,
    //TODO: textId should come from client or be reandomized from texts.json if requested for now value is hard-coded to be the first entry in file
  };
  _queue = [];

  _publicRooms[roomId].players.forEach(({ id }) => {
    io.of("/game").connected[id]?.join(roomId);
  });

  io.of("/game")
    .to(roomId)
    .emit(SOCKET_EVENTS.UPDATE_ROOM, _publicRooms[roomId]);
  console.log(
    "new room has been created, room id:",
    roomId,
    "players:",
    _publicRooms[roomId].players.map(({ id }) => id)
  );

  let timeToStart = config.timeToStartGame / 1000;
  const timerInterval = setInterval(() => {
    if (!timeToStart) {
      clearInterval(timerInterval);
      _publicRooms[roomId].state = ROOM_STATES.STARTED;
      io.of("/game")
        .to(roomId)
        .emit(SOCKET_EVENTS.UPDATE_ROOM, _publicRooms[roomId]);
      io.of("/game").to(roomId).emit(SOCKET_EVENTS.START_MATCH);

      setTimeout(() => {
        if (_publicRooms[roomId]) {
          delete _publicRooms[roomId];
          io.of("/game").to(roomId).emit(SOCKET_EVENTS.ROOM_EXPIRED);
          Object.values(io.of("/game").in(roomId).sockets).forEach((socket) =>
            socket.leave(roomId)
          );
          console.log("Room:", roomId, "expired. Closing...");
        }
      }, config.roomExpireTime);
    }
    io.of("/game")
      .to(roomId)
      .emit(SOCKET_EVENTS.UPDATE_TIME_TO_START, timeToStart--);
  }, 1000);
  return roomId;
}
function getNewPlayer(id: string): Player {
  return {
    id,
    progress: 0,
    carIndex: random(0, config.carsCount - 1),
  };
}

function getFreeRoom(): Room | undefined {
  return Object.values(_publicRooms).find(
    (room) =>
      room.state === ROOM_STATES.WAITING &&
      room.players.length < config.roomMaxPlayers
    //TODO: check if time to start match is greater than threshold
  );
}
