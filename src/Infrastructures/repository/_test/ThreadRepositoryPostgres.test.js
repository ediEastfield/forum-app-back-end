const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { findThreadsById } = require('../../../../tests/ThreadsTableTestHelper');

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
});
