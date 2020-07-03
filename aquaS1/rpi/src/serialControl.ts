import { createNanoEvents, Emitter } from "nanoevents";
import SerialPort from "serialport";
import Readline from "@serialport/parser-readline";

const READY_FLAG = "*R";

interface Events {
  ready: () => void;
  error: (message: string) => void;
  mcmessage: (data: string) => void;
  mcerror: (data: string) => void;
}

export class SerialControlManager {
  port: SerialPort;
  queryQueue: { controlChar: string; resolve: (data: any) => void }[];
  parser: any;
  emitter: Emitter;

  constructor(path: string, baudRate: number) {
    // TODO: make queue modular/ creat abstractions to take advantage of typing
    this.queryQueue = [];
    this.emitter = createNanoEvents<Events>();

    this.port = new SerialPort(path, { baudRate: baudRate });

    this.port.on("error", (err) => {
      this.emitter.emit("error", err.message);
    });

    this.port.on("open", () => {
      this.port.write(READY_FLAG);
    });

    this.port.pipe(new Readline()).on("data", (data) => this.handleData(data));
  }

  on<E extends keyof Events>(event: E, callback: Events[E]) {
    return this.emitter.on(event, callback);
  }

  query<T>(controlChar: string) {
    this.port.write(`?${controlChar}`);
    console.log(`> ?${controlChar}`);

    return new Promise<T>((res: (data: T) => void) => {
      this.queryQueue.push({ controlChar, resolve: res });
    });
  }

  resolveQuery<T>(controlChar: string, data: T) {
    for (let i = this.queryQueue.length - 1; i >= 0; i--) {
      let query = this.queryQueue[i];
      if (query.controlChar === controlChar) {
        query.resolve(data);
      }
    }
  }

  set<T extends number | boolean>(controlChar: string, val: T) {
    let stringVal = String(val);
    if (typeof val === "boolean") {
      stringVal = val ? "1" : "0";
    }

    this.port.write(`!${controlChar}${stringVal}`);
    console.log(`!${controlChar}${stringVal}`);

    return this.query<T>(controlChar);
  }

  handleData(data: Buffer) {
    // TODO: rewrite to be modular?
    let text = data.toString().slice(0, -1).trim();
    this.emitter.emit("mcmessage", text);

    if (text.startsWith("!")) {
      this.handleSet(text);
    } else if (text.startsWith("*")) {
      this.handleFlag(text);
    } else {
      this.handleUnknown(text);
    }
  }

  handleSet(data: string) {
    const flag = data[1];

    switch (flag) {
      // Number returns
      case "T":
        let temp = Number(
          data.match(/^!T(?<temp>\-?[0-9]+\.[0-9]+)/).groups.temp
        );
        console.log(`${data} - Temperature read at ${temp}C`);

        this.resolveQuery(flag, temp);
        break;

      // Boolean returns
      case "L":
      case "P":
        let val = Boolean(data.match(/^![A-Z](?<val>[01])/).groups.val === "1");
        console.log(`${data} - Boolean read as ${val}`);

        this.resolveQuery(flag, val);
        break;

      default:
        this.handleUnknown(data);
    }
  }

  handleFlag(data: string) {
    const flag = data[1];

    switch (flag) {
      case "R":
        this.emitter.emit("ready", data);
        break;

      case "E":
        // TODO : handle microcontroller error
        this.emitter.emit("mcerror", data);
        break;

      default:
        this.handleUnknown(data);
    }
  }

  handleUnknown(data: string) {}

  async getTemp(): Promise<number> {
    return await this.query("T");
  }

  async getHighLevel(): Promise<boolean> {
    return await this.query("L");
  }

  async getPumpState(): Promise<boolean> {
    return await this.query("P");
  }

  async setPumpState(val: boolean): Promise<boolean> {
    return await this.set("P", val);
  }
}
