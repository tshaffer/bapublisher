/* @flow */

const fs = require('fs-extra');
import * as nodeWrappers from './nodeWrappers';
const path = require('path');

const request = require('request');

const js2xmlparser = require('js2xmlparser2');
const xml2js = require('xml2js');

import {
  postProcessPublishFiles,
  writeLocalSyncSpec,
} from './publishDataWriter';

import FileToPublish from './entities/fileToPublish';

export default function lwsPublish(publishParams: Object, publishAllFilesToCopy: { [fileName:string]: FileToPublish }) {

  publishParams.writeTargetSpecificSyncSpecDownloadEntries = null;
  publishParams.writeTargetSpecificSyncSpecLinkEntry = writeStandaloneSyncSpecLinkEntry;

  postProcessPublishFiles(publishAllFilesToCopy);

  return new Promise( (resolve, reject) => {
    publishToTarget(publishParams, publishAllFilesToCopy).then( () => {
      resolve();
    }).catch( (err) => {
      reject(err);
    });
  });
}


function writeStandaloneSyncSpecLinkEntry(relativeFilePath: string, hash: string) {
  return 'pool/' + relativeFilePath + 'sha1-' + hash;
}

// function buploadToBrightSign(ipAddress: string, tmpDir: string) {
//
//   return new Promise( (resolve, reject) => {
//
//     let queryString = '';
//     // check limitStorageSpace
//     queryString += '?limitStorageSpace=' + 'false';
//
//     // Invoke SpecifyCardSizeLimits
//     // does the code need to wait for a response?
//     const url = 'http://'.concat(ipAddress, ':8080/SpecifyCardSizeLimits', queryString);
//     // TODO set username / password
//
//     http.get(url, (res) => {
//       console.log(`Got response: ${res.statusCode}`);
//       // consume response body
//       res.resume();
//
//   // invoke PrepareForTransfer, providing filesToPublish.xml to BrightSign
//       const hostname = ipAddress;
//       let endpoint = '/PrepareForTransfer';
//       // duplicate code
//       const filesToPublishPath = path.join(tmpDir, 'filesToPublish.xml');
//
//       let promise = httpUploadFile(hostname, endpoint, filesToPublishPath, [], true);
//       promise.then(rawFilesToCopy => {
//         let filesToCopy = getFilesToCopy(rawFilesToCopy);
//
//   // upload the files to the BrightSign
//         uploadFilesToBrightSign(filesToCopy).then( () => {
//           console.log('all files uploaded to BrightSign');
//
//           endpoint = '/UploadSyncSpec';
//           let filePath = path.join(tmpDir, 'new-local-sync.xml');
//           httpUploadFile(hostname, endpoint, filePath).then( () => {
//             resolve();
//           });
//         });
//       }).catch((err) => {
//         debugger;
//         reject(err);
//       });
//     }).on('error', (err) => {
//       console.log(`Got error: ${err.message}`);
//       reject(err);
//     });
//   });
// }
//

function uploadFileToBrightSign(hostname: string, filePath: string, fileName: string, sha1: string) {

  const encodedFileName = encodeURIComponent(fileName);

  const endpoint = '/UploadFile';

  let headers = [];
  let header = {};

  header = {};
  header.key = 'Destination-Filename';
  header.value = 'pool/sha1-' + sha1;
  headers.push(header);

  header = {};
  header.key = 'Friendly-Filename';
  header.value = encodedFileName;
  headers.push(header);

  return httpUploadFile(hostname, endpoint, filePath, headers);
}

function uploadFilesToBrightSign(publishParams: Object, filesToPublish: Array<FileToPublish>, hostname: string) {

  return new Promise( (resolve, reject) => {

    let index = 0;
    const numFilesToCopy = filesToPublish.length;

    let promises = [];
    filesToPublish.forEach(fileToPublish => {

      if (publishParams.progressCallback) {
        publishParams.progressCallback(++index, numFilesToCopy, fileToPublish.fileName, fileToPublish.filePath);
      }

      promises.push(uploadFileToBrightSign(hostname, fileToPublish.filePath,
        fileToPublish.fileName, fileToPublish.hash));
    });

    Promise.all(promises).then( () => {
      resolve();
      console.log('all files uploaded to BrightSign');
    }).catch( (err) => {
      reject(err);
    });
  });
}

function uploadToBrightSign(publishParams: Object, ipAddress: string, tmpDir: string) {

  return new Promise((resolve, reject) => {

    let queryString = '';
    // check limitStorageSpace
    queryString += '?limitStorageSpace=' + 'false';

    // Invoke SpecifyCardSizeLimits
    const url = 'http://'.concat(ipAddress, ':8080/SpecifyCardSizeLimits', queryString);
    // TODO set username / password

    nodeWrappers.httpGet(url).then( (res) => {

      console.log('nodeWrappers.httpGet response: ', res.statusCode);

      const filesToPublishPath = path.join(tmpDir, 'filesToPublish.xml');

      return httpUploadFile(ipAddress, '/PrepareForTransfer', filesToPublishPath, [], true);

    }).then( (rawFilesToCopy) => {

      let filesToCopy = getFilesToCopy(rawFilesToCopy);
      return uploadFilesToBrightSign(publishParams, filesToCopy, ipAddress);

    }).then( () => {

      console.log('all files uploaded to BrightSign, upload sync spec');

      let filePath = path.join(tmpDir, 'new-local-sync.xml');
      return httpUploadFile(ipAddress, '/UploadSyncSpec', filePath);

    }).then( () => {
      resolve();
    }).catch((err) => {
      debugger;
      reject(err);
    });
  });
}

