"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var socket_io_1 = __importDefault(require("socket.io"));
var nanoid_1 = require("nanoid");
var enums_1 = require("./shared/enums");
var utils_1 = require("./shared/utils");
var config_1 = __importDefault(require("./config"));
var lodash_1 = require("lodash");
var date_fns_1 = require("date-fns");
var app = express_1.default();
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
var server = null;
if (process.env.DEV_PORT) {
    server = app.listen(process.env.DEV_PORT, function () {
        console.log("listening...", "specified port:", process.env.DEV_PORT);
    });
}
else {
    server = app.listen(function () {
        console.log("listening", "no port specified");
    });
}
var io;
if (process.env.DEV_PORT) {
    io = socket_io_1.default(server);
}
else {
    io = socket_io_1.default(server, {
        // prevent connections from other origins
        origins: ["https://szmaciura.pl:443", "https://www.szmaciura.pl:443"],
    });
}
var _publicRooms = {};
// const privateRooms: RoomsObj = {};
var _queue = [];
io.of("/game").on("connection", function (socket) {
    console.log("new client connected");
    //cleanup
    socket.on("disconnect", function (reason) {
        _queue = _queue.filter(function (player) { return player.id !== socket.id; });
        var room = Object.values(_publicRooms).find(function (_a) {
            var players = _a.players;
            return players.find(function (player) {
                if (player.id === socket.id) {
                    player.disconnected = true;
                    return true;
                }
                return false;
            });
        });
        if (!room)
            return;
        if (room.players.every(function (_a) {
            var id = _a.id, disconnected = _a.disconnected;
            return id.startsWith(config_1.default.fakePlayers.idPrefix) || disconnected === true;
        })) {
            delete _publicRooms[room.id];
        }
        console.log("client disconnected", reason);
    });
    socket.on(enums_1.SOCKET_EVENTS.JOIN_QUE, function () {
        var freeRoom = getFreePublicRoom();
        if (freeRoom) {
            socket.join(freeRoom.id);
            freeRoom.players.push(getNewPlayer(socket.id));
            io.of("/game").to(freeRoom.id).emit(enums_1.SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
            console.log("player found open room and joined, room id:", freeRoom.id, "players:", freeRoom.players.map(function (_a) {
                var id = _a.id;
                return id;
            }));
            return;
        }
        _queue.push(getNewPlayer(socket.id));
        console.log("user added to que");
        if (_queue.length >= 2)
            createAndHandleNewRoom();
        console.log(_queue);
    });
    socket.on(enums_1.SOCKET_EVENTS.WORD_COMPLETED, function (roomId, wordIndex) {
        var room = _publicRooms[roomId];
        var player = room === null || room === void 0 ? void 0 : room.players.find(function (_a) {
            var id = _a.id;
            return id === socket.id;
        });
        if (!room ||
            !player ||
            player.completeTime ||
            room.state === enums_1.ROOM_STATES.WAITING) {
            return;
        }
        var progress = wordIndex / utils_1.parsedTexts[room.textID].length;
        player.progress = progress;
        if (progress >= 1) {
            player.completeTime = utils_1.getTimePassedInSecAndMs(room.startTS);
            room.playersThatFinished.push(player);
        }
        io.of("/game").to(roomId).emit(enums_1.SOCKET_EVENTS.UPDATE_ROOM, room);
    });
    socket.on(enums_1.SOCKET_EVENTS.LEAVE_ROOM, function (roomID) {
        var room = _publicRooms[roomID];
        if (!room)
            return;
        room.players = room.players.filter(function (_a) {
            var id = _a.id;
            return id !== socket.id;
        });
        socket.leave(roomID);
    });
});
//add fake players
(function () { return __awaiter(void 0, void 0, void 0, function () {
    function handleFakePlayer(roomId, fakePlayerId) {
        return __awaiter(this, void 0, void 0, function () {
            var wordIndex, _a, minSpeed, maxSpeed, room, player, textArr, wordLength;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        wordIndex = 0;
                        _a = config_1.default.fakePlayers.speeds[lodash_1.random(0, config_1.default.fakePlayers.speeds.length - 1)], minSpeed = _a[0], maxSpeed = _a[1];
                        _b.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 5];
                        room = _publicRooms[roomId];
                        player = room === null || room === void 0 ? void 0 : room.players.find(function (_a) {
                            var id = _a.id;
                            return id === fakePlayerId;
                        });
                        if (!room || !player || player.completeTime) {
                            return [3 /*break*/, 5];
                        }
                        if (!(room.state === enums_1.ROOM_STATES.WAITING)) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.sleep(1000)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        textArr = utils_1.parsedTexts[room.textID];
                        wordLength = textArr[wordIndex].length;
                        return [4 /*yield*/, utils_1.sleep(lodash_1.random(minSpeed * wordLength, maxSpeed * wordLength))];
                    case 4:
                        _b.sent();
                        wordIndex++;
                        player.progress = wordIndex / textArr.length;
                        if (player.progress >= 1) {
                            player.completeTime = utils_1.getTimePassedInSecAndMs(room.startTS);
                            room.playersThatFinished.push(player);
                        }
                        io.of("/game").to(roomId).emit(enums_1.SOCKET_EVENTS.UPDATE_ROOM, room);
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    var fakePlayer, freeRoom, fakePlayersInRoom;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!config_1.default.fakePlayers.enabled) return [3 /*break*/, 3];
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, utils_1.sleep(lodash_1.random(5000, 8000))];
            case 2:
                _a.sent();
                console.log("trying to create fake player");
                fakePlayer = getNewPlayer("" + config_1.default.fakePlayers.idPrefix + nanoid_1.nanoid());
                if (_queue.length) {
                    _queue.push(fakePlayer);
                    handleFakePlayer(createAndHandleNewRoom(), fakePlayer.id);
                }
                else {
                    freeRoom = getFreePublicRoom();
                    if (!freeRoom)
                        return [3 /*break*/, 1];
                    fakePlayersInRoom = freeRoom.players.filter(function (_a) {
                        var id = _a.id;
                        return id.startsWith(config_1.default.fakePlayers.idPrefix);
                    }).length;
                    if (fakePlayersInRoom >= config_1.default.fakePlayers.maxFakePlayersInRoom)
                        return [3 /*break*/, 1];
                    freeRoom.players.push(fakePlayer);
                    io.of("/game")
                        .to(freeRoom.id)
                        .emit(enums_1.SOCKET_EVENTS.UPDATE_ROOM, freeRoom);
                    handleFakePlayer(freeRoom.id, fakePlayer.id);
                }
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}); })();
/**
 * @returns new room id
 */
function createAndHandleNewRoom() {
    var roomId = nanoid_1.nanoid(6);
    _publicRooms[roomId] = {
        id: roomId,
        createTS: Date.now(),
        state: enums_1.ROOM_STATES.WAITING,
        players: __spreadArrays(_queue),
        playersThatFinished: [],
        expireTS: Date.now() + config_1.default.roomExpireTime,
        startTS: Date.now() + config_1.default.timeToStartGame,
        textID: Object.keys(utils_1.parsedTexts)[0],
    };
    _queue = [];
    _publicRooms[roomId].players.forEach(function (_a) {
        var _b;
        var id = _a.id;
        (_b = io.of("/game").connected[id]) === null || _b === void 0 ? void 0 : _b.join(roomId);
    });
    io.of("/game")
        .to(roomId)
        .emit(enums_1.SOCKET_EVENTS.UPDATE_ROOM, _publicRooms[roomId]);
    console.log("new room has been created, room id:", roomId, "players:", _publicRooms[roomId].players.map(function (_a) {
        var id = _a.id;
        return id;
    }));
    var interval = setInterval(function () {
        var room = _publicRooms[roomId];
        if (!room) {
            clearInterval(interval);
            return;
        }
        var timeToStart = date_fns_1.differenceInSeconds(room.startTS, Date.now());
        if (timeToStart >= 1) {
            io.of("/game")
                .to(roomId)
                .emit(enums_1.SOCKET_EVENTS.UPDATE_TIME_TO_START, timeToStart);
        }
        else {
            clearInterval(interval);
            room.state = enums_1.ROOM_STATES.STARTED;
            io.of("/game").to(roomId).emit(enums_1.SOCKET_EVENTS.UPDATE_ROOM, room);
            io.of("/game").to(roomId).emit(enums_1.SOCKET_EVENTS.START_MATCH);
            setTimeout(function () {
                if (_publicRooms[roomId]) {
                    delete _publicRooms[roomId];
                    Object.values(io.of("/game").in(roomId).sockets).forEach(function (socket) {
                        return socket.leave(roomId);
                    });
                    console.log("Room:", roomId, "expired. Closing...");
                }
            }, config_1.default.roomExpireTime);
        }
    }, 1000);
    return roomId;
}
function getNewPlayer(id) {
    return {
        id: id,
        progress: 0,
        carIndex: lodash_1.random(0, config_1.default.carsCount - 1),
    };
}
function getFreePublicRoom() {
    return Object.values(_publicRooms).find(function (room) {
        return room.state === enums_1.ROOM_STATES.WAITING &&
            room.players.length < config_1.default.roomMaxPlayers &&
            date_fns_1.differenceInSeconds(room.startTS, Date.now()) >=
                config_1.default.roomTimeThresholdBeforeStart / 1000;
    });
}
