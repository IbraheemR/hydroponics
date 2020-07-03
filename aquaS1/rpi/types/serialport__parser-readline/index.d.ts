declare module "@serialport/parser-readline" {
  import * as Stream from "stream";

  class Delimiter extends Stream.Transform {
    constructor(options: {
      delimiter: string | Buffer | number[];
      includeDelimiter?: boolean;
    });
  }
  class Readline extends Delimiter {
    constructor(options?: {
      delimiter?: string | Buffer | number[];
      encoding?:
        | "ascii"
        | "utf8"
        | "utf16le"
        | "ucs2"
        | "base64"
        | "binary"
        | "hex";
      includeDelimiter?: boolean;
    });
  }
  export = Readline;
}
