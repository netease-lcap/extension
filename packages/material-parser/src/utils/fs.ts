import * as fs from 'fs-extra';

export function readJSONSync(filePath: string) {
  const content = fs.readFileSync(filePath).toString();
  return JSON.parse(content);
}

export function loadFile(filePath: string): string {
  const content: string | Buffer = fs.readFileSync(filePath);
  if (typeof content === 'string') {
    return content;
  }
  return content.toString();
}
