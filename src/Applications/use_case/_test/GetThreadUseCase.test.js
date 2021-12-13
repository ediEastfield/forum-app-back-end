const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
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

    const {
      ...filterCommentA
    } = expectedComments[0];

    const {
      ...filterCommentB
    } = expectedComments[1];

    const {
      ...filterReplyA
    } = expectedReplies[0];

    const {
      ...filterReplyB
    } = expectedReplies[1];

    const expectedRepliesComment = [
      { ...filterCommentA, replies: [filterReplyA] },
      { ...filterCommentB, replies: [filterReplyB] },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));

    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockReplyRepository.getRepliesCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCaseParams);

    // Assert
    expect(detailThread).toEqual(new DetailThread({
      ...expectedDetailThread,
      comments: expectedRepliesComment,
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.getRepliesCommentByThreadId)
      .toBeCalledWith(useCaseParams.threadId);
  });

  it('_checkIsDeletedComments function', () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2021',
        content: 'sebuah komentar A',
        isDeleted: true,
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

    const {
      ...filterCommentA
    } = expectedComments[0];

    const {
      ...filterCommentB
    } = expectedComments[1];

    const spyCheckIsDeletedComments = jest.spyOn(getThreadUseCase, '_checkIsDeletedComments');

    // Action
    getThreadUseCase._checkIsDeletedComments(expectedComments);

    // Assert
    expect(spyCheckIsDeletedComments)
      .toReturnWith([
        { ...filterCommentA, content: '**komentar telah dihapus**' },
        filterCommentB,
      ]);

    spyCheckIsDeletedComments.mockClear();
  });

  it('_getRepliesComments function', () => {
    // Arrange
    const getThreadUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );

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
        isDeleted: true,
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

    const {
      ...filterCommentA
    } = expectedComments[0];

    const {
      ...filterCommentB
    } = expectedComments[1];

    const {
      ...filterReplyA
    } = expectedReplies[0];

    const {
      ...filterReplyB
    } = expectedReplies[1];

    const expectedRepliesComment = [
      { ...filterCommentA, replies: [{ ...filterReplyA, content: '**balasan telah dihapus**' }] },
      { ...filterCommentB, replies: [filterReplyB] },
    ];

    const spyGetRepliesComments = jest.spyOn(getThreadUseCase, '_getRepliesComments');

    // Action
    getThreadUseCase._getRepliesComments(expectedComments, expectedReplies);

    // Assert
    expect(spyGetRepliesComments)
      .toReturnWith(expectedRepliesComment);

    spyGetRepliesComments.mockClear();
  });
});
