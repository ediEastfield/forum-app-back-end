const NewLike = require('../../Domains/likes/entities/NewLike');

class AddLikeUseCase {
  constructor({ commentRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams, owner) {
    const { threadId, commentId } = useCaseParams;
    await this._commentRepository.checkCommentIsExist({ threadId, commentId });

    const newLike = new NewLike({
      commentId,
      owner,
    });

    if (await this._likeRepository.checkLikeIsExist(newLike)) {
      await this._likeRepository.deleteLikeByCommentIdAndOwner(newLike);
    } else {
      await this._likeRepository.addLike(newLike);
    }
  }
}

module.exports = AddLikeUseCase;
