import * as nodeWrappers from './nodeWrappers';
const path = require('path');
import moment from 'moment';

import { publishResources } from './resources';

import ScheduledPresentation from './publicEntities/scheduledPresentation';


export default function generateTmpFiles(
  _: Object,
  scheduledPresentations: Array<ScheduledPresentation>,
  tmpDir: string) {

  // autoplay: Object,
  // TODO - autoplay will be required for script plugins, parser plugins

  return new Promise( (resolve, reject) => {

    let publishAutoSchedulePromise = publishAutoSchedule(scheduledPresentations, tmpDir);
    let publishResourcesPromise = publishResources(tmpDir); // resourcesPath
    let publishAutoPluginScriptPromise = publishAutoPluginScript(tmpDir); // autopluginsPath

    // TODO - copy script plugin scripts to root folder

    // TODO - copy parser plugin scripts to root folder

    Promise.all([publishAutoSchedulePromise, publishResourcesPromise, publishAutoPluginScriptPromise])
      .then( (paths) => {
        resolve(paths);
      }).catch( (err) => {
        reject(err);
      });
  });
}

function publishAutoSchedule(scheduledPresentations: Array<ScheduledPresentation>, tmpDir: string) {

  return new Promise( (resolve, reject) => {

    // TODO - publish all scheduled presentations

    let scheduledPresentation = scheduledPresentations[0];

    let presentationToSchedule = {};
    presentationToSchedule.name = scheduledPresentation.presentationToSchedule.name;
    presentationToSchedule.fileName = scheduledPresentation.presentationToSchedule.fileName;
    presentationToSchedule.filePath = scheduledPresentation.presentationToSchedule.filePath;
    scheduledPresentation.presentationToSchedule = presentationToSchedule;

    // format dates properly
    let mDateTime = moment(scheduledPresentation.dateTime);
    scheduledPresentation.dateTime = mDateTime.format('YYYY-MM-DDTHH:mm:ss');

    mDateTime = moment(scheduledPresentation.recurrenceEndDate);
    scheduledPresentation.recurrenceEndDate = mDateTime.format('YYYY-MM-DDTHH:mm:ss');

    let autoschedule = {};
    autoschedule.scheduledPresentation = scheduledPresentation;

    const autoScheduleStr = JSON.stringify(autoschedule, null, '\t');
    const autoScheduleFilePath = path.join(tmpDir, 'autoschedule.json');
    nodeWrappers.writeFile(autoScheduleFilePath, autoScheduleStr).then( () => {
      resolve( { autoScheduleFilePath} );
    }).catch( (err) => {
      reject(err);
    });
  });
}

function publishAutoPluginScript(tmpDir: string) {
  return new Promise( (resolve, reject) => {
    const autopluginsPath = path.join(tmpDir, 'autoplugins.brs');
    let content =
      ' \'Do not edit this script - it is created programmatically and any changes you make ';
    content += 'will be overwritten the next time you publish a schedule.';

    nodeWrappers.writeFile(autopluginsPath, content).then( () => {
      resolve( { autopluginsPath } );
    }).catch( (err) => {
      reject(err);
    });
  });
}
