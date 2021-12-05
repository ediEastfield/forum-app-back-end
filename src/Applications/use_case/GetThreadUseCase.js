class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments = await this._commentRepository.getCommentByThreadId(threadId);
    detailThread.comments = this._checkIsDeletedComments(detailThread.comments);

    return detailThread;
  }

  _checkIsDeletedComments(comments) {
    for (let i = 0; i < comments.length; i++) {
      // eslint-disable-next-line no-param-reassign
      comments[i].content = comments[i].isDeleted ? '**komentar telah dihapus**' : comments[i].content;
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
