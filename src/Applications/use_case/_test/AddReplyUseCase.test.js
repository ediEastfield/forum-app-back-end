const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/comments/entities/AddedComment');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestring the add reply action corerctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const headerAuthorization = 'accessToken';

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    });

    const accessToken = 'accessToken';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking neededfunction */
    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(
        expectedAddedReply,
      ));

    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: expectedAddedReply.owner }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      useCaseParams,
      headerAuthorization,
    );

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: expectedAddedReply.id,
      content: expectedAddedReply.content,
      owner: expectedAddedReply.owner,
    }));
    expect(mockAuthenticationTokenManager.getTokenFromHeader).toBeCalledWith(headerAuthorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken()).resolves.toBeUndefined();
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);

    expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
    });

    expect(mockReplyRepository.addReply).toBeCalledWith(new NewReply({
      content: useCasePayload.content,
      commentId: useCaseParams.commentId,
      owner: expectedAddedReply.owner,

    }));
  });
});
