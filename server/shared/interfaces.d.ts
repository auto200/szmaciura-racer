import { ROOM_STATES } from "./enums";

export interface Player {
  id: string;
  progress: number;
  carIndex: number;
  disconnected?: boolean;
  completeTime?: string;
}

export interface Room {
  createTS: number;
  id: string;
  state: ROOM_STATES;
  expireTS: number;
  players: Player[];
  textID: string;
  startTS: number;
  msToStart: number;
}
