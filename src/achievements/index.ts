import { History } from "../contexts/Store";
import basicRafon from "../images/rafon.png";
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

export type AchievementNames =
  | "egi wymysl nazwe"
  | "tutaj tez nazwa potrzebana"
  | "Giga szmaciura";

export type Achievements = {
  [name in AchievementNames]: Achievement;
};

const achievements: Achievements = {
  "egi wymysl nazwe": {
    name: "egi wymysl nazwe",
    requiredToComplete: 50,
    description: "Napisz szmaciurę 50 razy",
    image: basicRafon,
    getStatus: function (history) {
      const timestamp = history
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)[this.requiredToComplete - 1]
        ?.timestamp;
      return { current: history.length, timestamp };
    },
  },
  "tutaj tez nazwa potrzebana": {
    name: "tutaj tez nazwa potrzebana",
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
  "Giga szmaciura": {
    name: "Giga szmaciura",
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
