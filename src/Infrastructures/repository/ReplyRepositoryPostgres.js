const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addReply(newReply) {
    const {
      content, commentId, owner,
    } = newReply;

    const id = `reply-${this._idGenerator(10)}`;
    const date = new this._dateGenerator().toISOString();
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, date, owner, commentId],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async checkReplyIsExist({ threadId, commentId, replyId }) {
    const query = {
      text: `SELECT 1
      FROM replies
      INNER JOIN comments
      ON replies.comment_id = comments.id
      WHERE comments.thread_id = $1
      AND comments.id = $2
      AND replies.id = $3
      AND replies.is_deleted = false`,
      values: [threadId, commentId, replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('balasan yang anda cari tidak ditemukan');
    }
  }

  async verifyReplyAccess({ ownerId, replyId }) {
    const query = {
      text: `SELECT 1 
      FROM replies 
      WHERE id = $1 
      AND owner = $2`,
      values: [replyId, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('gagal karena anda tidak memiliki akses ke aksi ini');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('tidak bisa menghapus balasan karena balasan tidak ada');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
