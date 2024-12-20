import { appConfig, AppEnvironment } from "@configs/appConfig";
import { gameConfig } from "@configs/gameConfig";
import { parsedTexts, ROOM_STATES, sleep, SOCKET_EVENTS } from "@szmaciura/shared";
import express from "express";
import { random, sample } from "lodash";
import { nanoid } from "nanoid";
import { Server as SocketIo } from "socket.io";
import { Player } from "./classes/Player";
import { Queue } from "./classes/Queue";
import { Room } from "./classes/Room";
import { RoomsManager } from "./classes/RoomsManager";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: appConfig.CORS_ORIGIN,
  })
);

app.get("/ping", (_req, res) => res.send("pong"));

const server = app.listen(appConfig.PORT, () => {
  console.log("listening...", "specified port:", appConfig.PORT);
});

const io = new SocketIo(server, {
  cors: {
    origin: appConfig.NODE_ENV === AppEnvironment.DEVELOPMENT ? true : appConfig.CORS_ORIGIN,
  },
});

const roomsManager = new RoomsManager();
const queue = new Queue();

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");
  const player = new Player(socket.id);

  //cleanup
  socket.on("disconnect", (reason) => {
    //actions based on player.state?
    queue.remove(player);
    player.disconnected = true;
    roomsManager.playerDisconnected(player.roomId);

    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    const room = roomsManager.getFree();
    if (room) {
      socket.join(room.id);
      room.add(player);
      updateRoom(room);

      logRoom(room.id, room);
      return;
    }
    queue.add(player);
    console.log("user added to que");

    if (queue.length >= gameConfig.queue.maxLength) createAndHandleNewRoom();

    console.log(
      "queue:",
      [...queue.players].map(({ id }) => id)
    );
  });

  socket.on(SOCKET_EVENTS.WORD_COMPLETED, () => {
    const room = roomsManager.get(player.roomId);
    if (!room || !room.startTS || player.completeTime) {
      return;
    }
    player.wordCompleted(parsedTexts[room.textID]?.length || 0, room.startTS);
    updateRoom(room);
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
    socket.leave(player.roomId);
    player.roomId = "";
  });
});

// add fake players
(async () => {
  if (gameConfig.fakePlayers.enabled) {
    while (true) {
      await sleep(random(5000, 8000));
      console.log("trying to create fake player");
      const fakePlayer = new Player(`${gameConfig.fakePlayers.idPrefix}${nanoid()}`, true);

      if (queue.length) {
        queue.add(fakePlayer);
        handleFakePlayer(await createAndHandleNewRoom(), fakePlayer);
      } else {
        const room = roomsManager.getFree();
        if (!room || !room.add(fakePlayer)) continue;
        updateRoom(room);
        handleFakePlayer(room, fakePlayer);
      }
    }
  }

  async function handleFakePlayer(room: Room, fakePlayer: Player) {
    const [minSpeed, maxSpeed] = sample(gameConfig.fakePlayers.speeds)!;

    while (true) {
      if (fakePlayer.completeTime) {
        break;
      }

      if (!room.startTS) {
        await sleep(1000);
        continue;
      }
      const textArr = parsedTexts[room.textID] || [];
      const wordLength = textArr[fakePlayer.wordIndex]?.length || 0;
      await sleep(random(minSpeed * wordLength, maxSpeed * wordLength));

      fakePlayer.wordCompleted(parsedTexts[room.textID]?.length || 0, room.startTS);

      updateRoom(room);
    }
  }
})();

/**
 * @returns new room
 */
async function createAndHandleNewRoom(): Promise<Room> {
  const roomId = nanoid(gameConfig.room.idLength);
  // TODO: pass proper textID
  const newRoom = new Room(
    roomId,
    queue.takeAll(),
    Object.keys(parsedTexts)[0] || "",
    gameConfig.room
  );
  roomsManager.add(newRoom);
  const allSockets = await io.of("/game").fetchSockets();

  newRoom.players.forEach(async (player) => {
    allSockets.find(({ id }) => id === player.id)?.join(roomId);
  });

  updateRoom(newRoom);

  logRoom(roomId, newRoom);

  //countdown
  const interval = setInterval(() => {
    const room = roomsManager.get(roomId);
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
        const room = roomsManager.get(roomId);
        if (room) {
          io.in(room.id).socketsLeave(room.id);
          // room.players.forEach((player) => {
          //   io.of("/game").connected[player.id]?.leave(roomId);
          //   player.roomId = "";
          // });
          roomsManager.remove(room);
          console.log("Room:", roomId, "expired. Closing...");
        }
      }, gameConfig.room.expireTime);
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
