import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import socketio from "socket.io";
import { nanoid } from "nanoid";
import { SOCKET_EVENTS, ROOM_STATES } from "./shared/enums";
import { parsedTexts, sleep } from "./shared/utils";
import config from "./config";
import { random, sample } from "lodash";
import { differenceInSeconds } from "date-fns";
import Queue from "./classes/Queue";
import { FakePlayer, RealPlayer } from "./classes/Players";
import { PubilcRooms, Room } from "./classes/Rooms";

const app = express();

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

let io: socketio.Server;
if (process.env.DEV_PORT) {
  io = socketio(server);
} else {
  io = socketio(server, {
    origins: `${process.env.HTTPS_SERVER_URL}:443`,
  });
}

const _publicRooms = new PubilcRooms();
const _queue = new Queue();

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");
  const player = new RealPlayer(socket);

  //cleanup
  socket.on("disconnect", (reason) => {
    //actions based on player.state?
    _queue.remove(player.id);
    player.disconnected = true;
    _publicRooms.playerDisconnected(player.roomId);
    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    const room = _publicRooms.getFree();
    if (room) {
      room.add(player);
      player.joinRoom(room.id);

      updateRoom(room);

      logRoom(room.id, room);
      return;
    }

    _queue.add(player);
    console.log("user added to que");

    if (_queue.length >= config.queue.maxLength) createAndHandleNewRoom();
    // if (_queue.length >= 1) createAndHandleNewRoom();

    console.log(
      "queue:",
      _queue.players.map(({ id }) => id)
    );
  });

  socket.on(SOCKET_EVENTS.WORD_COMPLETED, () => {
    const room = _publicRooms.get(player.roomId);
    if (!room) return;

    player.wordCompleted(room);

    updateRoom(room);
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
    player.leaveRoom();
  });
});

// add fake players
(async () => {
  if (config.fakePlayers.enabled) {
    while (true) {
      await sleep(random(5000, 8000));
      console.log("trying to create fake player");
      const fakePlayer = new FakePlayer(
        `${config.fakePlayers.idPrefix}${nanoid()}`
      );

      if (_queue.length) {
        _queue.add(fakePlayer);
        handleFakePlayer(createAndHandleNewRoom(), fakePlayer.id);
      } else {
        const room = _publicRooms.getFree();
        if (!room) continue;

        if (room.fakePlayersCount >= config.fakePlayers.maxFakePlayersInRoom)
          continue;

        room.add(fakePlayer);
        updateRoom(room);
        handleFakePlayer(room.id, fakePlayer.id);
      }
    }
  }

  async function handleFakePlayer(roomId: string, fakePlayerId: string) {
    const [minSpeed, maxSpeed] = sample(config.fakePlayers.speeds)!;

    while (true) {
      const room = _publicRooms.get(roomId);
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

      const wordLength = parsedTexts[room.textID][player.wordIndex].length;
      await sleep(random(minSpeed * wordLength, maxSpeed * wordLength));

      player.wordCompleted(room);

      updateRoom(room);
    }
  }
})();

/**
 * @returns new room id
 */
function createAndHandleNewRoom(): string {
  const roomId = nanoid(config.room.idLength);
  // TODO: pass textID
  const newRoom = new Room(roomId, _queue.takeAll());
  _publicRooms.add(newRoom);
  newRoom.players.forEach((player) => player.joinRoom(roomId));

  console.log("handling new room");
  updateRoom(newRoom);

  logRoom(roomId, newRoom);

  const startTime = Date.now();
  const interval = setInterval(() => {
    const room = _publicRooms.get(roomId);
    if (!room) {
      clearInterval(interval);
      return;
    }

    const timeToStart = differenceInSeconds(
      startTime + config.room.timeToStartGame,
      Date.now()
    );
    if (timeToStart >= 1) {
      emit(roomId, SOCKET_EVENTS.UPDATE_TIME_TO_START, timeToStart);
    } else {
      clearInterval(interval);
      room.state = ROOM_STATES.STARTED;
      room.startTS = Date.now();
      updateRoom(room);
      emit(roomId, SOCKET_EVENTS.START_MATCH);

      setTimeout(() => {
        const room = _publicRooms.get(roomId);
        if (room) {
          room.players.forEach((player) => player.leaveRoom());
          _publicRooms.remove(roomId);

          console.log("Room:", roomId, "expired. Closing...");
        }
      }, config.room.expireTime);
    }
  }, 1000);

  return roomId;
}

function emit(roomId: string, eventName: SOCKET_EVENTS, ...data: any) {
  io.of("/game")
    .to(roomId)
    .emit(eventName, ...data);
}

function updateRoom(room: Room) {
  emit(room.id, SOCKET_EVENTS.UPDATE_ROOM, room.toTransport());
}

function logRoom(roomId: string, room: Room) {
  console.log(
    "new room has been created, room id:",
    roomId,
    "players:",
    room.players.map(({ id }) => id)
  );
}
