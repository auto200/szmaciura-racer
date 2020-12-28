import { differenceInSeconds } from "date-fns";
import config from "../config";
import { ROOM_STATES } from "../shared/enums";
import { Room as RoomI } from "../shared/interfaces";
import { parsedTexts } from "../shared/utils";
import { FakePlayer, RealPlayer } from "./Players";

export class Room implements RoomI {
  id: string;
  createTS: number;
  state: ROOM_STATES;
  players: (RealPlayer | FakePlayer)[];
  playersThatFinished: (RealPlayer | FakePlayer)[];
  expireTS: number;
  startTS: number;
  textID: string;

  constructor(
    id: string,
    players: (RealPlayer | FakePlayer)[],
    textID: string = Object.keys(parsedTexts)[0]
  ) {
    this.id = id;
    this.createTS = Date.now();
    this.state = ROOM_STATES.WAITING;
    this.players = players;
    this.playersThatFinished = [];
    this.expireTS = Date.now() + config.room.expireTime;
    this.startTS = 0;
    this.textID = textID;
  }

  add(player: RealPlayer | FakePlayer) {
    this.players.push(player);
  }

  remove(playerId: string) {
    this.players = this.players.filter(({ id }) => id !== playerId);
  }

  toTransport(): RoomI {
    return {
      id: this.id,
      createTS: this.createTS,
      state: this.state,
      players: this.players.map((player) => player.toTransport()),
      playersThatFinished: this.playersThatFinished.map((player) =>
        player.toTransport()
      ),
      expireTS: this.expireTS,
      startTS: this.startTS,
      textID: this.textID,
    };
  }

  playerFinished(player: RealPlayer | FakePlayer) {
    this.playersThatFinished.push(player);
  }
  get fakePlayersCount() {
    return this.players.filter(({ id }) =>
      id.startsWith(config.fakePlayers.idPrefix)
    ).length;
  }
}

type Rooms = { [key: string]: Room };

export class PubilcRooms {
  rooms: Rooms;

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
        ({ id, disconnected }) =>
          id.startsWith(config.fakePlayers.idPrefix) || disconnected === true
      )
    ) {
      this.remove(room.id);
    }
  }

  getFree(): Room | undefined {
    return Object.values(this.rooms).find(
      (room) =>
        room.state === ROOM_STATES.WAITING &&
        room.players.length < config.room.maxPlayers &&
        differenceInSeconds(room.startTS, Date.now()) >=
          config.room.thresholdToJoinBeforeStart / 1000
    );
  }
}
