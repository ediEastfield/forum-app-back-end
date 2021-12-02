class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    return detailThread;
  }
}

module.exports = GetThreadUseCase;
