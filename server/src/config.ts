interface Config {
  roomMaxPlayers: number;
  carsCount: number;
  roomExpireTime: number;
  timeToStartGame: number;
  roomTimeThresholdBeforeStart: number;
  fakePlayers: {
    enabled: boolean;
    idPrefix: string;
    maxFakePlayersInRoom: number;
    speeds: [number, number][];
  };
}
const config: Config = {
  roomMaxPlayers: 5,
  carsCount: 3,
  roomExpireTime: 1000 * 60 * 3,
  timeToStartGame: 1000 * 10,
  roomTimeThresholdBeforeStart: 4000,
  fakePlayers: {
    enabled: true,
    idPrefix: "imFaker",
    maxFakePlayersInRoom: 2,
    // min/max speed(ms) to type single character -> less = faster
    speeds: [
      [100, 200],
      [100, 300],
      [100, 400],
      [100, 500],
    ],
  },
};

export default config;
