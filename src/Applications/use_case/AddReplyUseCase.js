const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ commentRepository, replyRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseParams, headerAuthorization) {
    const { threadId, commentId } = useCaseParams;
    const accessToken = await this._authenticationTokenManager
      .getTokenFromHeader(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
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
