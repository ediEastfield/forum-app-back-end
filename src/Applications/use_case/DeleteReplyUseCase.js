class DeleteReplyUseCase {
  constructor({ replyRepository, authenticationTokenManager }) {
    this._replyRepository = replyRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParams, headerAuthorization) {
    const { threadId, commentId, replyId } = useCaseParams;
    const accessToken = await this._authenticationTokenManager
      .getTokenFromHeader(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: ownerId } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._replyRepository.checkReplyIsExist({ threadId, commentId, replyId });
    await this._replyRepository.verifyReplyAccess({ ownerId, replyId });
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
