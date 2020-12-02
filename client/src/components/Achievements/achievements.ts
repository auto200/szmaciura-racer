import { HistoryEntry } from "../../contexts/Store";
import bronzeRafon from "../../assets/achievements/bronze_rafon.png";
import silverRafon from "../../assets/achievements/silver_rafon.png";
import goldenRafon from "../../assets/achievements/golden_rafon.png";
import Achievement, { AchievementData } from "./Achievement.class";

class SzmaciuraAchievement extends Achievement {
  constructor(achievementData: AchievementData) {
    super(achievementData);
  }
  check(history: HistoryEntry[]) {
    const entryIndex = this.valueToComplete - 1;
    const requiredEntry = history.reverse()[entryIndex];

    return {
      currentTimesCompleted: history.length,
      completeTimestamp: requiredEntry?.timestamp,
    };
  }
}

const szmaciuraAchievementsData: AchievementData[] = [
  {
    name: "Szmaciurka",
    valueToComplete: 10,
    description: "Napisz szmaciurę 10 razy",
    image: bronzeRafon,
  },
  {
    name: "Szmaciura",
    valueToComplete: 25,
    description: "Napisz szmaciurę 25 razy",
    image: silverRafon,
  },
  {
    name: "Szmacisko",
    valueToComplete: 50,
    description: "Napisz szmaciurę 50 razy",
    image: goldenRafon,
  },
];

const achievements: Achievement[] = szmaciuraAchievementsData.map(
  achiv => new SzmaciuraAchievement(achiv)
);

export default achievements;
