/* @flow */

export default class FileToPublish   {

  fileName: string;
  filePath: string;
  addToSyncSpec: boolean;
  hash: string;
  size: number;
  copyToRootFolder: boolean;
  groupName: string;
  forceContentTypeOther: boolean;

  constructor(fileName: string, filePath: string, addToSyncSpec: boolean, hash: string = '', size: number,
              copyToRootFolder: boolean = false,
              groupName: string = '', forceContentTypeOther: boolean = false) {
    this.fileName = fileName;
    this.filePath = filePath;
    this.addToSyncSpec = addToSyncSpec;
    this.hash = hash;
    this.size = size;
    this.copyToRootFolder = copyToRootFolder;
    this.groupName = groupName;
    this.forceContentTypeOther = forceContentTypeOther;
  }
}
