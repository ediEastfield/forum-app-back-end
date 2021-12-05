const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseParams, headerAuthorization) {
    const accessToken = await this._authenticationTokenManager
      .getTokenFromHeader(headerAuthorization);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
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
