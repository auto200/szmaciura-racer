import {
  parsedTexts,
  ROOM_STATES,
  sleep,
  SOCKET_EVENTS,
} from "@szmaciura/shared";
import dotenv from "dotenv";
import express from "express";
import { random, sample } from "lodash";
import { nanoid } from "nanoid";
import path from "path";
import { Server as SocketIo } from "socket.io";
import { Player } from "./classes/Player";
import { Queue } from "./classes/Queue";
import { PubilcRooms, Room } from "./classes/Rooms";
import config from "./config";
dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const IS_DEV = process.env.DEV_PORT !== undefined;

console.log(process.env.DEV_PORT);

const server = app.listen(process.env.DEV_PORT || null, () => {
  console.log("listening...", "specified port:", process.env.DEV_PORT);
});

const io = new SocketIo(server, {
  cors: { origin: process.env.CLIENT_URL },
});

const _publicRooms = new PubilcRooms();
const _queue = new Queue();

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");
  const player = new Player(socket.id);

  //cleanup
  socket.on("disconnect", (reason) => {
    //actions based on player.state?
    _queue.remove(player);
    player.disconnected = true;
    _publicRooms.playerDisconnected(player.roomId);

    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    const room = _publicRooms.getFree();
    if (room) {
      socket.join(room.id);
      room.add(player);
      updateRoom(room);

      logRoom(room.id, room);
      return;
    }
    _queue.add(player);
    console.log("user added to que");

    if (_queue.length >= config.queue.maxLength) createAndHandleNewRoom();

    console.log(
      "queue:",
      [..._queue.players].map(({ id }) => id)
    );
  });

  socket.on(SOCKET_EVENTS.WORD_COMPLETED, () => {
    const room = _publicRooms.get(player.roomId);
    if (!room || !room.startTS || player.completeTime) {
      return;
    }
    player.wordCompleted(parsedTexts[room.textID].length, room.startTS);
    updateRoom(room);
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
    socket.leave(player.roomId);
    player.roomId = "";
  });
});

// add fake players
(async () => {
  if (config.fakePlayers.enabled) {
    while (true) {
      await sleep(random(5000, 8000));
      console.log("trying to create fake player");
      const fakePlayer = new Player(
        `${config.fakePlayers.idPrefix}${nanoid()}`,
        true
      );

      if (_queue.length) {
        _queue.add(fakePlayer);
        handleFakePlayer(await createAndHandleNewRoom(), fakePlayer);
      } else {
        const room = _publicRooms.getFree();
        if (!room || !room.add(fakePlayer)) continue;
        updateRoom(room);
        handleFakePlayer(room, fakePlayer);
      }
    }
  }

  async function handleFakePlayer(room: Room, fakePlayer: Player) {
    const [minSpeed, maxSpeed] = sample(config.fakePlayers.speeds)!;

    while (true) {
      if (fakePlayer.completeTime) {
        break;
      }

      if (!room.startTS) {
        await sleep(1000);
        continue;
      }
      const textArr = parsedTexts[room.textID];
      const wordLength = textArr[fakePlayer.wordIndex].length;
      await sleep(random(minSpeed * wordLength, maxSpeed * wordLength));

      fakePlayer.wordCompleted(parsedTexts[room.textID].length, room.startTS);

      updateRoom(room);
    }
  }
})();

/**
 * @returns new room
 */
async function createAndHandleNewRoom(): Promise<Room> {
  const roomId = nanoid(config.room.idLength);
  // TODO: pass proper textID
  const newRoom = new Room(
    roomId,
    _queue.takeAll(),
    Object.keys(parsedTexts)[0],
    config.room
  );
  _publicRooms.add(newRoom);
  const allSockets = await io.of("/game").fetchSockets();

  newRoom.players.forEach(async (player) => {
    allSockets.find(({ id }) => id === player.id)?.join(roomId);
  });

  updateRoom(newRoom);

  logRoom(roomId, newRoom);

  //countdown
  const interval = setInterval(() => {
    const room = _publicRooms.get(roomId);
    if (!room) {
      clearInterval(interval);
      return;
    }

    room.msToStart = room.msToStart - 1000;
    if (room.msToStart >= 1000) {
      updateRoom(room);
    } else {
      clearInterval(interval);
      room.state = ROOM_STATES.STARTED;
      room.startTS = Date.now();
      updateRoom(room);
      emit(roomId, SOCKET_EVENTS.START_MATCH);
      //cleanup
      setTimeout(() => {
        const room = _publicRooms.get(roomId);
        if (room) {
          io.in(room.id).socketsLeave(room.id);
          // room.players.forEach((player) => {
          //   io.of("/game").connected[player.id]?.leave(roomId);
          //   player.roomId = "";
          // });
          _publicRooms.remove(room);
          console.log("Room:", roomId, "expired. Closing...");
        }
      }, config.room.expireTime);
    }
  }, 1000);

  return newRoom;
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
    [...room.players].map(({ id }) => id)
  );
}
