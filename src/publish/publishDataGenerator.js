/* @flow */
// TODO - put flow type aliases in shared file
type DictStringToFileToPublish = { [fileName:string]: FileToPublish };

import * as nodeWrappers from './nodeWrappers';
import * as utils from './utilities';
const path = require('path');

import ScheduledPresentation from './publicEntities/scheduledPresentation';
import PublishFirmware from './publicEntities/publishFirmware';
import PresentationToSchedule from './publicEntities/presentationToSchedule';

import FileToPublish from './entities/fileToPublish';
import LocalHTMLSite from './entities/localHTMLSite';
import HTMLPublishSite from './entities/htmlPublishSite';
import HtmlFileToPublish from './entities/htmlFileToPublish';

import FileInfo from './entities/fileInfo';

import generateTmpFiles from './generateTmpFiles';

export default function generatePublishData(publishParams: Object) {

  return new Promise( (resolve, reject) => {

    const tmpDir = publishParams.tmpDir;
    console.log('publishDataGenerator - electron tmpDir: ', tmpDir);

    const relativePath : string = '../BAcon/publish/static';
    const staticPublishFilesDirectory: string = path.resolve(relativePath);

    let publishAllFilesToCopy: { [fileName:string]: FileToPublish } = {};

    retrievePresentations(publishParams.scheduledPresentations, publishAllFilesToCopy, tmpDir).then( () => {

      const scheduledPresentation = publishParams.scheduledPresentations[0];
      const autoplay = scheduledPresentation.presentationToSchedule.autorunAutoplay;

      getBASFiles(staticPublishFilesDirectory, publishAllFilesToCopy).then( () => {

        getSpecialFiles(autoplay, publishAllFilesToCopy, tmpDir,
          staticPublishFilesDirectory, publishParams.scheduledPresentations).then(() => {

            let promises = getFWFiles(publishParams.fwUpdateType, publishParams.fwPublishData, publishAllFilesToCopy,
              tmpDir);
            Promise.all(promises).then( () => {
              resolve(publishAllFilesToCopy);
            });
          });
      });
    }).catch( (err) => {
      reject(err);
    });
  });
}

function getPlaylistStates(autoplay: Object) : Array<Object> {

  let presentationPlaylistStates = [];
  let signData = autoplay.BrightAuthor;
  signData.zones.forEach((zone) => {
    const playlist = zone.playlist;
    presentationPlaylistStates = presentationPlaylistStates.concat(playlist.states);
  });

  return presentationPlaylistStates;
}

