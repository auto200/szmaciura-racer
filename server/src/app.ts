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
import { getParsedTexts } from "../../shared/utils";
import config from "./config.json";

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

const publicRooms: RoomsObj = {};
// const privateRooms: RoomsObj = {};
let queue: Player[] = [];
const io = socketio(server);

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");
  socket.on("disconnect", (reason) => {
    queue = queue.filter((player) => player.id !== socket.id);

    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    //Join existing room
    const freeRoom = Object.values(publicRooms).find(
      (room) => room.state === ROOM_STATES.WAITING
      //TODO: check if time to start match is greater than threshold
    );
    if (freeRoom && freeRoom.players.length < config.roomMaxPlayers) {
      socket.join(freeRoom.id);
      freeRoom.players.push(getNewPlayer(socket.id));
      io.of("/game").to(freeRoom.id).emit(SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
      return;
    }

    queue.push(getNewPlayer(socket.id));

    if (queue.length >= 2) {
      //Create new room
      const roomId = nanoid(6);
      console.log("room id", roomId);

      publicRooms[roomId] = {
        id: roomId,
        state: ROOM_STATES.WAITING,
        players: [...queue],
        expireTS: Date.now() + config.roomExpireTime,
        textId: Object.keys(texts)[0] as TextId,
      };
      //TODO: textId should come from client or be reandomized from texts.json if requested for now value is hard-coded to be the first entry in file
      queue = [];

      publicRooms[roomId].players.forEach(({ id }) => {
        io.of("/game").connected[id]?.join(roomId);
      });

      io.of("/game")
        .to(roomId)
        .emit(SOCKET_EVENTS.UPDATE_ROOM, publicRooms[roomId]);

      let timeToStart = config.timeToStartGame / 1000;
      const timerInterval = setInterval(() => {
        if (!timeToStart) {
          clearInterval(timerInterval);
          publicRooms[roomId].state = ROOM_STATES.STARTED;
          io.of("/game")
            .to(roomId)
            .emit(SOCKET_EVENTS.UPDATE_ROOM, publicRooms[roomId]);
          io.of("/game").to(roomId).emit(SOCKET_EVENTS.START_MATCH);

      setTimeout(() => {
        if (publicRooms[roomId]) {
          delete publicRooms[roomId];
          io.of("/game").to(roomId).emit(SOCKET_EVENTS.ROOM_EXPIRED);
              Object.values(
                io.of("/game").in(roomId).sockets
              ).forEach((socket) => socket.leave(roomId));
          console.log("Room:", roomId, "expired. Closing...");
        }
          }, config.roomExpireTime);
    }
        io.of("/game")
          .to(roomId)
          .emit(SOCKET_EVENTS.TIME_TO_START_UPDATE, timeToStart--);
      }, 1000);
    }
    console.log(queue);
  });
  socket.on(
    SOCKET_EVENTS.WORD_COMPLETED,
    (roomId: string, wordIndex: number) => {
      const player = publicRooms[roomId]?.players.find(
        ({ id }) => id === socket.id
      );
      if (player) {
        player.progress =
          wordIndex / parsedTexts[publicRooms[roomId].textId].length;
        io.of("/game")
          .to(roomId)
          .emit(SOCKET_EVENTS.UPDATE_ROOM, publicRooms[roomId]);
      }
    }
  );
});

function getNewPlayer(id: string): Player {
  return {
    id,
    progress: 0,
    carIndex: (Math.random() * config.carsCount) | 0,
  };
}
