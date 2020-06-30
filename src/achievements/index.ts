import { History } from "../contexts/Store";
import bronzeRafon from "../images/bronze_rafon.png";
import silverRafon from "../images/silver_rafon.png";
import goldenRafon from "../images/golden_rafon.png";

export interface Achievement {
  name: AchievementNames;
  requiredToComplete: number;
  description: string;
  image: any;
  getStatus: (
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
    requiredToComplete: 50,
    description: "Napisz szmaciurę 50 razy",
    image: bronzeRafon,
    getStatus: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
  Szmaciura: {
    name: "Szmaciura",
    requiredToComplete: 150,
    description: "Napisz szmaciurę 150 razy",
    image: silverRafon,
    getStatus: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
  Szmacisko: {
    name: "Szmacisko",
    requiredToComplete: 300,
    description: "Napisz szmaciurę 300 razy",
    image: goldenRafon,
    getStatus: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
};
export default achievements;
