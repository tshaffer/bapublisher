/* @flow */
// TODO - put flow type aliases in shared file
type DictStringToFileToPublish = { [fileName:string]: FileToPublish };

import * as nodeWrappers from './nodeWrappers';
const path = require('path');

import FileToPublish from './entities/fileToPublish';
import SyncSpecDownload from './entities/syncSpecDownload';

export default function publishToTarget(publishParams: Object,
                                         publishAllFilesToCopy: DictStringToFileToPublish,
                                         syncSpecFileName: string) {

  return new Promise( (_, reject) => {

    const publishFolder = publishParams.targetFolder;

    let matchingFilesList: Array<FileToPublish> = [];
    let uniqueFilesList: Array<FileToPublish> = [];

    getFilesToCopy(publishAllFilesToCopy, publishFolder, matchingFilesList, uniqueFilesList).then( () => {

      console.log('number of matching files: ', matchingFilesList.length);
      console.log('number of new files: ', uniqueFilesList.length);   // array of FileSpec

      let remainingNumberOfMatchingFiles = matchingFilesList.length;
      while (remainingNumberOfMatchingFiles > 0) {
        // TODO - in current BrightAuthor, this step may require user interaction.
        // TODO - how should this be implemented in BACon?
        // TODO - for now, don't re-copy matching files
        remainingNumberOfMatchingFiles = 0;
      }

      let promises = [];

      if (uniqueFilesList.length > 0) {
        promises.push(performFileCopies(publishParams, publishFolder, uniqueFilesList));
      }

      Promise.all(promises).then( () => {
        return writeLocalSyncSpec(publishParams, publishAllFilesToCopy, publishFolder, syncSpecFileName);
      }).catch( (err) => {
        debugger;
        reject(err);
      });
    });
  });
}


function getFileToCopy(fileToPublish: FileToPublish,
                       publishFolder: string,
                       matchingFilesList: Array<FileToPublish>,
                       uniqueFilesList: Array<FileToPublish>) {

  return new Promise( (resolve, reject) => {

    let sourceFilePath = fileToPublish.filePath;
    let filesList = uniqueFilesList;

    let sourceFileSHA1 = fileToPublish.hash;
    let destinationFileStats;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
    getPoolFilePath(path.join(publishFolder, 'pool'), sourceFileSHA1, true).then((relativeFilePath) => {

      let destinationFile = path.join(publishFolder, 'pool', relativeFilePath, 'sha1-' + sourceFileSHA1);

      nodeWrappers.stat(destinationFile).then((returneDestinationFileStats) => {

        destinationFileStats = returneDestinationFileStats;

        if (destinationFileStats && destinationFileStats.isFile()) {
          return nodeWrappers.stat(sourceFilePath);
        }
        else {
          debugger;
          reject('destinationFileStats.isFile() failed on: ', destinationFile);
        }

      }).catch( (err) => {
        if (err.code !== 'ENOENT') {
          debugger;
          reject(err);
        }

        // destination file does not exist yet, add it to the list
        filesList.push(fileToPublish);
        resolve();

      }).then((sourceFileStats) => {

        // both source and destination files exist, compare their sizes
        if (sourceFileStats && sourceFileStats.isFile()) {
          if (!destinationFileStats) {
            console.log('no destinationFileStats for: ', destinationFile);
            // at this point in time, I don't think this should occur.
            debugger;
          }
          if (destinationFileStats && sourceFileStats.size === destinationFileStats.size) {
            filesList = matchingFilesList;
          }
          filesList.push(fileToPublish);
          resolve();
        }
        // TODO - error if no sourceFileStats or sourceFile is not a file
      });
    });
  });
}

