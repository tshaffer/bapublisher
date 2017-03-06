/* @flow */

const crypto = require('crypto');
const fs = require('fs-extra');

import FileInfo from './entities/fileInfo';
import * as nodeWrappers from './nodeWrappers';

export function getFileInfo(filePath: string) {

  let fileSize = 0;

  return new Promise((resolve, _) => {
    const hash = crypto.createHash('sha1');
    const input = fs.createReadStream(filePath);
    input.on('readable', () => {
      var data = input.read();
      if (data) {
        hash.update(data);
        fileSize += data.length;
      }
      else {
        const sha1 = hash.digest('hex');
        resolve( new FileInfo(sha1, fileSize));
      }
    });
    // TODO - check for error
  });
}

export function getFileSizeInBytes(filePath: string) {
  return new Promise( (resolve, reject) => {
    nodeWrappers.stat(filePath).then( (stats) => {
      resolve(stats.size);
    }).catch( (err) => {
      reject(err);
    });
  });
}


export function downloadViaFetch(url: string, destinationFilePath: string) {
  return new Promise( (resolve, reject) => {
    fetch(url)
      .then( (response) => {
        let blobPromise = response.blob();
        blobPromise.then( (blobData) => {
          let reader = new FileReader();
          reader.addEventListener('loadend', function() {
            const buf = toBuffer(reader.result);
            nodeWrappers.writeFile(destinationFilePath, buf).then( () => {
              resolve();
            }).catch( (err) => {
              reject(err);
            });
          });
          reader.readAsArrayBuffer(blobData);
        });
      }).catch( (err) => {
        reject(err);
      });
  });
}

// From ArrayBuffer to Buffer
function toBuffer(ab) {
  let buf = new Buffer(ab.byteLength);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

// convert ArrayBuffer to Blob
// var dataView = new DataView(arrayBuffer);
// var blob = new Blob([dataView], { type: mimeString });

// From Buffer to ArrayBuffer
// function toArrayBuffer(buf) {
//   var ab = new ArrayBuffer(buf.length);
//   var view = new Uint8Array(ab);
//   for (var i = 0; i < buf.length; ++i) {
//     view[i] = buf[i];
//   }
//   return ab;
// }

// // download file when using node streams rather than fetch
// //
// download(url, destinationFilePath, cb) {
//   let file = fs.createWriteStream(destinationFilePath);
//   let request = http.get(url, function (response) {
//     response.pipe(file);
//     file.on('finish', () => {
//       file.close(cb);  // close() is async, call cb after close completes.
//     });
//   }).on('error', function (err) { // Handle errors
//     fs.unlink(destinationFilePath); // Delete the file async. (But we don't check the result)
//     if (cb) cb(err.message);
//   });
// }
//
// completeDownload(err) {
//   if (err) {
//     console.log('completeDownload error: ', err);
//   }
//   else {
//     console.log('fw download completed successfully');
//   }
// }
