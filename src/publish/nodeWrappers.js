/* @flow */

const fs = require('fs-extra');
const http = require('http');
const readDir = require('recursive-readdir');

export function getFiles(dir: string) : Object {
  return new Promise( (resolve, reject) => {

    readDir(dir, (err, files) => {

      if (err) {
        reject(err);
        return;
      }

      resolve(files);
    });
  });
}


export function mkdir(dirPath: string, ignoreAlreadyExists: boolean = true) {
  return new Promise( (resolve, reject) => {
    fs.mkdir(dirPath, (err) => {
      if (!err || (err.code === 'EEXIST' && ignoreAlreadyExists)) {
        resolve();
      }
      else {
        reject(err);
      }
    });
  });
}

export function remove(filePath: string) {
  return new Promise( (resolve, reject) => {
    fs.remove(filePath, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

export function writeFile(filePath: string, data: string) {
  return new Promise( (resolve, reject) => {
    fs.writeFile( filePath, data, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

export function stat(filePath: string) {
  return new Promise((resolve, reject) => {

    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(stats);
      }
    });
  });
}

export function httpGet(url : string) {
  return new Promise( (resolve, reject) => {
    http.get(url, (res) => {

      // consume response body
      res.resume();

      const statusCode = res.statusCode;
      if (statusCode !== 200) {
        reject(res);
      }
      resolve(res);

    }).on('error', (err) => {
      console.log(`httpGet error: ${err.message}`);
      reject(err);
    });
  });
}


export function copy(src: string, dest: string, options: Object) {
  return new Promise( (resolve, reject) => {
    fs.copy(src, dest, options, function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

export function overwriteFile(src: string, dest: string) {
  return copy(src, dest, { replace: true });
}

export function exists(path: string) {
  return new Promise( (resolve, reject) => {
    fs.access(path, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (!err) {
        resolve(true);
      }
      else if (err.code === 'ENOENT') {
        resolve(false);
      }
      else {
        reject(err);
      }
    });
  });
}