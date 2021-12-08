const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
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

  async deleteReplyByIdHandler(request, h) {
    const headerAuthorization = request.headers.authorization;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute(request.params, headerAuthorization);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = RepliesHandler;
