export interface RoomConfig {
  idLength: number;
  maxPlayers: number;
  expireTime: number;
  msToStartGame: number;
  thresholdToJoinBeforeStart: number;
  maxFakePlayersIn: number;
}

export interface GameConfig {
  player: {
    carsCount: number;
  };
  queue: {
    maxLength: number;
  };
  room: RoomConfig;
  fakePlayers: {
    enabled: boolean;
    idPrefix: string;
    speeds: [number, number][];
  };
}

export const gameConfig = {
  player: {
    carsCount: 3,
  },
  queue: {
    //must be less or equal room.maxPlayers
    maxLength: 2,
  },
  room: {
    idLength: 6,
    maxPlayers: 5,
    expireTime: 1000 * 60 * 3,
    msToStartGame: 1000 * 8,
    thresholdToJoinBeforeStart: 4000,
    maxFakePlayersIn: 2,
  },
  fakePlayers: {
    enabled: true,
    idPrefix: "elfbotNG",
    // min/max speed(ms) to type single character -> less = faster
    speeds: [
      [100, 200],
      [100, 300],
      [100, 400],
      [100, 500],
    ],
  },
} satisfies GameConfig;
