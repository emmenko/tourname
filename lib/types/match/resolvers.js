module.exports = {
  Match: {
    id: obj => obj._id,
    playerLeft: (obj, args, context) =>
      context.loaders.users.findOneCachedById(obj.playerLeftId),
    playerRight: (obj, args, context) =>
      context.loaders.users.findOneCachedById(obj.playerRightId),
    winner: (obj, args, context) =>
      context.loaders.users.findOneCachedById(obj.winnerId),
  },
};
