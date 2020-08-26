import { ESNDavImportClient } from '../../src';

const OPENPAAS_URL = 'http://esn';

describe('The ESNDavImportClient class', () => {
  describe('The constructor method', () => {
    test('should throw error if the uploadFile method is not provided', () => {
      expect(() => new ESNDavImportClient()).toThrow(/uploadFile is required and must be a function/);
    });

    test('should throw error if the uploadFile is not a function', () => {
      const uploadFile = 'not a function';

      expect(() => new ESNDavImportClient(uploadFile)).toThrow(/uploadFile is required and must be a function/);
    });

    test('should throw error if the OPENPAAS_URL is not provided', () => {
      const uploadFile = () => {};

      expect(() => new ESNDavImportClient(uploadFile)).toThrow(/OPENPAAS_URL is required/);
    });
  });

  describe('The importFromFile method', () => {
    test('should reject if failed to upload file', done => {
      const errorMessage = 'something wrong';
      const uploadFile = jest.fn().mockResolvedValue(Promise.reject(new Error(errorMessage)));
      const esnDavImportClient = new ESNDavImportClient(uploadFile, OPENPAAS_URL);
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
      const uploadFile = jest.fn().mockResolvedValue(Promise.resolve(fileId));
      const esnDavImportClient = new ESNDavImportClient(uploadFile, OPENPAAS_URL);
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
      const uploadFile = jest.fn().mockResolvedValue(Promise.resolve(fileId));
      const esnDavImportClient = new ESNDavImportClient(uploadFile, OPENPAAS_URL);
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
