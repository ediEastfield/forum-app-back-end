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
});

module.exports = { mapCommentDBToModel };
