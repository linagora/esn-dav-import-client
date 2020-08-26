import { davImportApi, Client } from 'esn-api-client/src';

export default class ESNDavImportClient {
  /**
   * @constructor
   * @param {Function} uploadFile the function to upload file
   * @param {String} OPENPAAS_URL the deployed URL for OpenPaaS server
   */
  constructor(uploadFile, OPENPAAS_URL) {
    if (typeof uploadFile !== 'function') {
      throw new Error('uploadFile is required and must be a function');
    }

    if (!OPENPAAS_URL) {
      throw new Error('OPENPAAS_URL is required');
    }

    this.uploadFile = uploadFile;

    const esnApiClient = new Client({ baseURL: `${OPENPAAS_URL}/linagora.esn.dav.import/api` });

    this.davImportApi = davImportApi(esnApiClient);
  }

  importFromFile(file, target) {
    return this.uploadFile(file)
      .then((fileId) => this.davImportApi.importFromFile(fileId, target));
  }
}
