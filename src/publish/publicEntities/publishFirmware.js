/* @flow */

// 'http://bsnm.s3.amazonaws.com/public/FirmwareCompatibilityFile.xml'

export default class PublishFirmware   {

  static firmwareUpdateSourceEnum = {
    production : 'production',
    beta : 'beta',
    specific : 'specific',
    compatible: 'compatible',
    none: 'none',
    existing: 'existing'
  };

  static firmwareUpdateTypeEnum = {
    standard : 'standard',
    different : 'different',
    newer : 'newer',
    save: 'save'
  };

  firmwareUpdateSource : ?string;
  firmwareUpdateSourceFilePath : string;
  firmwareUpdateStandardTargetFileName : string;
  firmwareUpdateDifferentTargetFileName : string;
  firmwareUpdateNewerTargetFileName : string;
  firmwareUpdateSaveTargetFileName : string;
  firmwareUpdateVersion : string;
  productionReleaseURL : string;
  betaReleaseURL : string;
  compatibleReleaseURL : string;
  productionVersion : string;
  betaVersion : string;
  compatibleVersion : string;
  productionReleaseSHA1 : string;
  betaReleaseSHA1 : string;
  compatibleReleaseSHA1 : string;
  productionReleaseFileLength : number;
  betaReleaseFileLength : number;
  compatibleReleaseFileLength : number;
  existingFWContentID : string;

  constructor() {
    this.firmwareUpdateSource = null;
    this.firmwareUpdateSourceFilePath = '';
    this.firmwareUpdateStandardTargetFileName = '';
    this.firmwareUpdateDifferentTargetFileName = '';
    this.firmwareUpdateNewerTargetFileName = '';
    this.firmwareUpdateSaveTargetFileName = '';
    this.firmwareUpdateVersion = '';
    this.productionReleaseURL = '';
    this.betaReleaseURL = '';
    this.compatibleReleaseURL = '';
    this.productionVersion = '';
    this.betaVersion = '';
    this.compatibleVersion = '';
    this.productionReleaseSHA1 = '';
    this.betaReleaseSHA1 = '';
    this.compatibleReleaseSHA1 = '';
    this.productionReleaseFileLength = -1;
    this.betaReleaseFileLength = -1;
    this.compatibleReleaseFileLength = -1;
    this.existingFWContentID = '';

  }

  initializeUpdateSource(networkedFW: boolean) {
    if (networkedFW)
    {
      debugger;
      this.firmwareUpdateSource = PublishFirmware.firmwareUpdateSourceEnum.existing;
    }
  }

  getFirmwareUpdateTargetFileName(firmwareUpdateType: string): string {
    switch (firmwareUpdateType)
    {
      case PublishFirmware.firmwareUpdateTypeEnum.different:
        return this.firmwareUpdateDifferentTargetFileName;
      case PublishFirmware.firmwareUpdateTypeEnum.newer:
        return this.firmwareUpdateNewerTargetFileName;
      case PublishFirmware.firmwareUpdateTypeEnum.save:
        return this.firmwareUpdateSaveTargetFileName;
      case PublishFirmware.firmwareUpdateTypeEnum.standard:
      default:
        return this.firmwareUpdateStandardTargetFileName;
    }
  }

  getFirmwareFileName(firmwareUpdateType: string) : string {

    switch (firmwareUpdateType)
    {
      case PublishFirmware.firmwareUpdateTypeEnum.different:
        return this.firmwareUpdateDifferentTargetFileName;
      case PublishFirmware.firmwareUpdateTypeEnum.newer:
        return this.firmwareUpdateNewerTargetFileName;
      case PublishFirmware.firmwareUpdateTypeEnum.save:
        return this.firmwareUpdateSaveTargetFileName;
      case PublishFirmware.firmwareUpdateTypeEnum.standard:
      default:
        return this.firmwareUpdateStandardTargetFileName;
    }
  }

  getFirmwareSourceUrl() : string {

    switch (this.firmwareUpdateSource) {
      case PublishFirmware.firmwareUpdateSourceEnum.production:
      default: {
        return this.productionReleaseURL;
      }
      case PublishFirmware.firmwareUpdateSourceEnum.beta: {
        return this.betaReleaseURL;
      }
      case PublishFirmware.firmwareUpdateSourceEnum.specific: {
        return this.firmwareUpdateSourceFilePath;
      }
      case PublishFirmware.firmwareUpdateSourceEnum.compatible: {
        return this.compatibleReleaseURL;
      }
    }
  }
}
