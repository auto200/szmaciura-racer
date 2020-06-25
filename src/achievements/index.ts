import { State } from "../contexts/Store";
import basicRafon from "../images/rafon.png";
import bronzeRafon from "../images/bronze_rafon.png";
import silverRafon from "../images/silver_rafon.png";
import goldenRafon from "../images/golden_rafon.png";

interface Achievement {
  name: AchievementNames;
  status: {
    level: number;
    doneTimestamps: number[];
    current: number;
  };
  description: string;
  steps: number[];
  check: (state: State) => AchievementCheckStatus;
}
export interface AchievementCheckStatus {
  level: number;
  timestamp?: number;
}
const LongRunner: Achievement = {
  name: "egi wymysl nazwe",
  status: {
    level: 0,
    doneTimestamps: [],
    current: 0,
  },
  description: "Napisz szmaciurę odpowiednią ilość razy",
  steps: [50, 150, 300],
  check: function (state) {
    let level = 0;
    for (let i = this.steps.length; i >= 0; i--) {
      if (state.history.length >= this.steps[i - 1]) {
        level = i;
        break;
      }
    }
    if (
      level !== 0 &&
      !state.achievements[this.name]?.status.doneTimestamps[level]
    ) {
      console.log(level);
      const timestamp = state.history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.steps[level - 1] - 1]
        .timestamp;
      return { level, timestamp };
    }
    return { level };
  },
};
export type AchievementNames = "egi wymysl nazwe";

export type Achievements = {
  [name in AchievementNames]?: Achievement;
};
export const achievements: Achievements = {
  "egi wymysl nazwe": LongRunner,
};
type AchievementsImgMap = {
  [name in AchievementNames]: any[];
};
export const achievementsImgMap: AchievementsImgMap = {
  "egi wymysl nazwe": [basicRafon, bronzeRafon, silverRafon, goldenRafon],
};
