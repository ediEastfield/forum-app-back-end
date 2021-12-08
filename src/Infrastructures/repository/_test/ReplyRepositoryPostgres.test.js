const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  describe('addReply function', () => {
    it('should create new reply and return added reply correctly', async () => {
      // Arrange
      const fakeReplyIdGenerator = (x = 10) => '123';
      function fakeDateGenerator() {
        this.toISOString = () => '2021';
      }

      const newReply = new NewReply({
        content: 'sebuah balasan',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, fakeReplyIdGenerator, fakeDateGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(addedReply.id);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: `reply-${fakeReplyIdGenerator()}`,
        content: 'sebuah balasan',
        owner: 'user-123',
      }));
      expect(replies).toBeDefined();
    });
  });

  describe('chechReplyIsExist function', () => {
    it('should resolve if reply exists', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({
        id: 'reply-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action and assert
      await expect(replyRepositoryPostgres.checkReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      })).resolves.not.toThrowError();
    });

    it('should reject if reply does not exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(replyRepositoryPostgres.checkReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-456',
      })).rejects.toThrowError('balasan yang anda cari tidak ditemukan');
    });

    it('should reject if reply is already deleted', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({
        id: 'reply-123',
        isDeleted: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(replyRepositoryPostgres.checkReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      })).rejects.toThrowError('balasan yang anda cari tidak ditemukan');
    });
  });

  describe('verifyReplyAccess', () => {
    it('should not throw error if user has authentication', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({
        ownerId: 'user-123',
        replyId: 'reply-123',
      })).resolves.toBeUndefined();
    });

    it('should throw error if user has no authentication', async () => {
      // Arrange
      await RepliesTableTestHelper.addReplies({
        id: 'relpy-456',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({
        owner: 'user-456',
        replyId: 'relpy-123',
      })).rejects.toThrowError('gagal karena anda tidak memiliki akses ke aksi ini');
    });
  });

  describe('deleteReplyById', () => {
    it('should be able to delete reply by id', async () => {
      // Arrange
      const addedReply = {
        id: 'reply-123',
        commentId: 'comment-123',
      };

      await RepliesTableTestHelper.addReplies({
        id: addedReply.id,
        commentId: addedReply.commentId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action
      await replyRepositoryPostgres.deleteReplyById(addedReply.id);
      const reply = await RepliesTableTestHelper.findRepliesById('reply-123');

      // Assert
      expect(reply.is_deleted).toEqual(true);
    });

    it('should throw error when reply that want to be deleted does not exist', async () => {
      // Arrange
      const addedReply = 'reply-123';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool, {}, {},
      );

      // Action and Assert
      await expect(replyRepositoryPostgres.deleteReplyById(addedReply))
        .rejects.toThrowError('tidak bisa menghapus balasan karena balasan tidak ada');
    });
  });
});
