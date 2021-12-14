const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ServersTestHelper = require('../../../../tests/ServersTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('/threads/{threadId}/comments/{commentId}/likes', () => {
    it('should respond with 200 and return success status when like', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should respond with 200 and return success status when unlike', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServersTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
