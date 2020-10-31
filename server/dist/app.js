"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var socket_io_1 = __importDefault(require("socket.io"));
dotenv_1.default.config();
var app = express_1.default();
app.use(cors_1.default());
// app.use(express.static(path.join(__dirname, "public")));
var server = null;
if (process.env.DEV_PORT) {
    server = app.listen(process.env.DEV_PORT, function () {
        console.log("listening", "port specified:", process.env.DEV_PORT);
    });
}
else {
    server = app.listen(function () {
        console.log("listening", "no port specified");
    });
}
app.get("/", function (req, res) {
    res.send("elo kurwa");
});
var io = socket_io_1.default(server);
io.on("connection", function (socket) {
    console.log("new client connected");
});
