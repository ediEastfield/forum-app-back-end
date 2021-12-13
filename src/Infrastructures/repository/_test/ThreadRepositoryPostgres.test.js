const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should create new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const fakeThreadIdGenerator = (x = 10) => '123';
      function fakeDateGenerator() {
        this.toISOString = () => '2021';
      }

      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'belajar back end',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool, fakeThreadIdGenerator, fakeDateGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(addedThread.id);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: `thread-${fakeThreadIdGenerator()}`,
        title: 'sebuah thread',
        owner: 'user-123',
      }));
      expect(threads).toBeDefined();
    });
  });

  describe('getThreadById function', () => {
    it('should return NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      // Action and Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-x'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return thread when is found', async () => {
      // Arrange
      const newThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'belajar back end',
        date: '2021',
        username: 'dicoding',
      };

      const expectedThread = {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'belajar back end',
        date: '2021',
        username: 'dicoding',
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread(newThread);

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(getThread).toStrictEqual(expectedThread);
    });
  });
});