function addMediaFileToPublishList(mediaItem: Object,
                          publishAllFilesToCopy: DictStringToFileToPublish) {

  return new Promise( (resolve, reject) => {
    utils.getFileInfo(mediaItem.filePath).then( fileInfo => {
      console.log('FileInfo: ', fileInfo);
      let fileToPublish = new FileToPublish(mediaItem.fileName, mediaItem.filePath, true,
        fileInfo.sha1, fileInfo.size);
      addToPublishAllFilesToCopy(mediaItem.fileName, fileToPublish, publishAllFilesToCopy);
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}

function getPresentationMediaFiles(scheduledPresentation: ScheduledPresentation,
                                   publishAllFilesToCopy: DictStringToFileToPublish) {

  return new Promise( (resolve, reject) => {

    const autoplay = scheduledPresentation.presentationToSchedule.autorunAutoplay;
    const presentationPlaylistStates = getPlaylistStates(autoplay);

    const promises = presentationPlaylistStates.map( (state) => {
      if (state.imageItem) {
        return addMediaFileToPublishList(state.imageItem, publishAllFilesToCopy);
      }
      else if (state.videoItem) {
        return addMediaFileToPublishList(state.videoItem, publishAllFilesToCopy);
      }
    });

    Promise.all(promises).then( () => {
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}


function retrievePresentation(scheduledPresentation: ScheduledPresentation,
                              publishAllFilesToCopy: DictStringToFileToPublish,
                              tmpDir: string) {

  return new Promise( (resolve, reject) => {

    let presentationToSchedule : PresentationToSchedule;
    let bpfFilePath : string;
    let fileToPublish : FileToPublish;
    let autoplayName : string;
    let autoplayPath : string;

    getPresentationMediaFiles(scheduledPresentation, publishAllFilesToCopy).then(() => {

      presentationToSchedule = scheduledPresentation.presentationToSchedule;
      bpfFilePath = presentationToSchedule.filePath;
      return utils.getFileInfo(bpfFilePath);

    }).then((fileInfo) => {

      const bmlFileName = presentationToSchedule.name + '.bml';
      fileToPublish = new FileToPublish(bmlFileName, bpfFilePath, true,
        fileInfo.sha1, fileInfo.size);
      addToPublishAllFilesToCopy(bmlFileName, fileToPublish, publishAllFilesToCopy);

    }).then( () => {

      const autoplay = scheduledPresentation.presentationToSchedule.autorunAutoplay;
      let signData = autoplay.BrightAuthor;
      const autoplayStr = JSON.stringify(signData, null, '\t');
      autoplayName = 'autoplay-' + signData.meta.name + '.json';
      autoplayPath = path.join(tmpDir, autoplayName);
      return nodeWrappers.writeFile(autoplayPath, autoplayStr);

    }).then(() => {

      return utils.getFileInfo(autoplayPath);

    }).then((fileInfo) => {

      fileToPublish = new FileToPublish(autoplayName, autoplayPath, true,
        fileInfo.sha1, fileInfo.size);
      addToPublishAllFilesToCopy(autoplayName, fileToPublish, publishAllFilesToCopy);
      resolve();

    }).catch((err) => {
      reject(err);
    });

  });
}

function retrievePresentations(scheduledPresentations: Array<ScheduledPresentation>,
                               publishAllFilesToCopy: DictStringToFileToPublish,
                               tmpDir: string) {

  return new Promise( (resolve, reject) => {

    const promises = scheduledPresentations.map( (scheduledPresentation) => {
      return retrievePresentation(scheduledPresentation, publishAllFilesToCopy, tmpDir);
    });

    Promise.all(promises).then( () => {
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}

function getBASFiles(staticPublishFilesDirectory: string, publishAllFilesToCopy: DictStringToFileToPublish) {

  const basPath = path.join(staticPublishFilesDirectory, 'www', 'BrightSignApplicationServer', 'index.html');

  const queryStringParam = '';
  const brightSignApplicationServerSite =
    new LocalHTMLSite('BrightSignApplicationServer', basPath, queryStringParam);
  const htmlPublishSite =
    new HTMLPublishSite(brightSignApplicationServerSite.name, brightSignApplicationServerSite.filePath);

  return getHTMLContent(htmlPublishSite, publishAllFilesToCopy);
}

function processHTMLSiteFile(htmlSite: HTMLPublishSite,
                             siteDirectory: string,
                             siteFile: string,
                             publishAllFilesToCopy: DictStringToFileToPublish) {

  return new Promise( (resolve, reject) => {

    let relativeUrl = '';

    utils.getFileSizeInBytes(siteFile).then ( (fileSize) => {

      if (fileSize > 0) { // strip zero length files

        // get relative url
        relativeUrl = siteFile;

        if (siteFile.startsWith(siteDirectory)) {
          relativeUrl = siteFile.substring(siteDirectory.length);
          while (relativeUrl.startsWith('/')) {
            relativeUrl = relativeUrl.substring(1);
          }
        }

        return utils.getFileInfo(siteFile);
      }
      else {
        // not implemented yet
        // TODO
        debugger;
        reject('not implemented yet');
      }
    }).then( (fileInfo: FileInfo) => {
      // file prefix is '<site name>--'. If it changes here, it must also change in HTMLSite
      let pseudoFileName = htmlSite.siteName + '-' + relativeUrl;

      const htmlFileToPublish = new HtmlFileToPublish(path.basename(siteFile), siteFile, true, fileInfo.sha1,
        fileInfo.size, false, '', false, false, htmlSite.siteName, relativeUrl);

      if (!(pseudoFileName in publishAllFilesToCopy)) {
        addToPublishAllFilesToCopy(pseudoFileName, htmlFileToPublish, publishAllFilesToCopy);
      }

      resolve();
    });
  });
}

function getHTMLContent(htmlSite: HTMLPublishSite, publishAllFilesToCopy: DictStringToFileToPublish) {

  const filePath = htmlSite.filePath; // this is the main web page - need to keep track of it for BSN uploads
  const siteDirectory = path.dirname(filePath);

  return new Promise( (resolve, reject) => {
    nodeWrappers.getFiles(siteDirectory).then( (siteFiles) => {

      const promises = siteFiles.map( (siteFile) => {
        return processHTMLSiteFile(htmlSite, siteDirectory, siteFile, publishAllFilesToCopy);
      });

      Promise.all(promises).then( () => {
        resolve();
      }).catch( (err) => {
        reject(err);
      });
    });
  });
}


function getFWFiles(fwUpdateType: string,
                    fwPublishData: Object,
                    publishAllFilesToCopy: DictStringToFileToPublish,
                    tmpDir: string) {

  let promises = [];
  for (let fwFamily in fwPublishData) {
    if (fwPublishData.hasOwnProperty(fwFamily)) {
      let publishFirmware: PublishFirmware = fwPublishData[fwFamily];
      if (publishFirmware.firmwareUpdateSource !== 'none') {
        promises.push(getFWFile(fwUpdateType, publishFirmware, publishAllFilesToCopy, tmpDir));
      }
    }
  }

  return promises;
}

function getFWFile(firmwareUpdateType: string,
                   publishFirmware: PublishFirmware,
                   publishAllFilesToCopy: DictStringToFileToPublish,
                   tmpDir: string) {

  return new Promise( (resolve, reject) => {

    let fwSource = publishFirmware.getFirmwareSourceUrl();
    let fwFileName = publishFirmware.getFirmwareFileName(firmwareUpdateType);

    if (publishFirmware.firmwareUpdateSource !== 'specific') {
      let targetFWPath = path.join(tmpDir, fwFileName);
      utils.downloadViaFetch(fwSource, targetFWPath).then( () => {
        addSystemFile(publishAllFilesToCopy, fwFileName, targetFWPath, 'script', true, false).then( () => {
          resolve();
        });
      }).catch( (err) => {
        reject(err);
      });
    }
    else {
      addSystemFile(publishAllFilesToCopy, fwFileName, fwSource, 'script', true, false).then( () => {
        resolve();
      }).catch( (err) => {
        reject(err);
      });
    }
  });
}

function getSpecialFiles(autoplay: Object,
                         publishAllFilesToCopy: DictStringToFileToPublish,
                         tmpDir: string,
                         staticPublishFilesDirectory: string,
                         scheduledPresentations: Array<ScheduledPresentation>) {

  return new Promise( (resolve, reject) => {

    generateTmpFiles(autoplay, scheduledPresentations, tmpDir).then( (tmpFilePathsObjects) => {

      let tmpFilePathsByFileType = {};
      tmpFilePathsObjects.forEach( (tmpFilePathObject) => {
        let tmpFilePathKey = Object.keys(tmpFilePathObject)[0];
        tmpFilePathsByFileType[tmpFilePathKey] = tmpFilePathObject[tmpFilePathKey];
      });

      let autoSchedulePath = tmpFilePathsByFileType['autoScheduleFilePath'];
      let resourcesPath = tmpFilePathsByFileType['resourcesPath'];
      let autopluginsPath = tmpFilePathsByFileType['autopluginsPath'];

      let addAutoSchedulePromise = addSystemFile(publishAllFilesToCopy,
        'autoschedule.json', autoSchedulePath, '');
      let addResourcesPromise = addSystemFile(publishAllFilesToCopy,
        'resources.txt', resourcesPath, '');
      let addAutoPluginsPromise = addSystemFile(publishAllFilesToCopy,
        'autoplugins.brs', autopluginsPath, 'script', true);

      // autoxml.brs
      const autoxmlPath = path.join(staticPublishFilesDirectory, 'autoxml.brs');
      let addAutoxmlPromise = addSystemFile(publishAllFilesToCopy,
        'autorun.brs', autoxmlPath, 'script', true);

      // deviceWebPage.html
      const deviceWebPageDestinationPath = path.join(staticPublishFilesDirectory, 'deviceWebPage.html');
      let addDeviceWebPagePromise = addSystemFile(publishAllFilesToCopy,
        '_deviceWebPage.html', deviceWebPageDestinationPath, '');

      // deviceIdWebPage.html
      const deviceIdWebPageDestinationPath = path.join(staticPublishFilesDirectory, 'deviceIdWebPage.html');
      let addDeviceIdWebPagePromise = addSystemFile(publishAllFilesToCopy,
        '_deviceIdWebPage.html', deviceIdWebPageDestinationPath, '');

      // featureMinRevs.xml
      const featureMinRevsDestinationPath = path.join(staticPublishFilesDirectory, 'featureMinRevs.xml');
      let addFeatureMinRevsPromise = addSystemFile(publishAllFilesToCopy,
        'featureMinRevs.xml', featureMinRevsDestinationPath, '');

      // BoseProducts.xml
      const boseProductsDestinationPath = path.join(staticPublishFilesDirectory, 'BoseProducts.xml');
      let addBoseProductsPromise = addSystemFile(publishAllFilesToCopy,
        'BoseProducts.xml', boseProductsDestinationPath, '');

      Promise.all([addAutoxmlPromise, addAutoSchedulePromise, addResourcesPromise, addAutoPluginsPromise,
        addDeviceWebPagePromise, addDeviceIdWebPagePromise, addFeatureMinRevsPromise,
        addBoseProductsPromise]).then( () => {
          resolve();
        }).catch( (err) => {
          reject(err);
        });
    });
  });
}

function addSystemFile(publishAllFilesToCopy: DictStringToFileToPublish, fileName: string, filePath: string,
                       groupName: string, copyToRootFolder: boolean = false, addToSyncSpec: boolean = true) {

  return new Promise( (resolve, reject) => {

    utils.getFileInfo(filePath).then((fileInfo) => {
      let fileToPublish = new FileToPublish(fileName, filePath, addToSyncSpec,
        fileInfo.sha1, fileInfo.size, copyToRootFolder, groupName);
      addToPublishAllFilesToCopy(fileName, fileToPublish, publishAllFilesToCopy);
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}

function addToPublishAllFilesToCopy(fileName: string, fileToPublish: FileToPublish,
                                    publishAllFilesToCopy: DictStringToFileToPublish) {
  publishAllFilesToCopy[fileName] = fileToPublish;
}
