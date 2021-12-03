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
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
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

  describe('checkCommentIsExist function', () => {
    it('should resolve if comment exists', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(commentRepositoryPostgres.checkCommentIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
      })).resolves.not.toThrowError();
    });

    it('should reject if comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(commentRepositoryPostgres.checkCommentIsExist({
        threadId: 'thread-123',
        commentId: 'comment-456',
      })).rejects.toThrowError('komentar yang anda cari tidak ditemukan');
    });

    it('should reject if comment is already deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'commet-123',
        isDeleted: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(commentRepositoryPostgres.checkCommentIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
      })).rejects.toThrowError('komentar yang anda cari tidak ditemukan');
    });
  });

  describe('verifyCommentAccess', () => {
    it('should not throw error if user has authorization', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({
        commentId: 'comment-123',
        ownerId: 'user-123',
      })).resolves.toBeUndefined();
    });

    it('should throw error if user has no authorization', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({
        threadId: 'thread-123',
        owner: 'user-456',
      })).rejects.toThrowError('gagal karena anda tidak memiliki akses ke aksi ini');
    });
  });

  describe('deleteCommentById', () => {
    it('should be able to delete comment by id', async () => {
      // Arrange
      const addedComment = {
        id: 'comment-123',
        threadId: 'thread-123',
      };

      await CommentsTableTestHelper.addComment({
        id: addedComment.id,
        threadId: addedComment.threadId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action
      await commentRepositoryPostgres.deleteCommentById(addedComment.id);
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');

      // Assert
      expect(comment.is_deleted).toEqual(true);
    });

    it('should throw error when comment that want to be deleted does not exist', async () => {
      // Arrange
      const addedComment = 'comment-123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(commentRepositoryPostgres.deleteCommentById(addedComment.id))
        .rejects.toThrowError('tidak bisa menghapus komentar karena komentar tidak ada');
    });
  });
});
