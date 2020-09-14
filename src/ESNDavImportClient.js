import Client from 'esn-api-client/src/Client';
import davImportApi from 'esn-api-client/src/api/dav-import';

export default class ESNDavImportClient {
  /**
   * @constructor
   * @param {Object} options An options object that contains:
   * @param {Function} options.esnApiClient the instance of Client to communicate with ESN's Backend APIs
   * @param {Function} options.uploadFile the function to upload file
   */
  constructor({ esnApiClient, uploadFile }) {
    if (!(esnApiClient instanceof Client)) {
      throw new Error('esnApiClient is required and must be an instance of Client');
    }

    if (typeof uploadFile !== 'function') {
      throw new Error('uploadFile is required and must be a function');
    }

    this.uploadFile = uploadFile;
    this.davImportApi = davImportApi(esnApiClient);
  }

  importFromFile(file, target) {
    return this.uploadFile(file)
      .then(fileId => this.davImportApi.importFromFile(fileId, target));
  }
}