function publishToTarget(publishParams: Object, publishAllFilesToCopy: { [fileName:string]: FileToPublish }) {

  console.log('Enter lws publishToTarget');

  const tmpDir: string = publishParams.tmpDir;
  console.log('lwsPublisher - electron tmpDir: ', tmpDir);

  return new Promise( (resolve, reject) => {

    writeLocalSyncSpec(publishParams, publishAllFilesToCopy, tmpDir, 'new-local-sync.xml').then( () => {

      writeListOfFilesForLWS(publishAllFilesToCopy, tmpDir).then(() => {

        let promises = [];

        // TODO - won't work to use tmpDir over and over again for multiple devices.
        // TODO - perhaps what's written to tmpDir only needs to be written once

        const ipAddresses = publishParams.lwsDeviceIPAddresses;
        ipAddresses.forEach((ipAddress) => {
          promises.push(uploadToBrightSign(publishParams, ipAddress, tmpDir));
        });
        Promise.all(promises).then( () => {
          resolve();
        });
      });
    }).catch( (err) => {
      reject(err);
    });
  });
}

function writeListOfFilesForLWS(publishAllFilesToCopy: { [fileName:string]: FileToPublish }, tmpDir: string) {

  return new Promise((resolve, reject) => {

    let listOfFiles = {};
    listOfFiles.file = [];

    for (let fileName in publishAllFilesToCopy) {

      if (publishAllFilesToCopy.hasOwnProperty(fileName)) {

        let fileToPublish = publishAllFilesToCopy[fileName];

        let file = {};
        file.fullFileName = 'sha1-' + fileToPublish.hash;
        file.fileName = fileName;
        file.filePath = fileToPublish.filePath;
        file.hashValue = fileToPublish.hash;
        file.fileSize = fileToPublish.size.toString();

        listOfFiles.file.push(file);
      }
    }

    console.log('number of files:', listOfFiles.file.length);

    const listOfFilesXml = js2xmlparser('files', listOfFiles);

    // write to filesToPublish.xml in tmp dir
    const filePath = path.join(tmpDir, 'filesToPublish.xml');
    nodeWrappers.writeFile(filePath, listOfFilesXml).then(() => {
      console.log('filesToPublish.xml successfully written');
      resolve('ok');
    }).catch( (err) => {
      reject(err);
    });
  });
}

// https://www.npmjs.com/package/request#multipartform-data-multipart-form-uploads
// BUT, see the following bugs
// https://github.com/request/request/issues/1961
// https://github.com/node-facebook/facebook-node-sdk/issues/67
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// http://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-html5-js-fetch-api
// https://developer.mozilla.org/en-US/docs/Web/API/FormData
function httpUploadFile(hostname: string, endpoint: string , filePath: string,
                        uploadHeaders:Array<any> = [], parseResponse: boolean = false) {

  return new Promise( (resolve, reject) => {

    let url = 'http://' + hostname + ':8080' + endpoint;

    let headers = { 'content-type': 'multipart/form-data' };
    uploadHeaders.forEach((uploadHeader) => {
      headers[uploadHeader.key] = uploadHeader.value;
    });

    // TODO - see if the 'Content-Disposition' header is required

    request.post(
      {
        url: url,
        headers: headers,
        multipart: {
          chunked: false,
          data: [
            {
              'Content-Disposition': 'form-data; name="nameParam1"',
              body: fs.createReadStream(filePath)
            }
          ]
        },
      },
      function optionalCallback(err, _, body) {
        if (err) {
          reject(err);
        }
        console.log('File upload successful: ', filePath);

        if (!parseResponse) {
          resolve();
        }
        else {
          let parser = new xml2js.Parser();
          try {
            parser.parseString(body, (err, jsonResponse) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(jsonResponse);
            });
          }
          catch (e) {
            reject(e);
          }
        }
      })
      .on('response', (response) => {
        console.log(response);
      })
      .on('error', (err) => {
        debugger;
        console.log(err);
        reject(err);
      });
  });
}

function getFilesToCopy(rawFilesToCopy: any) {

  let filesToCopy = [];

  if (rawFilesToCopy && rawFilesToCopy.filesToCopy && rawFilesToCopy.filesToCopy.file) {
    rawFilesToCopy.filesToCopy.file.forEach(file => {
      const fileName = file.fileName[0];
      const hashValue = file.hashValue[0];
      const fileSize = file.fileSize[0];

      // TODO - this needs straightening out
      // TODO - ?addToSyncSpec; groupName? copyToRootFolder?
      const fileToPublish = new FileToPublish(fileName, file.filePath[0], true, hashValue, fileSize);
      filesToCopy.push(fileToPublish);
    });
  }
  else {
    console.log('getFilesToCopy: no files to copy');
  }

  return filesToCopy;
}

