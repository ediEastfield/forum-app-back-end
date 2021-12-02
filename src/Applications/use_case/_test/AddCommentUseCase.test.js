const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah komentar',
    };

    const useCaseParams = {
      threadId: 'thread-123',
    };

    const headerAuthorization = 'accessToken';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-123',
    });

    const accessToken = 'accessToken';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(
        expectedAddedComment,
      ));

    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: expectedAddedComment.owner }));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload,
      useCaseParams,
      headerAuthorization,
    );

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: expectedAddedComment.id,
      content: expectedAddedComment.content,
      owner: expectedAddedComment.owner,
    }));
    expect(mockAuthenticationTokenManager.getTokenFromHeader).toBeCalledWith(headerAuthorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken()).resolves.toBeUndefined();
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockCommentRepository.addComment).toBeCalledWith(new NewComment({
      content: useCasePayload.content,
      threadId: useCaseParams.threadId,
      owner: expectedAddedComment.owner,
    }));
  });
});
