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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const port = process.env.PORT || 443;
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const app = yield (0, server_1.default)();
        if (process.env.NODE_ENV != "production") {
            app.listen(port, () => {
                console.log(`Server is running on https://10.10.246.24:${port}`);
            });
        }
        else {
            try {
                const prop = {
                    key: fs_1.default.readFileSync("/home/st111/client-key.pem"),
                    cert: fs_1.default.readFileSync("/home/st111/client-cert.pem")
                };
                https_1.default.createServer(prop, app).listen(port);
                console.log(`HTTPS Server is running on https://10.10.246.24:${port}`);
            }
            catch (error) {
                console.error("Failed to load SSL certificates:", error);
                process.exit(1);
            }
        }
    }
    catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
});
startServer();
//# sourceMappingURL=app.js.map