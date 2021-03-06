const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw when payload did notcontain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021',
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: {},
      content: [],
      isDeleted: 'false',
      replies: 'replies',
      likeCount: true,
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should show detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021',
      content: 'belajar back end',
      isDeleted: false,
      replies: [],
      likeCount: 1,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.isDeleted).toEqual(payload.isDeleted);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.likeCount).toEqual(payload.likeCount);
  });
});
