/* @flow */

const path = require('path');
const fs = require('fs-extra');

import LocalizationResources from './entities/localizationResources';

export function publishResources(publishFolder: string) {

  return new Promise( (resolve, reject) => {
    const localizationResources = new LocalizationResources();
    const localizationResourcesDictionary = localizationResources.getLocalizationResourcesDictionary();

    const resourcesPath = path.join(publishFolder, 'resources.txt');

    try {
      let ws = fs.createWriteStream(resourcesPath);

      ws.write('[CLOCK_DATE_FORMAT]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          const localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' + localizationResources.dateFormat + '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_TIME_FORMAT]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' + localizationResources.timeFormat + '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_TIME_AM]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' + localizationResources.AMFormat + '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_TIME_PM]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' + localizationResources.PMFormat + '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_DATE_SHORT_MONTH]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' +
            localizationResources.JanShort + '|' +
            localizationResources.FebShort + '|' +
            localizationResources.MarShort + '|' +
            localizationResources.AprShort + '|' +
            localizationResources.MayShort + '|' +
            localizationResources.JunShort + '|' +
            localizationResources.JulShort + '|' +
            localizationResources.AugShort + '|' +
            localizationResources.SepShort + '|' +
            localizationResources.OctShort + '|' +
            localizationResources.NovShort + '|' +
            localizationResources.DecShort +
            '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_DATE_LONG_MONTH]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' +
            localizationResources.JanLong + '|' +
            localizationResources.FebLong + '|' +
            localizationResources.MarLong + '|' +
            localizationResources.AprLong + '|' +
            localizationResources.MayLong + '|' +
            localizationResources.JunLong + '|' +
            localizationResources.JulLong + '|' +
            localizationResources.AugLong + '|' +
            localizationResources.SepLong + '|' +
            localizationResources.OctLong + '|' +
            localizationResources.NovLong + '|' +
            localizationResources.DecLong +
            '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_DATE_SHORT_DAY]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' +
            localizationResources.SunShort + '|' +
            localizationResources.MonShort + '|' +
            localizationResources.TueShort + '|' +
            localizationResources.WedShort + '|' +
            localizationResources.ThuShort + '|' +
            localizationResources.FriShort + '|' +
            localizationResources.SatShort +
            '\"');
          ws.write('\n');
        }
      }
      ws.write('\n');

      ws.write('[CLOCK_DATE_LONG_DAY]');
      ws.write('\n');

      for (let language in localizationResourcesDictionary)
      {
        if (localizationResourcesDictionary.hasOwnProperty(language)) {
          let localizationResources = localizationResourcesDictionary[language];
          ws.write(localizationResources.languageKey + ' \"' +
            localizationResources.SunLong + '|' +
            localizationResources.MonLong + '|' +
            localizationResources.TueLong + '|' +
            localizationResources.WedLong + '|' +
            localizationResources.ThuLong + '|' +
            localizationResources.FriLong + '|' +
            localizationResources.SatLong +
            '\"');
          ws.write('\n');
        }
      }

      ws.end();

      resolve( { resourcesPath } );

    }
    catch (err) {
      reject(err);
    }
  });
}
