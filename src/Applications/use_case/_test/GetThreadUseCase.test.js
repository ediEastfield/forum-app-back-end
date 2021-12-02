const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrate the get thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'belajar back end',
      date: '2021',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCaseParams);

    // Assert
    expect(detailThread).toStrictEqual(new DetailThread({
      id: expectedDetailThread.id,
      title: expectedDetailThread.title,
      body: expectedDetailThread.body,
      date: expectedDetailThread.date,
      owner: expectedDetailThread.owner,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
  });
});
