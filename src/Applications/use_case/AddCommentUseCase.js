const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, useCaseParams, owner) {
    await this._threadRepository.getThreadById(useCaseParams.threadId);

    const newComment = new NewComment({
      ...useCasePayload,
      threadId: useCaseParams.threadId,
      owner,
    });
    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
