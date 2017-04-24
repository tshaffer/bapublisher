/* @flow */

const fs = require('fs-extra');
import * as nodeWrappers from './nodeWrappers';
const path = require('path');

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

const request = require('request');

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
    queryString += '?limitStorageSpace=' + 'false';

    const url = 'http://'.concat(ipAddress, ':8080/SpecifyCardSizeLimits', queryString);
    // TODO set username / password

    nodeWrappers.httpGet(url).then( (_) => {

      const filesToPublishPath = path.join(tmpDir, 'filesToPublish.json');

      return httpUploadFile(ipAddress, '/PrepareForTransfer', filesToPublishPath, [], true);

    }).then( (rawFilesToCopy) => {

      let filesToCopy = getFilesToCopy(rawFilesToCopy);
      return uploadFilesToBrightSign(publishParams, filesToCopy, ipAddress);

    }).then( () => {

      console.log('all files uploaded to BrightSign, upload sync spec');

      let filePath = path.join(tmpDir, 'new-local-sync.json');
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

  const tmpDir: string = publishParams.tmpDir;
  console.log('lwsPublisher - electron tmpDir: ', tmpDir);

  return new Promise( (resolve, reject) => {

    writeLocalSyncSpec(publishParams, publishAllFilesToCopy, tmpDir, 'new-local-sync.json').then( () => {

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

    const filePath = path.join(tmpDir, 'filesToPublish.json');
    const listOfFilesStr = JSON.stringify(listOfFiles, null, '\t');
    nodeWrappers.writeFile(filePath, listOfFilesStr).then(() => {
      console.log('filesToPublish.json successfully written');
      resolve('ok');
    }).catch( (err) => {
      reject(err);
    });
  });
}

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function toBuffer(ab) {
  let buf = new Buffer(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}


function httpUploadFile(hostname: string, endpoint: string , filePath: string,
                        uploadHeaders:Array<any> = [], parseResponse: boolean = false) {

  const useFetch = true;

  if (useFetch) {
    return httpUploadFileViaFetch(hostname, endpoint, filePath, uploadHeaders, parseResponse);
  }
  else {
    return httpUploadFileViaRequest(hostname, endpoint, filePath, uploadHeaders, parseResponse);
  }
}


function httpUploadFileViaFetch(hostname: string, endpoint: string , filePath: string,
                        uploadHeaders:Array<any> = [], parseResponse: boolean = false) {
  return new Promise( (resolve, reject) => {

    let url = 'http://' + hostname + ':8080' + endpoint;

    const fileName = path.basename(filePath);

    const fileData : Buffer = fs.readFileSync(filePath);
    const fileArrayBuffer : ArrayBuffer = toArrayBuffer(fileData);

    let type : string = '';

    switch (path.extname(fileName).toLowerCase()) {
      case '.jpg': {
        type = 'image/jpeg';
        break;
      }
      case '.mp4': {
        type = 'video/mp4';
        break;
      }
      case '.json': {
        type = 'text/json';
        break;
      }
      case '.xml': {
        type = 'text/xml';
        break;
      }
      default: {
        type = 'text/plain';
      }
    }

    const fileBlob = new Blob(
      [ fileArrayBuffer ],
      {type}
    );

    const file = new File(
      [fileBlob],
      fileName
    );

    let headers = {  };
    uploadHeaders.forEach((uploadHeader) => {
      headers[uploadHeader.key] = uploadHeader.value;
    });

    let formData = new FormData();
    formData.append('files', file);
    fetch(url, {
      method: 'POST',
      headers,
      body: formData
    }).then( (response) => {
      let blobPromise = response.blob();
      blobPromise.then((blobData) => {
        let reader = new FileReader();
        reader.addEventListener('loadend', function () {
          const dataBuffer = toBuffer(reader.result);
          if (!parseResponse) {
            resolve();
            return;
          }

          const fileStr : string = decoder.write(dataBuffer);
          const file : Object = JSON.parse(fileStr);
          resolve(file);
        });
        reader.readAsArrayBuffer(blobData);
      });
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
function httpUploadFileViaRequest(hostname: string, endpoint: string , filePath: string,
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
          // TODO - rewrite me as needed to parse the response
          // TODO - and return it
          console.log(body);
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

  if (rawFilesToCopy && rawFilesToCopy.file) {
    rawFilesToCopy.file.forEach(file => {
      const fileName = file.fileName;
      const hashValue = file.hashValue;
      const fileSize = file.fileSize;
      const filePath = file.filePath;

      // TODO - this needs straightening out
      // TODO - ?addToSyncSpec; groupName? copyToRootFolder?
      const fileToPublish = new FileToPublish(fileName, filePath, true, hashValue, fileSize);
      filesToCopy.push(fileToPublish);
    });
  }
  else {
    console.log('getFilesToCopy: no files to copy');
  }

  return filesToCopy;
}

