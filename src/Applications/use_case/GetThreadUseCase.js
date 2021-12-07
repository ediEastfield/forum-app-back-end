class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments = await this._commentRepository.getCommentByThreadId(threadId);
    const repliesComments = await this._commentRepository.getRepliesCommentByThreadId(threadId);

    detailThread.comments = this._checkIsDeletedComments(detailThread.comments);
    detailThread.comments = this._getRepliesComments(detailThread.comments, repliesComments);

    console.log(repliesComments);
    return detailThread;
  }

  _checkIsDeletedComments(comments) {
    for (let i = 0; i < comments.length; i++) {
      // eslint-disable-next-line no-param-reassign
      comments[i].content = comments[i].isDeleted ? '**komentar telah dihapus**' : comments[i].content;
    }
    return comments;
  }

  _getRepliesComments(comments, repliesComments) {
    for (let i = 0; i < comments.length; i++) {
      const commentId = comments[i].id;
      // eslint-disable-next-line no-param-reassign
      comments[i].replies = repliesComments.filter((reply) => reply.commentId === commentId);
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
