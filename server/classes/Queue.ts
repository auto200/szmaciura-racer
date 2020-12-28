import { FakePlayer, RealPlayer } from "./Players";

export default class Queue {
  players: (RealPlayer | FakePlayer)[];

  constructor() {
    this.players = [];
  }
  add(player: RealPlayer | FakePlayer) {
    this.players.push(player);
  }
  get length() {
    return this.players.length;
  }
  takeAll() {
    return this.players.splice(0, this.length);
  }
  remove(playerId: string) {
    this.players = this.players.filter(({ id }) => id !== playerId);
  }
}
