import { HistoryEntry } from "@contexts/Store";
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
    description: "Napisz szmaciurę 10 razy",
    image: "/achievements/bronze_rafon.png",
  },
  {
    name: "Szmaciura",
    valueToComplete: 25,
    description: "Napisz szmaciurę 25 razy",
    image: "/achievements/silver_rafon.png",
  },
  {
    name: "Szmacisko",
    valueToComplete: 50,
    description: "Napisz szmaciurę 50 razy",
    image: "/achievements/golden_rafon.png",
  },
];

const achievements: Achievement[] = szmaciuraAchievementsData.map(
  (achiv) => new SzmaciuraAchievement(achiv)
);

export default achievements;
