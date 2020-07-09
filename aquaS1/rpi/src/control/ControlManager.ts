import SerialManager, { Events as SerialEvents } from "./SerialManager";

export default class ControlManager {
    serialManager: SerialManager;

    constructor(path: string, baudRate: number) {
        this.serialManager = new SerialManager(path, baudRate);
    }

    on<E extends keyof SerialEvents>(event: E, callback: SerialEvents[E]) {
        return this.serialManager.on(event, callback);
    }

    close() {
        this.serialManager.close();
    }

    async getTemp(): Promise<number> {
        return await this.serialManager.query("T");
    }

    async getHighLevel(): Promise<boolean> {
        return await this.serialManager.query("L");
    }

    async getPumpState(): Promise<boolean> {
        return await this.serialManager.query("P");
    }

    async setPumpState(val: boolean): Promise<boolean> {
        return await this.serialManager.assert("P", val);
    }
}