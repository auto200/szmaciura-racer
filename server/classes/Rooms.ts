import { RoomConfig } from "../config";
import { ROOM_STATES } from "../shared/enums";
import { Room as RoomI } from "../shared/interfaces";
import { Player } from "./Player";

interface ServerRoom extends Omit<RoomI, "players"> {
  players: Set<Player>;
}

export class Room implements ServerRoom {
  id: string;
  createTS: number;
  state: ROOM_STATES;
  players: Set<Player>;
  expireTS: number;
  startTS: number;
  textID: string;
  msToStart: number;
  config: RoomConfig;

  constructor(
    id: string,
    players: Set<Player>,
    textID: string,
    config: RoomConfig
  ) {
    this.config = config;
    this.id = id;
    this.createTS = Date.now();
    this.state = ROOM_STATES.WAITING;
    this.players = new Set();
    this.expireTS = Date.now() + this.config.expireTime;
    this.startTS = 0;
    this.textID = textID;
    this.msToStart = this.config.msToStartGame;
    players.forEach((player) => this.add(player));
  }

  /**
   *
   * @returns succeeded
   */
  add(player: Player): boolean {
    if (
      this.isFull ||
      (player.isFake && this.fakePlayersCount >= this.config.maxFakePlayersIn)
    ) {
      return false;
    }
    this.players.add(player);
    player.roomId = this.id;
    player.reset();
    return true;
  }

  toTransport(): RoomI {
    return {
      id: this.id,
      createTS: this.createTS,
      state: this.state,
      players: [...this.players].map(({ toTransport }) => toTransport),
      expireTS: this.expireTS,
      startTS: this.startTS,
      textID: this.textID,
      msToStart: this.msToStart,
    };
  }

  get fakePlayersCount() {
    return [...this.players].filter(({ isFake }) => isFake).length;
  }

  get isFull() {
    return this.players.size >= this.config.maxPlayers;
  }
}

export class PubilcRooms {
  rooms: Set<Room>;

  constructor() {
    this.rooms = new Set();
  }

  get(roomId: string) {
    return [...this.rooms].find((room) => room.id === roomId);
  }

  add(room: Room) {
    this.rooms.add(room);
  }

  remove(room: Room) {
    this.rooms.delete(room);
  }

  playerDisconnected(roomId: string) {
    const room = this.get(roomId);
    if (!room) return;

    //delete zombie room
    if (
      [...room.players].every(
        ({ isFake, disconnected }) => isFake || disconnected === true
      )
    ) {
      this.remove(room);
    }
  }
  getFree(): Room | undefined {
    return [...this.rooms].find(
      (room) =>
        room.state === ROOM_STATES.WAITING &&
        room.players.size < room.config.maxPlayers &&
        room.msToStart >= room.config.thresholdToJoinBeforeStart
    );
  }
}
