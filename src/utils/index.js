/* eslint-disable camelcase */

const mapCommentDBToModel = ({
  id,
  content,
  date,
  is_deleted,
  username,
}) => ({
  id,
  content,
  date,
  isDeleted: is_deleted,
  username,
  replies: [],
});

const mapReplyDBToModel = ({
  id,
  content,
  date,
  is_deleted,
  comment_id,
  username,
}) => ({
  id,
  content,
  date,
  isDeleted: is_deleted,
  commentId: comment_id,
  username,
});

module.exports = { mapCommentDBToModel, mapReplyDBToModel };
