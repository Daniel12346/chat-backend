import { readFile, readFileSync } from "fs";
/*import { promisify } from "util";

//TODO: better error handling (any error handling)

const readAsync = promisify(readFile);

const toString = (buff: Buffer) => buff.toString("utf-8");

const readSchema = (schemaPath: string) =>
  readAsync(schemaPath)
    //coverting the received buffer to a string
    .then(toString)
    .catch(err => {
      throw new Error("Schema reading error:" + err);
    });
*/
const readSchemas = (...schemaPaths) =>
  //returns an array of resolved promises of the schema paths
  [...schemaPaths].map(path => readFileSync(path, { encoding: "UTF-8" }));

export default readSchemas;
