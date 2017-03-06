/* @flow */

export default class LocalHTMLSite   {

  name: string;
  filePath: string;
  queryString: string;

  constructor(name: string, filePath: string, queryString: string = '') {
    this.name = name;
    this.filePath = filePath;
    this.queryString = queryString;
  }
}
