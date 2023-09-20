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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackObject = exports.StackObjectState = exports.Stack = void 0;
var StackObjectState;
(function (StackObjectState) {
    StackObjectState["INITIATED"] = "INITIATED";
    StackObjectState["PAUSED"] = "PAUSED";
    StackObjectState["FINISHIED"] = "FINISHIED";
    StackObjectState["FAILED"] = "FAILED";
    StackObjectState["ENQUEUED"] = "ENQUEUED";
    StackObjectState["UNKNOWN"] = "UNKNOWN";
})(StackObjectState || (StackObjectState = {}));
exports.StackObjectState = StackObjectState;
class StackObject {
    constructor(name, process, retry = false, attempts = 0) {
        this.id = this.generateIdentifier();
        this.name = name !== null && name !== void 0 ? name : `name:-${this.id}`;
        this.state = StackObjectState.ENQUEUED;
        this.process = process;
        this.type = typeof process;
        this.retry = retry;
        this.attempts = attempts;
    }
    generateIdentifier() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let chain = '';
        for (let i = 0; i < 20; i++) {
            const randomIndex = Math.floor(Math.random() * alphabet.length);
            chain += alphabet.charAt(randomIndex);
        }
        return chain;
    }
    withState(state) {
        return {
            id: this.id,
            name: this.name,
            state,
            process: this.process,
            type: this.type,
            retry: this.retry,
            attempts: this.attempts
        };
    }
}
exports.StackObject = StackObject;
class Stack {
    constructor() {
        this.stack = [];
        this.memStack = [];
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            let index = this.stack.length - 1;
            while (this.stack.length != 0) {
                yield this.process(this.stack[index], index);
                if (this.stack.length != index + 1)
                    index--;
            }
        });
    }
    process(obj, idx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const func = typeof obj.process === "function" ? obj.process : undefined;
            if (!func)
                return Promise.resolve();
            const { id, name, retry, attempts } = obj;
            console.log(`\x1b[33m[PROCESS][${name}] :- ${id} (starting) `);
            try {
                if (func.constructor.name === "AsyncFunction") {
                    yield func();
                }
                else {
                    func();
                }
                this.memStack = [...this.memStack, obj.withState(StackObjectState["FINISHIED"])];
                this.stack.pop();
                console.log(`\x1b[32m[PROCESS][${name}] :- finishied \n`);
                return Promise.resolve();
            }
            catch (e) {
                console.error(`[PROCESS][${name}] :- ${id} (An error has occurred):`);
                console.error(`\x1b[31m[PROCESS][${name}] :- ${(_a = e["message"]) !== null && _a !== void 0 ? _a : e}`);
                if (retry && attempts > 0) {
                    console.error(`[PROCESS][${name}] :- Added for retrying`);
                    const tempStack = [...this.stack];
                    obj.attempts = obj.attempts - 1;
                    tempStack[idx] = obj;
                    this.stack = tempStack;
                    if (obj.attempts == 0) {
                        this.stack.pop();
                        console.error(`\x1b[32m[PROCESS][${name}] :- finishied \n`);
                        return Promise.resolve();
                    }
                    console.error(`\x1b[32m[PROCESS][${name}] :- Retrying \n `);
                }
                else {
                    this.stack.pop();
                    this.memStack = [...this.memStack, obj.withState(StackObjectState["FAILED"])];
                    console.error(`\x1b[32m[PROCESS][${name}] :- finishied \n`);
                    return Promise.resolve();
                }
            }
        });
    }
    formatObjectPrint(Obj, idx) {
        var _a;
        return `[PROCESS][${Obj.name}][${idx}] : state: {${(_a = Obj.state) !== null && _a !== void 0 ? _a : StackObjectState["UNKNOWN"]}} - Identifier: {${Obj.id}} \n`;
    }
    append(obj) {
        console.log("[Adding]: ==> ");
        const stackObject = new StackObject(obj.name, obj.process, obj.retry, obj.attempts);
        console.log(this.formatObjectPrint(stackObject, this.stack.length));
        this.stack = [...this.stack, stackObject];
    }
    showProcesses() {
        this.stack.forEach((it, idx) => console.log(this.formatObjectPrint(it, idx)));
    }
    getLast() {
        if (this.stack.length == 0)
            return undefined;
        return this.stack[this.stack.length - 1];
    }
}
exports.Stack = Stack;
