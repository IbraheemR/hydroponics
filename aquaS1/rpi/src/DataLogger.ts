import fs from "fs";

interface DataObject {
  timestamp?: number;
  [propName: string]: number | boolean | string;
}

export default class DataLogger<T extends DataObject> {
  path: string;
  stream: fs.WriteStream;

  constructor(path: string) {
    this.path = path;
    this.stream = fs.createWriteStream(path);
  }

  log(data: T) {
    data.timestamp = Date.now();
    this.stream.write(JSON.stringify(data));
  }
}
