/* @flow */

export default class SyncSpecDownload   {

  name: string;
  hash: Object;
  size: number;
  link: string;
  group: ?string;

  constructor(name: string = '', hash: Object = {}, size: number = -1, link: string = '', group: ?string = null) {
    this.name = name;
    this.hash = hash;
    this.size = size;
    this.link = link;
    this.group = group;
  }
}

// TODO - make a hashClass that has the following members
// TODO - method, value