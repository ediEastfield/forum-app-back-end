const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const headerAuthorization = request.headers.authorization;
    const addReplyUSeCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUSeCase.execute(
      request.payload,
      request.params,
      headerAuthorization,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = RepliesHandler;
