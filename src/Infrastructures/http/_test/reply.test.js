const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServersTestHelper = require('../../../../tests/ServersTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /replies', () => {
    it('should response 201 and presisted replies', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah balasan',
      };

      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });

    it('should response with 400 when payload not contain needed property', async () => {
      // Arrange
      const requestPayload = { };

      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should respond with 200 and return success status', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      await RepliesTableTestHelper.addReplies({ id: replyId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response with 403 when someone tries to delete reply that they dont own', async () => {
      // Arrange
      const server = await createServer(container);

      /** creating first user and their reply */
      const { accessToken: firstAccessToken, userId: firstUserId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server, username: 'dicoding' });
      const firstThreadId = 'thread-123';
      const firstCommentId = 'comment-123';
      const firstReplyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({ id: firstThreadId, owner: firstUserId });
      await CommentsTableTestHelper.addComment({ id: firstCommentId, owner: firstUserId });
      await RepliesTableTestHelper.addReplies({ id: firstReplyId, owner: firstUserId });

      /** creating second user */
      const { accessToken: secondAccessToken } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server, username: 'some_user' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${firstThreadId}/comments/${firstCommentId}/replies/${firstReplyId}`,
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
