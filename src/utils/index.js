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
  likeCount: 0,
});

const mapReplyDBToModel = ({
  id,
  content,
  date,
  is_deleted,
  username,
  comment_id,
}) => ({
  id,
  content,
  date,
  isDeleted: is_deleted,
  username,
  commentId: comment_id,
});

module.exports = { mapCommentDBToModel, mapReplyDBToModel };
