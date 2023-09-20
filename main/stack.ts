interface StackMethods {
    getLast(): IStackObject | undefined;
    append(obj: IStackObject): void;
    showProcesses(): void;
    start(): void;
}

enum StackObjectState {
    INITIATED = "INITIATED",
    PAUSED = "PAUSED",
    FINISHIED = "FINISHIED",
    FAILED = "FAILED",
    ENQUEUED = "ENQUEUED",
    UNKNOWN = "UNKNOWN"
}
interface IStackObject {
    id?: string;
    name: string;
    state?: StackObjectState;
    process: object | Function;
    type?: any;
    retry?: boolean;
    attempts?: number;
}

class StackObject implements IStackObject {
    id: string;
    name: string;
    state: StackObjectState;
    process: object | Function;
    type: any;
    retry?: boolean;
    attempts: number;

    constructor(
        name: string | undefined,
        process: object | Function | any,
        retry: boolean = false,
        attempts: number = 0) {
        this.id = this.generateIdentifier();
        this.name = name ?? `name:-${this.id}`
        this.state = StackObjectState.ENQUEUED
        this.process = process;
        this.type = typeof process
        this.retry = retry;
        this.attempts = attempts;
    }

    private generateIdentifier(): string {
        const alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let chain: string = ''
        for (let i = 0; i < 20; i++) {
            const randomIndex = Math.floor(Math.random() * alphabet.length);
            chain += alphabet.charAt(randomIndex);
        }
        return chain;
    }

    public withState(state: StackObjectState): StackObject {
        return {
            id: this.id,
            name: this.name,
            state,
            process: this.process,
            type: this.type,
            retry: this.retry,
            attempts: this.attempts
        } as StackObject;
    }
}

class Stack implements StackMethods {
    private stack: StackObject[] | [];
    private memStack: StackObject[] | [];

    constructor() {
        this.stack = [] as StackObject[];
        this.memStack = [] as StackObject[];
    }

    public async start(): Promise<void> {
        let index: number = this.stack.length - 1;
        while (this.stack.length != 0) {
            await this.process(this.stack[index], index)
            if (this.stack.length != index + 1) index--;
        }
    }

    private async process(obj: StackObject, idx: number): Promise<void> {
        const func: Function | undefined = typeof obj.process === "function" ? obj.process : undefined;
        if (!func) return Promise.resolve();

        const { id, name, retry, attempts } = obj;
        console.log(`\x1b[33m[PROCESS][${name}] :- ${id} (starting) `)

        try {
            if (func.constructor.name === "AsyncFunction") {
                await func();
            } else {
                func();
            }

            this.memStack = [...this.memStack, obj.withState(StackObjectState["FINISHIED"])];
            this.stack.pop()
            console.log(`\x1b[32m[PROCESS][${name}] :- finishied \n`)
            return Promise.resolve();
        } catch (e: any) {
            console.error(`[PROCESS][${name}] :- ${id} (An error has occurred):`);
            console.error(`\x1b[31m[PROCESS][${name}] :- ${e["message"] ?? e}`);

            if (retry && attempts > 0) {
                console.error(`[PROCESS][${name}] :- Added for retrying`);
                const tempStack = [...this.stack]
                obj.attempts = obj.attempts - 1;
                tempStack[idx] = obj
                this.stack = tempStack;

                if (obj.attempts == 0) {
                    this.stack.pop();
                    console.error(`\x1b[32m[PROCESS][${name}] :- finishied \n`)
                    return Promise.resolve()
                } 
                console.error(`\x1b[32m[PROCESS][${name}] :- Retrying \n `);
            } else {
                this.stack.pop()
                this.memStack = [...this.memStack, obj.withState(StackObjectState["FAILED"])]
                console.error(`\x1b[32m[PROCESS][${name}] :- finishied \n`)
                return Promise.resolve();
            }
        }
    }


    private formatObjectPrint(Obj: IStackObject, idx?: number): string {
        return `[PROCESS][${Obj.name}][${idx}] : state: {${Obj.state ?? StackObjectState["UNKNOWN"]}} - Identifier: {${Obj.id}} \n`
    }

    public append(obj: IStackObject): void {
        console.log("[Adding]: ==> ");
        const stackObject: StackObject = new StackObject(obj.name, obj.process, obj.retry, obj.attempts);
        console.log(this.formatObjectPrint(stackObject, this.stack.length));

        this.stack = [...this.stack, stackObject];
    }

    public showProcesses(): void {
        this.stack.forEach((it, idx) => console.log(this.formatObjectPrint(it, idx)))
    }

    public getLast(): IStackObject | undefined {
        if (this.stack.length == 0) return undefined;
        return this.stack[this.stack.length - 1];
    }


}


export {
    Stack,
    StackObjectState,
    IStackObject,
    StackMethods,
    StackObject
}