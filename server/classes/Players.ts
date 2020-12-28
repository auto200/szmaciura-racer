import { random } from "lodash";
import config from "../config";
import { ROOM_STATES } from "../shared/enums";
import { Player as PlayerI } from "../shared/interfaces";
import { Room } from "./Rooms";
import { getTimePassedInSecAndMs, parsedTexts } from "../shared/utils";

abstract class PlayerBase implements PlayerI {
  id: string;
  roomId: string;
  wordIndex: number;
  progress: number;
  carIndex: number;
  disconnected?: boolean;
  completeTime?: string;

  constructor(id: string) {
    this.id = id;
    this.progress = 0;
    this.carIndex = random(0, config.player.carsCount - 1);
    this.wordIndex = 0;
    this.roomId = "";
  }

  reset(): void {
    this.progress = 0;
    this.carIndex = random(0, config.player.carsCount - 1);
    this.wordIndex = 0;
    this.completeTime = "";
  }
  abstract joinRoom(roomId: string): void;
  abstract leaveRoom(): void;
  abstract wordCompleted(room: Room): void;
  abstract toTransport(): PlayerI;
}

export class RealPlayer extends PlayerBase {
  socket: SocketIO.Socket;

  constructor(socket: SocketIO.Socket) {
    super(socket.id);
    this.socket = socket;
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket.join(roomId);
    this.reset();
  }

  leaveRoom() {
    if (!this.roomId) return;

    this.socket.leave(this.roomId);
    this.roomId = "";
  }

  wordCompleted(room: Room) {
    if (!room || this.completeTime || room.state === ROOM_STATES.WAITING) {
      return;
    }

    this.wordIndex++;
    this.progress = this.wordIndex / parsedTexts[room.textID].length;

    if (this.progress >= 1) {
      this.completeTime = getTimePassedInSecAndMs(room.startTS!);
      room.playerFinished(this);
    }
  }

  toTransport(): PlayerI {
    return {
      id: this.id,
      progress: this.progress,
      carIndex: this.carIndex,
      completeTime: this.completeTime,
    };
  }
}

export class FakePlayer extends PlayerBase {
  constructor(id: string) {
    super(id);
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
  }
  leaveRoom() {
    if (!this.roomId) return;
    this.roomId = "";
  }

  wordCompleted(room: Room) {
    if (!room || this.completeTime || room.state === ROOM_STATES.WAITING) {
      return;
    }

    this.wordIndex++;
    this.progress = this.wordIndex / parsedTexts[room.textID].length;

    if (this.progress >= 1) {
      this.completeTime = getTimePassedInSecAndMs(room.startTS!);
      room.playerFinished(this);
    }
  }

  toTransport(): PlayerI {
    return {
      id: this.id,
      progress: this.progress,
      carIndex: this.carIndex,
      completeTime: this.completeTime,
    };
  }
}
