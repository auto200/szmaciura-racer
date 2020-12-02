export interface AchievementData {
  name: string;
  valueToComplete: number;
  description: string;
  image: string;
}

export default abstract class Achievement {
  readonly name: string;
  readonly valueToComplete: number;
  readonly description: string;
  readonly image: string;
  abstract check(any: any): any;

  constructor(achievementData: AchievementData) {
    const { name, valueToComplete, description, image } = achievementData;

    this.name = name;
    this.valueToComplete = valueToComplete;
    this.description = description;
    this.image = image;
  }
}
