module.exports = (parent, args, context) =>
  context.db.query.organizations({
    orderBy: 'name_ASC',
    where: {
      memberRefs_some: { auth0Id: context.auth0Id },
    },
  });
