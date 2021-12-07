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
});
