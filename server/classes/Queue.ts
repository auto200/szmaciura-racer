import { Player } from "./Players";

export class Queue {
  players: Player[];

  constructor() {
    this.players = [];
  }

  add(player: Player) {
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
