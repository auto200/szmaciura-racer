import { ROOM_STATES } from "./";
export interface Player {
  id: string;
  progress: number;
  carIndex: number;
}

export interface Room {
  id: string;
  state: ROOM_STATES;
  expireTS?: number;
  players: Player[];
  textId: TextId;
}
export type TextId = "szmaciura";
