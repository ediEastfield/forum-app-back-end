const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const { mapCommentDBToModel } = require('../../utils');

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

  async checkCommentIsExist({ threadId, commentId }) {
    const query = {
      text: `SELECT 1
      FROM comments INNER JOIN threads
      ON comments.thread_id = threads.id
      WHERE threads.id = $1
      AND comments.id = $2`,
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread atau komentar yang anda cari tidak ditemukan');
    }
  }

  async verifyCommentAccess({ commentId, ownerId }) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('gagal karena anda tidak memiliki akses ke aksi ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('tidak bisa menghapus komentar karena komentar tidak ada');
    }
  }

  async getCommentByThreadId(id) {
    const query = {
      text: `SELECT comments.id, content, date, username, is_deleted
      FROM comments
      LEFT JOIN users
      ON users.id = comments.owner
      WHERE comments.thread_id = $1
      ORDER BY date ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapCommentDBToModel);
  }
}

module.exports = CommentRepositoryPostgres;
