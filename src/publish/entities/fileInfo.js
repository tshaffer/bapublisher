/* @flow */

export default class FileInfo   {

  sha1: string;
  size: number;

  constructor(sha1: string, size: number) {
    this.sha1 = sha1;
    this.size = size;
  }
}
