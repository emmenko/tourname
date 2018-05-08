module.exports = async (parent, args, context, info) => {
  const orgs = await context.db.query.organizations(
    {
      where: {
        AND: [
          { key: args.key },
          { memberRefs_some: { auth0Id: context.userId } },
        ],
      },
      first: 1,
    },
    info
  );
  if (orgs && orgs.length > 0) return orgs[0];
  // TODO: return proper status code
  throw new Error(`Organization with key "${args.key}" not found`);
};
