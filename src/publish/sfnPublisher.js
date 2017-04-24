/* @flow */

import publishToTarget from './publishDataWriter';
import {
  prepareTargetForPublish,
  postProcessPublishFiles,
} from './publishDataWriter';

import FileToPublish from './entities/fileToPublish';

export default function sfnPublish(publishParams: Object, publishAllFilesToCopy: { [fileName:string]: FileToPublish }) {

  const targetFolder = publishParams.targetFolder;

  publishParams.writeTargetSpecificSyncSpecDownloadEntries = writeSFNSyncSpecDownloadEntries;
  publishParams.writeTargetSpecificSyncSpecLinkEntry = writeSFNSyncSpecLinkEntry;

  postProcessPublishFiles(publishAllFilesToCopy);

  return new Promise( (resolve, reject) => {

    let promises = prepareTargetForPublish(targetFolder);
    Promise.all(promises).then( () => {
      publishToTarget(publishParams, publishAllFilesToCopy, 'current-sync.json').then( () => {
        resolve();
      }).catch( (err) => {
        reject(err);
      });
    });
  });
}

function writeSFNSyncSpecDownloadEntries(download: Object) {

  let headers = {};
  headers['@'] = {
    'inherit': 'no'
  };
  headers['#'] = '';
  download.headers = headers;

  download.chargeable = 'no';
}

function writeSFNSyncSpecLinkEntry(relativeFilePath: string, hash: string, publishParams: Object) {
  return publishParams.simpleNetworkingUrl + '/pool/' + relativeFilePath + 'sha1-' + hash;
}