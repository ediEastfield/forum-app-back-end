const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addComment(newComment) {
    const {
      content, threadId, owner,
    } = newComment;
    const id = `comment-${this._idGenerator(10)}`;
    const date = new this._dateGenerator().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }
}

module.exports = CommentRepositoryPostgres;
