const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewLike = require('../../../Domains/likes/entities/NewLike');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await LikesTableTestHelper.cleanTable();
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

  describe('addLike function', () => {
    it('should create new like', async () => {
      // Arrange
      const fakeLikeIdGenerator = (x = 10) => '123';

      const newLike = new NewLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool, fakeLikeIdGenerator,
      );

      // Action
      const addedLike = await likeRepositoryPostgres.addLike(newLike);

      // Assert
      const likes = await LikesTableTestHelper.getLikesByCommentIdAndOwner(newLike);
      expect(addedLike).toStrictEqual(({
        id: 'like-123',
      }));
      expect(likes).toStrictEqual({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
    });

    describe('checkLikeIsExist function', () => {
      it('should return true if like exists', async () => {
        // Arrange
        await LikesTableTestHelper.addLike({
          id: 'like-123',
          commentId: 'comment-123',
          owner: 'user-123',
        });

        const likeRepositoryPostgres = new LikeRepositoryPostgres(
          pool, {},
        );

        // Action
        const statusCheck = await likeRepositoryPostgres.checkLikeIsExist({ commentId: 'comment-123', owner: 'user-123' });

        // Assert
        expect(statusCheck).toEqual(true);
      });
      it('should return false if like exists', async () => {
        // Arrange
        const likeRepositoryPostgres = new LikeRepositoryPostgres(
          pool, {},
        );

        // Action
        const statusCheck = await likeRepositoryPostgres.checkLikeIsExist({ commentId: 'comment-123', owner: 'user-123' });

        // Assert
        expect(statusCheck).toEqual(false);
      });
    });

    describe('deleteLikeByCommentIdAndOwner', () => {
      it('should be able to delete if like exist', async () => {
        // Arrange
        const newLike = {
          id: 'like-123',
          commentId: 'comment-123',
          owner: 'user-123',
        };

        await LikesTableTestHelper.addLike({
          id: newLike.id,
          commentId: newLike.commentId,
          owner: newLike.owner,
        });

        const likeRepositoryPostgres = new LikeRepositoryPostgres(
          pool, {},
        );

        // Action and Assert
        await expect(likeRepositoryPostgres.deleteLikeByCommentIdAndOwner({
          commentId: newLike.commentId,
          owner: newLike.owner,
        })).resolves.not.toThrowError();
      });
      it('should be able to delete if like doesnt exist', async () => {
        // Arrange
        const likeRepositoryPostgres = new LikeRepositoryPostgres(
          pool, {},
        );

        // Action and Assert
        await expect(likeRepositoryPostgres.deleteLikeByCommentIdAndOwner({
          commentId: 'comment-123',
          owner: 'user-123',
        })).rejects.toThrowError('tidak bisa menghapus like karena tidak ada like');
      });
    });

    describe('getCountLikeByCommentId function', () => {
      it('getCountLikeByCommentId with like', async () => {
        // Arrange
        const newLike = {
          id: 'like-123',
          commentId: 'comment-123',
          owner: 'user-123',
        };

        await LikesTableTestHelper.addLike({
          id: newLike.id,
          commentId: newLike.commentId,
          owner: newLike.owner,
        });

        const likeRepositoryPostgres = new LikeRepositoryPostgres(
          pool, {},
        );

        // Action
        const countLike = await likeRepositoryPostgres.getCountLikeByCommentId(newLike.commentId);

        // Assert
        expect(countLike).toEqual(1);
      });
      it('getCountLikeByCommentId with non-like', async () => {
        // Arrange

        const likeRepositoryPostgres = new LikeRepositoryPostgres(
          pool, {},
        );

        // Action
        const countLike = await likeRepositoryPostgres.getCountLikeByCommentId('comment-456');

        // Assert
        expect(countLike).toEqual(0);
      });
    });
  });
});
