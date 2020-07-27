import { History } from "../contexts/Store";
import bronzeRafon from "../images/bronze_rafon.png";
import silverRafon from "../images/silver_rafon.png";
import goldenRafon from "../images/golden_rafon.png";

export interface Achievement {
  name: AchievementNames;
  requiredToComplete: number;
  description: string;
  image: any;
  check: (
    state: History[]
  ) => {
    current: number;
    timestamp?: number;
  };
}

export type AchievementNames = "Szmaciurka" | "Szmaciura" | "Szmacisko";

export type Achievements = {
  [name in AchievementNames]: Achievement;
};

const achievements: Achievements = {
  Szmaciurka: {
    name: "Szmaciurka",
    requiredToComplete: 10,
    description: "Napisz szmaciurę 10 razy",
    image: bronzeRafon,
    check: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
  Szmaciura: {
    name: "Szmaciura",
    requiredToComplete: 25,
    description: "Napisz szmaciurę 25 razy",
    image: silverRafon,
    check: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
  Szmacisko: {
    name: "Szmacisko",
    requiredToComplete: 50,
    description: "Napisz szmaciurę 50 razy",
    image: goldenRafon,
    check: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
};
export default achievements;
