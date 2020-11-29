"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
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
exports.default = config;