function getFilesToCopy(publishAllFilesToCopy: DictStringToFileToPublish, publishFolder: string,
                        matchingFilesList: Array<FileToPublish>, uniqueFilesList: Array<FileToPublish>) {

  let promises = [];

  return new Promise( (resolve, reject) => {

    for (let fileName in publishAllFilesToCopy) {
      if (publishAllFilesToCopy.hasOwnProperty(fileName)) {
        let fileToPublish = publishAllFilesToCopy[fileName];
        promises.push(getFileToCopy(fileToPublish, publishFolder, matchingFilesList, uniqueFilesList));
      }
    }
    Promise.all(promises).then( () => {
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}

function performFileCopy(fileToPublish: FileToPublish, publishFolder: string) {

  return new Promise( (resolve, reject) => {

    const sourceFileSHA1 = fileToPublish.hash;
    const sourceFilePath = fileToPublish.filePath;
    const copyToRootFolder = fileToPublish.copyToRootFolder;
    const fileName = fileToPublish.fileName;
    let destinationFilePath;

    getPoolFilePath(path.join(publishFolder, 'pool'), sourceFileSHA1, true).then( (relativeFilePath) => {

      const destinationFileName = path.join('pool', relativeFilePath, 'sha1-' + sourceFileSHA1);
      destinationFilePath = path.join(publishFolder, destinationFileName);

      return nodeWrappers.overwriteFile(sourceFilePath, destinationFilePath);
    }).then( () => {
      if (copyToRootFolder) {
        destinationFilePath = path.join(publishFolder, '/', fileName);
        nodeWrappers.overwriteFile(sourceFilePath, destinationFilePath).then(() => {
          resolve();
        });
      }
      else {
        resolve();
      }
    }).catch( (err) => {
      reject(err);
    });
  });
}

function performFileCopies(publishParams: Object, publishFolder: string, filesToPublish: Array<FileToPublish>) {

  return new Promise((resolve, reject) => {

    let index = 0;
    const numFilesToCopy = filesToPublish.length;

    const promises = filesToPublish.map( (fileToPublish) => {

      if (publishParams.progressCallback) {
        publishParams.progressCallback(++index, numFilesToCopy, fileToPublish.fileName, fileToPublish.filePath);
      }
      return performFileCopy(fileToPublish, publishFolder);
    });

    Promise.all(promises).then( () => {
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}

function getPoolFilePath(startDir: string, sha1: string, createDirectories: boolean) {

  return new Promise( (resolve, reject) => {

    let relativeFilePath = '';

    if (sha1.length >= 2) {

      let folders = [];
      folders.push(sha1.substring(sha1.length - 2, sha1.length - 2 + 1));
      folders.push(sha1.substring(sha1.length - 1, sha1.length - 1 + 1));

      if (createDirectories) {
        let currentDir = path.join(startDir, folders[0]);
        nodeWrappers.mkdir(currentDir).then(() => {
          currentDir = path.join(currentDir, folders[1]);
          nodeWrappers.mkdir(currentDir).then(() => {
            folders.forEach(folderName => {
              relativeFilePath = relativeFilePath + folderName + '/';
            });
            resolve(relativeFilePath);
          });
        }).catch( (err) => {
          debugger;
          reject(err);
        });
      }
      else {
        let currentDir = path.join(startDir, folders[0]);
        currentDir = path.join(currentDir, folders[1]);
        folders.forEach(folderName => {
          relativeFilePath = relativeFilePath + folderName + '/';
        });
        resolve(relativeFilePath);
      }
    }
    else {
      // not sure if this case can occur
      debugger;
    }
  });
}

function buildDeleteSection() {
  let deleteSection = [];
  deleteSection.push( {
    'pattern': '*.brs'
  });
  deleteSection.push( {
    'pattern': '*.rok'
  });
  deleteSection.push( {
    'pattern': '*.bsfw'
  });
  return deleteSection;
}

function buildIgnoreSection() {
  let ignoreSection = [];
  ignoreSection.push( {
    'pattern': '*'
  });
  return ignoreSection;
}

export function writeLocalSyncSpec(publishParams: Object, publishAllFilesToCopy: DictStringToFileToPublish,
                            publishFolder: string, fileName: string) {

  return new Promise( (resolve, reject) => {

    let syncSpec = {};

    syncSpec.meta = {};
    syncSpec.meta.client = {};
    Object.assign(syncSpec.meta.client, publishParams.syncSpecClientParams);

    syncSpec.meta.server = {};
    Object.assign(syncSpec.meta.server, publishParams.syncSpecServerParams);

    buildSyncSpecFilesSection(publishParams, publishAllFilesToCopy).then( (files) => {

      syncSpec.files = {};
      syncSpec.files.download = files;

      syncSpec.files.ignore = buildIgnoreSection();
      syncSpec.files.delete = buildDeleteSection();

      syncSpec.name = 'Simple Networking';

      const filePath = path.join(publishFolder, fileName);
      const syncSpecStr = JSON.stringify(syncSpec, null, '\t');
      nodeWrappers.writeFile(filePath, syncSpecStr).then( () => {
        resolve('ok');
      });
    }).catch( (err) => {
      debugger;
      reject(err);
    });
  });
}

function buildSyncSpecDownloadItem(fileName: string, fileToPublish: FileToPublish, publishParams: Object) {

  return new Promise((resolve, reject) => {

    let { hash, size, groupName } = fileToPublish;

    let download: SyncSpecDownload = new SyncSpecDownload();

    download.name = fileName;

    download.size = size;

    download.hash = {};
    download.hash.method = 'SHA1';
    download.hash.hex = hash;

    getPoolFilePath('', hash, false).then( (relativeFilePath) => {

      if (groupName !== '') {
        download.group = groupName;
      }
      else {
        delete download.group;
      }

      // insert target specific code here
      if (publishParams.writeTargetSpecificSyncSpecDownloadEntries) {
        publishParams.writeTargetSpecificSyncSpecDownloadEntries(download, publishParams);
      }

      // TODO - probe data for video files

      download.link =
          publishParams.writeTargetSpecificSyncSpecLinkEntry(relativeFilePath, hash, publishParams);

      resolve(download);
    }).catch( (err) => {
      reject(err);
    });
  });
}

function buildSyncSpecFilesSection(publishParams: Object, publishAllFilesToCopy: DictStringToFileToPublish) {

  return new Promise( (resolve, reject) => {

    let promises = [];

    for (let fileName in publishAllFilesToCopy) {

      if (publishAllFilesToCopy.hasOwnProperty(fileName)) {

        let fileToPublish = publishAllFilesToCopy[fileName];
        promises.push(buildSyncSpecDownloadItem(fileName, fileToPublish, publishParams));
      }
    }

    Promise.all(promises).then( (downloads) => {
      resolve(downloads);
    }).catch( (err) => {
      reject(err);
    });
  });
}

// returns Promises[]
export function prepareTargetForPublish(targetFolder: string) {

  let promises = createFolders(targetFolder);
  promises.push(deleteExistingFiles(targetFolder));
  return promises;
}

// returns Promises[]
function createFolders(targetFolder: string) {

  const poolFolder = path.join(targetFolder, 'pool');
  const feedCacheFolder = path.join(targetFolder, 'feed_cache');
  const feedPool = path.join(targetFolder, 'feedPool');

  // create folders required for local publishing
  let promises = [];
  promises.push(nodeWrappers.mkdir(poolFolder));
  promises.push(nodeWrappers.mkdir(feedCacheFolder));
  promises.push(nodeWrappers.mkdir(feedPool));

  return promises;
}

// returns Promise
function deleteExistingFiles(targetFolder: string) {

  const currentSyncPath = path.join(targetFolder, 'current-sync.xml');
  return nodeWrappers.remove(currentSyncPath);
}


export function postProcessPublishFiles(publishAllFilesToCopy: { [fileName:string]: FileToPublish }) {

  // special case FW files getting published to LWS - for non LWS, they aren't added to
  // sync spec; for LWS, they are.
  for (let fileName in publishAllFilesToCopy) {
    if (publishAllFilesToCopy.hasOwnProperty(fileName)) {
      let fileToPublish = publishAllFilesToCopy[fileName];
      if (fileToPublish.copyToRootFolder && fileToPublish.groupName === 'script') {
        fileToPublish.addToSyncSpec = true;
      }
    }
  }
}
