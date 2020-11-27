import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import socketio from "socket.io";
import { nanoid } from "nanoid";
import { SOCKET_EVENTS, ROOM_STATES } from "../../shared";
import { Player, Room, TextID } from "../../shared/interfaces";
import texts from "../../shared/texts.json";
import {
  getTimePassedInSecAndMs,
  parsedTexts,
  sleep,
} from "../../shared/utils";
import config from "./config";
import { random } from "lodash";
import { differenceInSeconds } from "date-fns";

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

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");

  //cleanup
  socket.on("disconnect", (reason) => {
    _queue = _queue.filter((player) => player.id !== socket.id);

    const room = Object.values(_publicRooms).find(({ players }) =>
      players.find((player) => {
        if (player.id === socket.id) {
          player.disconnected = true;
          return true;
        }
        return false;
      })
    );
    if (!room) return;

    if (
      room.players.every(
        ({ id, disconnected }) =>
          id.startsWith(config.fakePlayers.idPrefix) || disconnected === true
      )
    ) {
      delete _publicRooms[room.id];
    }
    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    const freeRoom = getFreePublicRoom();
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

    if (_queue.length >= 2) createAndHandleNewRoom();

    console.log(_queue);
  });

  socket.on(
    SOCKET_EVENTS.WORD_COMPLETED,
    (roomId: string, wordIndex: number) => {
      const room = _publicRooms[roomId];
      const player = room?.players.find(({ id }) => id === socket.id);

      if (
        !room ||
        !player ||
        player.completeTime ||
        room.state === ROOM_STATES.WAITING
      ) {
        return;
      }

      const progress = wordIndex / parsedTexts[room.textID].length;
      player.progress = progress;

      if (progress >= 1) {
        player.completeTime = getTimePassedInSecAndMs(room.startTS!);
        room.playersThatFinished.push(player);
      }

      io.of("/game").to(roomId).emit(SOCKET_EVENTS.UPDATE_ROOM, room);
    }
  );

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomID: string) => {
    const room = _publicRooms[roomID];
    if (!room) return;
    room.players = room.players.filter(({ id }) => id !== socket.id);
    socket.leave(roomID);
  });
});

//add fake players
(async () => {
  if (config.fakePlayers.enabled) {
    while (true) {
      await sleep(random(5000, 8000));
      console.log("trying to create fake player");
      const fakePlayer: Player = getNewPlayer(
        `${config.fakePlayers.idPrefix}${nanoid()}`
      );

      if (_queue.length) {
        _queue.push(fakePlayer);
        handleFakePlayer(createAndHandleNewRoom(), fakePlayer.id);
      } else {
        const freeRoom = getFreePublicRoom();
        if (!freeRoom) continue;

        const fakePlayersInRoom = freeRoom.players.filter(({ id }) =>
          id.startsWith(config.fakePlayers.idPrefix)
        ).length;
        if (fakePlayersInRoom >= config.fakePlayers.maxFakePlayersInRoom)
          continue;

        freeRoom.players.push(fakePlayer);
        io.of("/game")
          .to(freeRoom.id)
          .emit(SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
        handleFakePlayer(freeRoom.id, fakePlayer.id);
      }
    }
  }

  async function handleFakePlayer(roomId: string, fakePlayerId: string) {
    let wordIndex = 0;
    const [minSpeed, maxSpeed] = config.fakePlayers.speeds[
      random(0, config.fakePlayers.speeds.length - 1)
    ];

    while (true) {
      const room = _publicRooms[roomId];
      const player = room?.players.find(({ id }) => id === fakePlayerId);

      if (!room || !player || player.completeTime) {
        break;
      }
      // Probably should listen for a event that triggers running this loop. Event should be emitted when room changes
      // its state to STARTED in createAndHandleNewRoom(). Although it creates more randomness coz not all fake players
      // will start (sleeping) at the same time
      if (room.state === ROOM_STATES.WAITING) {
        await sleep(1000);
        continue;
      }

      const textArr = parsedTexts[room.textID];
      const wordLength = textArr[wordIndex].length;
      await sleep(random(minSpeed * wordLength, maxSpeed * wordLength));
      wordIndex++;

      player.progress = wordIndex / textArr.length;

      if (player.progress >= 1) {
        player.completeTime = getTimePassedInSecAndMs(room.startTS!);
        room.playersThatFinished.push(player);
      }

      io.of("/game").to(roomId).emit(SOCKET_EVENTS.UPDATE_ROOM, room);
    }
  }
})();

/**
 * @returns new room id
 */
function createAndHandleNewRoom(): string {
  const roomId = nanoid(6);

  _publicRooms[roomId] = {
    id: roomId,
    createTS: Date.now(),
    state: ROOM_STATES.WAITING,
    players: [..._queue],
    playersThatFinished: [],
    expireTS: Date.now() + config.roomExpireTime,
    startTS: Date.now() + config.timeToStartGame,
    textID: Object.keys(texts)[0] as TextID,
    //TODO: textId should come from client or be reandomized from texts.json if requested, for now value is hard-coded
    //to be the first entry in file
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

  const interval = setInterval(() => {
    const room = _publicRooms[roomId];
    if (!room) {
      clearInterval(interval);
      return;
    }

    const timeToStart = differenceInSeconds(room.startTS, Date.now());
    if (timeToStart >= 1) {
      io.of("/game")
        .to(roomId)
        .emit(SOCKET_EVENTS.UPDATE_TIME_TO_START, timeToStart);
    } else {
      clearInterval(interval);
      room.state = ROOM_STATES.STARTED;
      io.of("/game").to(roomId).emit(SOCKET_EVENTS.UPDATE_ROOM, room);
      io.of("/game").to(roomId).emit(SOCKET_EVENTS.START_MATCH);

      setTimeout(() => {
        if (_publicRooms[roomId]) {
          delete _publicRooms[roomId];
          Object.values(io.of("/game").in(roomId).sockets).forEach((socket) =>
            socket.leave(roomId)
          );
          console.log("Room:", roomId, "expired. Closing...");
        }
      }, config.roomExpireTime);
    }
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

function getFreePublicRoom(): Room | undefined {
  return Object.values(_publicRooms).find(
    (room) =>
      room.state === ROOM_STATES.WAITING &&
      room.players.length < config.roomMaxPlayers &&
      differenceInSeconds(room.startTS, Date.now()) >=
        config.roomTimeThresholdBeforeStart / 1000
  );
}
