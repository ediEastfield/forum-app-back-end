const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, useCaseParams, owner) {
    const { threadId, commentId } = useCaseParams;
    await this._commentRepository.checkCommentIsExist({ threadId, commentId });

    const newReply = new NewReply({
      ...useCasePayload,
      commentId,
      owner,
    });

    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
