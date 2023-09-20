import { Stack } from "./main/stack"
import axios from "axios"
import fs from "fs"

function test(): void {
    console.log("un test")
}

function randomThrown(): void {
    const numeroRandom = Math.floor(Math.random() * 10) + 1;
    throw Error("Just haging around")
}

async function testing(): Promise<void> {
    console.log("Evento como promesa");
    Promise.resolve()
}

async function readFile() {
    return new Promise((resolve, reject) => {
        try {
            const fileContent = fs.readFileSync("././static/index.txt", "utf-8")
            console.log(fileContent)
            resolve("Nothing")
        } catch (e) {
            console.error(e)
            console.error("Error ")
            reject(e)
        }
    })
}

async function getAndPostUser(): Promise<void> {
    try {
        console.log("Getting users from json place holder")
        const response = await axios.get("https://jsonplaceholder.typicode.com/comments")
        console.log("Obtained response")
        console.log("Posting objects for local")
        await axios.post("http://localhost:4000/api/post", response.data)
        console.log("Objects posts")
    } catch (error) {
        console.error("Un error ha ocurrido en el llamado ")
    }
}


(() => {
    const stack = new Stack();

    stack.append({
        name: "first",
        process: test
    })
    stack.append({
        name: "second",
        process: test
    })
    stack.append({
        name: "third",
        process: readFile
    })
    stack.append({
        name: "fourth",
        process: randomThrown,
        retry: true,
        attempts: 2
    })

    stack.append({
        name: "five",
        process: testing,
    })
    stack.append({
        name: "six",
        process: getAndPostUser,
    })

    stack.start().then(() => { })
})()