export interface Player {
  id: string;
  progress: number;
  carIndex: number;
}

interface Room {
  id: string;
  state: ROOM_STATES;
  expireTS?: number;
  players: Player[];
}
