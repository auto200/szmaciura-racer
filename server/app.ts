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
import { Queue } from "./classes/Queue";
import { Player } from "./classes/Player";
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
    origins: `${process.env.SERVER_URL_WITH_PORT}`,
  });
}

const _publicRooms = new PubilcRooms();
const _queue = new Queue();

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");
  const player = new Player(socket.id);

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
      _queue.players.map(({ id }) => id)
    );
  });

  socket.on(SOCKET_EVENTS.WORD_COMPLETED, () => {
    const room = _publicRooms.get(player.roomId);
    if (!room || !room.startTS || player.completeTime) {
      return;
    }
    const progress = player.wordCompleted(
      parsedTexts[room.textID].length,
      room.startTS
    );
    if (progress === 1) room.playerFinished(player);
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
        handleFakePlayer(createAndHandleNewRoom(), fakePlayer);
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

      fakePlayer.wordCompleted(textArr.length, room.startTS);

      updateRoom(room);
    }
  }
})();

/**
 * @returns new room
 */
function createAndHandleNewRoom(): Room {
  const roomId = nanoid(config.room.idLength);
  // TODO: pass proper textID
  const newRoom = new Room(
    roomId,
    _queue.takeAll(),
    Object.keys(parsedTexts)[0],
    config
  );
  _publicRooms.add(newRoom);
  newRoom.players.forEach((player) => {
    io.of("/game").connected[player.id]?.join(roomId);
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
          room.players.forEach((player) => {
            io.of("/game").connected[player.id]?.leave(roomId);
            player.roomId = "";
          });
          _publicRooms.remove(roomId);
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
    room.players.map(({ id }) => id)
  );
}
