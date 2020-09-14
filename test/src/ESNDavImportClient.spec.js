import * as davImportApi from 'esn-api-client/src/api/dav-import';
import Client from 'esn-api-client/src/Client';
import { ESNDavImportClient } from '../../src';

jest.mock('esn-api-client/src/Client');

const davImportApiSpy = jest.spyOn(davImportApi, 'default');

describe('The ESNDavImportClient class', () => {
  describe('The constructor method', () => {
    test('should throw error if esnApiClient is not provided', () => {
      expect(() => new ESNDavImportClient({})).toThrow(/esnApiClient is required and must be an instance of Client/);
    });

    test('should throw error if esnApiClient is not an instance of Client', () => {
      const esnApiClient = new Date();

      expect(() => new ESNDavImportClient({ esnApiClient })).toThrow(/esnApiClient is required and must be an instance of Client/);
    });

    test('should throw error if the uploadFile method is not provided', () => {
      const esnApiClient = new Client();

      expect(() => new ESNDavImportClient({ esnApiClient })).toThrow(/uploadFile is required and must be a function/);
    });

    test('should throw error if the uploadFile is not a function', () => {
      const esnApiClient = new Client();
      const uploadFile = 'not a function';

      expect(() => new ESNDavImportClient({ esnApiClient, uploadFile })).toThrow(/uploadFile is required and must be a function/);
    });

    test('should set the instance properties correctly if esnApiClient and uploadFile are valid', () => {
      const esnApiClient = new Client();
      const uploadFile = () => {};

      const esnDavImportClient = new ESNDavImportClient({ esnApiClient, uploadFile });

      expect(esnDavImportClient.uploadFile).toBe(uploadFile);
      expect(davImportApiSpy.mock.calls[0][0]).toBe(esnApiClient);
    });
  });

  describe('The importFromFile method', () => {
    test('should reject if failed to upload file', done => {
      const errorMessage = 'something wrong';
      const esnApiClient = new Client();
      const uploadFile = jest.fn().mockResolvedValue(Promise.reject(new Error(errorMessage)));
      const esnDavImportClient = new ESNDavImportClient({ esnApiClient, uploadFile });
      const file = { foo: 'bar' };
      const target = '/target/path';

      esnDavImportClient.davImportApi = {
        importFromFile: jest.fn()
      };

      esnDavImportClient.importFromFile(file, target)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).toEqual(errorMessage);
          expect(uploadFile).toHaveBeenCalledWith(file);
          expect(esnDavImportClient.davImportApi.importFromFile).not.toHaveBeenCalled;
          done();
        });
    });

    test('should reject if failed to import from file', done => {
      const errorMessage = 'something wrong';
      const fileId = 'fileId';
      const esnApiClient = new Client();
      const uploadFile = jest.fn().mockResolvedValue(Promise.resolve(fileId));
      const esnDavImportClient = new ESNDavImportClient({ esnApiClient, uploadFile });
      const file = { foo: 'bar' };
      const target = '/target/path';

      esnDavImportClient.davImportApi = {
        importFromFile: jest.fn().mockResolvedValue(Promise.reject(new Error(errorMessage)))
      };

      esnDavImportClient.importFromFile(file, target)
        .then(() => done(new Error('should not resolve')))
        .catch(err => {
          expect(err.message).toEqual(errorMessage);
          expect(uploadFile).toHaveBeenCalledWith(file);
          expect(esnDavImportClient.davImportApi.importFromFile).toHaveBeenCalledWith(fileId, target);
          done();
        });
    });

    test('should call the davImportClient with correct params to import from file', done => {
      const fileId = 'fileId';
      const esnApiClient = new Client();
      const uploadFile = jest.fn().mockResolvedValue(Promise.resolve(fileId));
      const esnDavImportClient = new ESNDavImportClient({ esnApiClient, uploadFile });
      const file = { foo: 'bar' };
      const target = '/target/path';

      esnDavImportClient.davImportApi = {
        importFromFile: jest.fn().mockResolvedValue(Promise.resolve())
      };

      esnDavImportClient.importFromFile(file, target)
        .then(() => {
          expect(uploadFile).toHaveBeenCalledWith(file);
          expect(esnDavImportClient.davImportApi.importFromFile).toHaveBeenCalledWith(fileId, target);
          done();
        })
        .catch(err => done(err || new Error('should resolve')));
    });
  });
});
