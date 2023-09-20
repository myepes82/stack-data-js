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
const stack_1 = require("./main/stack");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
function test() {
    console.log("un test");
}
function randomThrown() {
    const numeroRandom = Math.floor(Math.random() * 10) + 1;
    throw Error("Just haging around");
}
function testing() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Evento como promesa");
        Promise.resolve();
    });
}
function readFile() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                const fileContent = fs_1.default.readFileSync("././static/index.txt", "utf-8");
                console.log(fileContent);
                resolve("Nothing");
            }
            catch (e) {
                console.error(e);
                console.error("Error ");
                reject(e);
            }
        });
    });
}
function getAndPostUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Getting users from json place holder");
            const response = yield axios_1.default.get("https://jsonplaceholder.typicode.com/comments");
            console.log("Obtained response");
            console.log("Posting objects for local");
            yield axios_1.default.post("http://localhost:4000/api/post", response.data);
            console.log("Objects posts");
        }
        catch (error) {
            console.error("Un error ha ocurrido en el llamado ");
        }
    });
}
(() => {
    const stack = new stack_1.Stack();
    stack.append({
        name: "first",
        process: test
    });
    stack.append({
        name: "second",
        process: test
    });
    stack.append({
        name: "third",
        process: readFile
    });
    stack.append({
        name: "fourth",
        process: randomThrown,
        retry: true,
        attempts: 2
    });
    stack.append({
        name: "five",
        process: testing,
    });
    stack.append({
        name: "six",
        process: getAndPostUser,
    });
    stack.start().then(() => { });
})();
