const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServersTestHelper = require('../../../../tests/ServersTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /comments', () => {
    it('should response 201 and presisted comment', async () => {
      // Arrange
      const requsetPayload = {
        content: 'sebuah komentar',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requsetPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response with 400 when payload not contain needed property', async () => {
      // Arrange
      const requsetPayload = { };

      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requsetPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requsetPayload = {
        content: 123,
      };

      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requsetPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });
  });
});
