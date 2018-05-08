module.exports = (parent, args, context) =>
  // Active userId is implicit in `context`
  context.loaders.users.load(context.userId);
