module.exports = {
  Match: {
    id: obj => obj._id,
    playerLeft: (obj, args, context) =>
      context.db.collection('users').findOne({ _id: obj.playerLeftId }),
    playerRight: (obj, args, context) =>
      context.db.collection('users').findOne({ _id: obj.playerRightId }),
    winner: (obj, args, context) =>
      context.db.collection('users').findOne({ _id: obj.winnerId }),
  },
};
