const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  describe('addComment function', () => {
    it('should create new comment and return added comment correctly', async () => {
      // Arrange
      const fakeCommentIdGenerator = (x = 10) => '123';
      function fakeDateGenerator() {
        this.toISOString = () => '2021';
      }

      const newComment = new NewComment({
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, fakeCommentIdGenerator, fakeDateGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(addedComment.id);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: `comment-${fakeCommentIdGenerator()}`,
        content: 'sebuah komentar',
        owner: 'user-123',
      }));
      expect(comments).toBeDefined();
    });
  });
});
