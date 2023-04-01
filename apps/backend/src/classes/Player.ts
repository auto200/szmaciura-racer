import {
  CAR_AVATARS_SRC,
  getTimePassedInSecAndMs,
  Player as PlayerI,
} from "@szmaciura/shared";
import sample from "lodash/sample";

export class Player implements PlayerI {
  id: string;
  roomId: string;
  wordIndex: number;
  progress: number;
  carAvatarSrc: string;
  isFake: boolean;
  disconnected?: boolean;
  completeTime?: string;

  constructor(id: string, isFake: boolean = false) {
    this.id = id;
    this.progress = 0;
    this.carAvatarSrc = sample(CAR_AVATARS_SRC) || CAR_AVATARS_SRC[0];
    this.wordIndex = 0;
    this.roomId = "";
    this.isFake = isFake;
  }

  reset() {
    this.progress = 0;
    this.carAvatarSrc = sample(CAR_AVATARS_SRC) || CAR_AVATARS_SRC[0];
    this.wordIndex = 0;
    this.completeTime = "";
  }

  wordCompleted(wordsInTextCount: number, roomStartTs: number) {
    this.wordIndex++;
    this.progress = this.wordIndex / wordsInTextCount;

    if (this.progress >= 1) {
      this.completeTime = getTimePassedInSecAndMs(roomStartTs);
    }
  }

  get toTransport(): PlayerI {
    return {
      id: this.id,
      progress: this.progress,
      carAvatarSrc: this.carAvatarSrc,
      completeTime: this.completeTime,
    };
  }
}
