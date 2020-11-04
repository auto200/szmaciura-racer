import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import socketio from "socket.io";
import { nanoid } from "nanoid";
import { SOCKET_EVENTS, ROOM_STATES } from "../../shared";
import { Player, Room } from "../../shared/interfaces";
import { ROOM_MAX_PLAYERS, CARS_COUNT } from "./constants";

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
const io = socketio(server);

io.of("/game").on("connection", (socket) => {
  console.log("new client connected");
  socket.on("disconnect", (reason) => {
    console.log("client disconnected", reason);
  });

  socket.on(SOCKET_EVENTS.JOIN_QUE, () => {
    //Join existing room
    const freeRoom = Object.values(publicRooms).find(
      (room) => room.state === ROOM_STATES.WAITING
    );
    if (freeRoom && freeRoom.players.length < ROOM_MAX_PLAYERS) {
      socket.join(freeRoom.id, (err) => {
        if (err) return;
        freeRoom.players.push(getNewPlayer(socket.id));
        io.of("/game")
          .to(freeRoom.id)
          .emit(SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
      });
    } else {
      //Create new room
      const roomId = nanoid(6);
      console.log("room id", roomId);
      const timeToExpire = 1000 * 60 * 3;
      const newRoom: Room = {
        id: roomId,
        state: ROOM_STATES.WAITING,
        players: [getNewPlayer(socket.id)],
        expireTS: Date.now() + timeToExpire,
      };
      publicRooms[roomId] = newRoom;

      setTimeout(() => {
        delete publicRooms[roomId];
        io.of("/game").to(roomId).emit(SOCKET_EVENTS.ROOM_EXPIRED);
        console.log("Room:", roomId, "expired. Closing...");
      }, timeToExpire);

      socket.join(roomId, (err) => {
        if (err) return;
        socket.emit(SOCKET_EVENTS.UPDATE_ROOM, newRoom);
      });
    }
  });
});

function getNewPlayer(id: string): Player {
  return {
    id,
    progress: 0,
    carIndex: (Math.random() * CARS_COUNT) | 0,
  };
}
