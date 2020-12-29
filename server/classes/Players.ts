import { random } from "lodash";
import config from "../config";
import { Player as PlayerI } from "../shared/interfaces";
import { getTimePassedInSecAndMs } from "../shared/utils";

export class Player implements PlayerI {
  id: string;
  roomId: string;
  wordIndex: number;
  progress: number;
  carIndex: number;
  isFake: boolean;
  disconnected?: boolean;
  completeTime?: string;

  constructor(id: string, isFake: boolean = false) {
    this.id = id;
    this.progress = 0;
    this.carIndex = random(0, config.player.carsCount - 1);
    this.wordIndex = 0;
    this.roomId = "";
    this.isFake = isFake;
  }

  reset() {
    this.progress = 0;
    this.carIndex = random(0, config.player.carsCount - 1);
    this.wordIndex = 0;
    this.completeTime = "";
  }

  wordCompleted(wordsInTextCount: number, roomStartTs: number) {
    this.wordIndex++;
    this.progress = this.wordIndex / wordsInTextCount;

    if (this.progress >= 1) {
      this.completeTime = getTimePassedInSecAndMs(roomStartTs);
    }
    return this.progress;
  }

  get toTransport(): PlayerI {
    return {
      id: this.id,
      progress: this.progress,
      carIndex: this.carIndex,
      completeTime: this.completeTime,
    };
  }
}
