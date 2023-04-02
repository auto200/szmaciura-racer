import { ROOM_STATES } from "@szmaciura/shared";
import { Room } from "./Room";

export class RoomsManager {
  rooms: Set<Room> = new Set();

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
    if ([...room.players].every(({ isFake, disconnected }) => isFake || disconnected === true)) {
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
