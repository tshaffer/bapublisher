/* @flow */

export default class HTMLPublishSite   {

  siteName: string;
  filePath: string;

  constructor(siteName: string, filePath: string) {
    this.siteName = siteName;
    this.filePath = filePath;
  }
}
