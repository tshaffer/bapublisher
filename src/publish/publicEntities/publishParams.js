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
  enableSystemLogDebugging: boolean;
  obfuscatedPassphrase: string;
  usbUpdatePassword: string;

  fwUpdateType: string;
  fwPublishData: { [family:string]: PublishFirmware };

  tmpDir: string;

  progressCallback: ?Function;
  lwsDeviceIPAddresses: Array<string>;
  syncSpecClientParams: Object;
  syncSpecServerParams: Object;
  simpleNetworkingUrl : string;

  constructor() {
  }
}



