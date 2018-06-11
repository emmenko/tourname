module.exports = (parent, args, context) =>
  // Active auth0Id is implicit in `context`
  context.loaders.users.load(context.auth0Id);
