const NewLike = require('../../../Domains/likes/entities/NewLike');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestring the add like action when like doesnt exist', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userId = 'user-123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockLikeRepository.checkLikeIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCaseParams, userId);

    // Assert
    expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith(useCaseParams);
    expect(mockLikeRepository.addLike).toBeCalledWith(new NewLike({
      commentId: useCaseParams.commentId,
      owner: userId,
    }));
  });

  it('should orchestring the add like action when like does exist', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userId = 'user-123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockLikeRepository.checkLikeIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLikeByCommentIdAndOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addLikeUseCase = new AddLikeUseCase({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCaseParams, userId);

    // Assert
    expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith(useCaseParams);
    expect(mockLikeRepository.deleteLikeByCommentIdAndOwner).toBeCalledWith(new NewLike({
      commentId: useCaseParams.commentId,
      owner: userId,
    }));
  });
});
