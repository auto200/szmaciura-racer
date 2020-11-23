interface Config {
  roomMaxPlayers: number;
  carsCount: number;
  roomExpireTime: number;
  timeToStartGame: number;
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
  fakePlayers: {
    enabled: true,
    idPrefix: "imFaker",
    maxFakePlayersInRoom: 2,
    speeds: [
      [500, 3000],
      [400, 2700],
      [200, 2000], //about 60s
      [200, 1500],
    ],
  },
};

export default config;
