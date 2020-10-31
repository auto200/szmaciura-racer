import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import socketio from "socket.io";

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

const io = socketio(server);

io.on("connection", (socket) => {
  console.log("new client connected");
});
