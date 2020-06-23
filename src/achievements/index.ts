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
  steps: number[];
  check: (state: State) => number;
}

const LongRunner: Achievement = {
  name: "egi wymysl nazwe",
  status: {
    level: 0,
    doneTimestamps: [0],
    current: 0,
  },
  steps: [50, 150, 300],
  check: function (state) {
    for (let i = this.steps.length; i >= 0; i--) {
      if (state.history.length >= this.steps[i - 1]) return i;
    }
    return 0;
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
