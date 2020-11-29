"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimePassedInSecAndMs = exports.sleep = exports.parsedTexts = void 0;
var texts_json_1 = __importDefault(require("./texts.json"));
var parseText = function (text) {
    return text.trim().split(" ");
};
var getParsedTexts = function () {
    var tmp = {};
    for (var _i = 0, _a = Object.entries(texts_json_1.default); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        tmp[key] = parseText(value);
    }
    return tmp;
};
exports.parsedTexts = getParsedTexts();
exports.sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
exports.getTimePassedInSecAndMs = function (startTS) {
    var msPassed = Date.now() - startTS;
    var seconds = msPassed / 1000;
    return seconds.toFixed(2);
};
