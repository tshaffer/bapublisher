/* @flow */

import FileToPublish from './fileToPublish';

export default class HtmlFileToPublish extends FileToPublish  {

  isMainWebPage: boolean;
  siteName: string;
  relativeUrl: string;

  constructor(fileName: string, filePath: string, addToSyncSpec: boolean, hash: string = '', size: number,
              copyToRootFolder: boolean = false,
              groupName: string = '', forceContentTypeOther: boolean = false,
              isMainWebPage: boolean = false, siteName: string, relativeUrl: string) {
    super(fileName, filePath, addToSyncSpec, hash, size, copyToRootFolder, groupName, forceContentTypeOther);
    this.isMainWebPage = isMainWebPage;
    this.siteName = siteName;
    this.fileName = fileName;
    this.relativeUrl = relativeUrl;
    this.copyToRootFolder = false;
  }
}
