class DeleteCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseParams, headerAuthorization) {
    const { threadId, commentId } = useCaseParams;
    const accessToken = await this._authenticationTokenManager
      .getTokenFromHeader(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: ownerId } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._commentRepository.checkCommentIsExist({ threadId, commentId });
    await this._commentRepository.verifyCommentAccess({ ownerId, commentId });
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
