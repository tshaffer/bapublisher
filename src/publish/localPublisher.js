/* @flow */

import publishToTarget from './publishDataWriter';
import { prepareTargetForPublish } from './publishDataWriter';

import FileToPublish from './entities/fileToPublish';

export default function
  localPublish(publishParams: Object, publishAllFilesToCopy: { [fileName:string]: FileToPublish }) {

  return new Promise( (resolve, reject) => {

    const targetFolder = publishParams.targetFolder;

    publishParams.writeTargetSpecificSyncSpecDownloadEntries = null;
    publishParams.writeTargetSpecificSyncSpecLinkEntry = writeStandaloneSyncSpecLinkEntry;

    let promises = prepareTargetForPublish(targetFolder);

    Promise.all(promises).then( () => {
      publishToTarget(publishParams, publishAllFilesToCopy, 'local-sync.json').then( () => {
        resolve();
      }).catch( (err) => {
        reject(err);
      });
    });
  });
}

function writeStandaloneSyncSpecLinkEntry(relativeFilePath: string, hash: string) {
  return 'pool/' + relativeFilePath + 'sha1-' + hash;
}