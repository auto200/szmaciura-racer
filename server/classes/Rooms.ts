import { Config } from "../config";
import { ROOM_STATES } from "../shared/enums";
import { Room as RoomI } from "../shared/interfaces";
import { Player } from "./Players";

export class Room implements RoomI {
  id: string;
  createTS: number;
  state: ROOM_STATES;
  players: Player[];
  playersThatFinished: Player[];
  expireTS: number;
  startTS: number;
  textID: string;
  msToStart: number;
  config: Config;

  constructor(id: string, players: Player[], textID: string, config: Config) {
    this.config = config;
    this.id = id;
    this.createTS = Date.now();
    this.state = ROOM_STATES.WAITING;
    this.players = [];
    this.playersThatFinished = [];
    this.expireTS = Date.now() + this.config.room.expireTime;
    this.startTS = 0;
    this.textID = textID;
    this.msToStart = this.config.room.msToStartGame;
    players.forEach((player) => this.add(player));
  }

  /**
   *
   * @returns succeeded
   */
  add(player: Player): boolean {
    if (
      this.isFull ||
      (player.isFake &&
        this.fakePlayersCount >= this.config.fakePlayers.maxFakePlayersInRoom)
    ) {
      return false;
    }
    this.players.push(player);
    player.roomId = this.id;
    player.reset();
    return true;
  }

  toTransport(): RoomI {
    return {
      id: this.id,
      createTS: this.createTS,
      state: this.state,
      players: this.players.map(({ toTransport }) => toTransport),
      playersThatFinished: this.playersThatFinished.map(
        ({ toTransport }) => toTransport
      ),
      expireTS: this.expireTS,
      startTS: this.startTS,
      textID: this.textID,
      msToStart: this.msToStart,
    };
  }

  playerFinished(player: Player) {
    this.playersThatFinished.push(player);
  }

  get fakePlayersCount() {
    return this.players.filter(({ isFake }) => isFake).length;
  }

  get isFull() {
    return this.players.length >= this.config.room.maxPlayers;
  }
}

export class PubilcRooms {
  rooms: { [key: string]: Room };

  constructor() {
    this.rooms = {};
  }

  get(roomId: string): Room | undefined {
    return this.rooms[roomId];
  }

  add(room: Room) {
    this.rooms[room.id] = room;
  }

  remove(roomId: string) {
    delete this.rooms[roomId];
  }

  playerDisconnected(roomId: string) {
    const room = this.get(roomId);
    if (!room) return;

    //delete zombie room
    if (
      room.players.every(
        ({ isFake, disconnected }) => isFake || disconnected === true
      )
    ) {
      this.remove(room.id);
    }
  }
  getFree(): Room | undefined {
    return Object.values(this.rooms).find(
      (room) =>
        room.state === ROOM_STATES.WAITING &&
        room.players.length < room.config.room.maxPlayers &&
        room.msToStart >= room.config.room.thresholdToJoinBeforeStart
    );
  }
}
