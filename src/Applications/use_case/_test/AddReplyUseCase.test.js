const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/comments/entities/AddedComment');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
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

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking neededfunction */
    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(
        expectedAddedReply,
      ));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      useCaseParams,
      'user-123',
    );

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: expectedAddedReply.id,
      content: expectedAddedReply.content,
      owner: expectedAddedReply.owner,
    }));

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
