const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrate the get thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'belajar back end',
      date: '2021',
      username: 'dicoding',
      comments: [],
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2021',
        content: 'sebuah komentar A',
        isDeleted: false,
        replies: [],
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'dicoding',
        date: '2021',
        content: 'sebuah komentar B',
        isDeleted: false,
        replies: [],
      }),
    ];

    const expectedReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        username: 'dicoding',
        date: '2021',
        content: 'sebuah balasan',
        isDeleted: false,
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-456',
        username: 'dicoding',
        date: '2021',
        content: 'sebuah balasan',
        isDeleted: false,
      }),
    ];

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'belajar back end',
      date: '2021',
      username: 'dicoding',
      comments: [
        new DetailComment({
          id: 'comment-123',
          username: 'dicoding',
          date: '2021',
          content: 'sebuah komentar A',
          isDeleted: false,
          replies: [
            new DetailReply({
              id: 'reply-123',
              commentId: 'comment-123',
              username: 'dicoding',
              date: '2021',
              content: 'sebuah balasan',
              isDeleted: false,
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'dicoding',
          date: '2021',
          content: 'sebuah komentar B',
          isDeleted: false,
          replies: [
            new DetailReply({
              id: 'reply-456',
              commentId: 'comment-456',
              username: 'dicoding',
              date: '2021',
              content: 'sebuah balasan',
              isDeleted: false,
            }),
          ],
        }),
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockCommentRepository.getRepliesCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCaseParams);

    // Assert
    expect(detailThread).toEqual(new DetailThread({
      ...expectedDetailThread,
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getRepliesCommentByThreadId)
      .toBeCalledWith(useCaseParams.threadId);
  });
});
