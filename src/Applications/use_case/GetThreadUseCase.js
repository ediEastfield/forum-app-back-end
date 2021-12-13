class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments = await this._commentRepository.getCommentByThreadId(threadId);
    const repliesComments = await this._replyRepository.getRepliesCommentByThreadId(threadId);

    detailThread.comments = this._checkIsDeletedComments(detailThread.comments);
    detailThread.comments = this._getRepliesComments(detailThread.comments, repliesComments);

    return detailThread;
  }

  _checkIsDeletedComments(comments) {
    return comments.map((comment) => {
      if (comment.isDeleted) {
        // eslint-disable-next-line no-param-reassign
        comment.content = '**komentar telah dihapus**';
      }
      return comment;
    });
  }

  _getRepliesComments(comments, repliesComments) {
    // eslint-disable-next-line no-restricted-syntax
    for (const comment of comments) {
      // eslint-disable-next-line no-param-reassign
      comment.replies = repliesComments
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          // eslint-disable-next-line no-param-reassign
          reply.content = reply.isDeleted ? '**balasan telah dihapus**' : reply.content;
          return reply;
        });
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
