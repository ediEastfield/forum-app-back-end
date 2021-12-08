const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const headerAuthorization = 'Bearer accessToken';

    const expectedDeletedReply = {
      id: 'reply-123',
    };

    const accessToken = 'accessToken';

    /** creating dependencied for use case */
    const mockReplyRepository = new ReplyRepository();
    const mockAuthentcationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockReplyRepository.checkReplyIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockAuthentcationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthentcationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthentcationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'user-123', username: 'dicoding' }));

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthentcationTokenManager,
    });

    // Action
    await deleteReplyUseCase.execute(
      useCaseParams,
      headerAuthorization,
    );

    // Assert
    expect(mockAuthentcationTokenManager.getTokenFromHeader).toBeCalledWith(headerAuthorization);
    expect(mockAuthentcationTokenManager.verifyAccessToken()).resolves.toBeUndefined();
    expect(mockAuthentcationTokenManager.decodePayload).toBeCalledWith(accessToken);

    expect(mockReplyRepository.checkReplyIsExist).toBeCalledWith({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
      replyId: useCaseParams.replyId,
    });
    expect(mockReplyRepository.verifyReplyAccess).toBeCalledWith({
      ownerId: 'user-123',
      replyId: useCaseParams.replyId,
    });
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(expectedDeletedReply.id);
  });
});
