import { Player } from "./Player";

export class Queue {
  players: Set<Player>;

  constructor() {
    this.players = new Set();
  }

  add(player: Player) {
    this.players.add(player);
  }

  get length() {
    return this.players.size;
  }

  takeAll() {
    const players = new Set(this.players);
    this.players.clear();
    return players;
  }

  remove(player: Player) {
    this.players.delete(player);
  }
}
