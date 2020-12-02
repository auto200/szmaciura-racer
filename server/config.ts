interface Config {
  player: {
    carsCount: number;
  };
  queue: {
    maxLength: number;
  };
  room: {
    maxPlayers: number;
    expireTime: number;
    timeToStartGame: number;
    thresholdToJoinBeforeStart: number;
  };
  fakePlayers: {
    enabled: boolean;
    idPrefix: string;
    maxFakePlayersInRoom: number;
    speeds: [number, number][];
  };
}
const config: Config = {
  player: {
    carsCount: 3,
  },
  queue: {
    maxLength: 2,
  },
  room: {
    maxPlayers: 5,
    expireTime: 1000 * 60 * 3,
    timeToStartGame: 1000 * 10,
    thresholdToJoinBeforeStart: 4000,
  },
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
