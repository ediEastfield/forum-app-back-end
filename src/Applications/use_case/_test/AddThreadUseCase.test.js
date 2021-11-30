const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'belajar back end',
    };

    const headerAuthorization = 'accessToken';

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    });

    const accessToken = 'accessToken';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(
        expectedAddedThread,
      ));

    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: expectedAddedThread.owner }));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, headerAuthorization);

    // Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: expectedAddedThread.id,
      title: expectedAddedThread.title,
      owner: expectedAddedThread.owner,
    }));
    expect(mockAuthenticationTokenManager.getTokenFromHeader).toBeCalledWith(headerAuthorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken()).resolves.toBeUndefined();
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: expectedAddedThread.owner,
    }));
  });
});
