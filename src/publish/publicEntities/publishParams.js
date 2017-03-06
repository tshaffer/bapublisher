/* @flow */

import PublishFirmware from './publishFirmware';
import ScheduledPresentation from './scheduledPresentation';

export default class PublishParams   {

  type: string;
  scheduledPresentations: Array<ScheduledPresentation>;
  targetFolder: string;

  enableLogging: boolean;
  limitStorageSpace: boolean;
  enableSerialDebugging: boolean;
  enableSystemDebugging: boolean;
  obfuscatedPassphrase: string;
  usbUpdatePassword: string;

  fwUpdateType: string;
  fwPublishData: { [family:string]: PublishFirmware };

  tmpDir: string;

  constructor() {
  }
}



