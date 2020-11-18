import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import socketio from "socket.io";
import { nanoid } from "nanoid";
import { SOCKET_EVENTS, ROOM_STATES } from "../../shared";
import { Player, Room } from "../../shared/interfaces";
import { ROOM_MAX_PLAYERS, CARS_COUNT, ROOM_EXPIRE_TIME } from "./constants";

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
    if (socket.id === queue[0].id) {
      queue = [];
    }
    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    //Join existing room
    const freeRoom = Object.values(publicRooms).find(
      (room) => room.state === ROOM_STATES.WAITING
      //TODO: check if time to start match is greater than threshold
    );
    if (freeRoom && freeRoom.players.length < ROOM_MAX_PLAYERS) {
      socket.join(freeRoom.id, (err) => {
        if (err) return;
        freeRoom.players.push(getNewPlayer(socket.id));
        io.of("/game")
          .to(freeRoom.id)
          .emit(SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
      });
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
        expireTS: Date.now() + ROOM_EXPIRE_TIME,
      };
      queue = [];

      publicRooms[roomId].players.forEach(({ id }) => {
        io.of("/game").connected[id]?.join(roomId);
      });

      io.of("/game")
        .to(roomId)
        .emit(SOCKET_EVENTS.UPDATE_ROOM, publicRooms[roomId]);

      setTimeout(() => {
        if (publicRooms[roomId]) {
          delete publicRooms[roomId];
          io.of("/game").to(roomId).emit(SOCKET_EVENTS.ROOM_EXPIRED);
          console.log("Room:", roomId, "expired. Closing...");
        }
      }, ROOM_EXPIRE_TIME);
    }
    console.log(queue);
  });
});

function getNewPlayer(id: string): Player {
  return {
    id,
    progress: 0,
    carIndex: (Math.random() * CARS_COUNT) | 0,
  };
}
