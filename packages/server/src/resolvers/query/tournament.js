module.exports = async (parent, args, context, info) => {
  const tournaments = await context.db.query.tournaments(
    {
      where: {
        AND: [{ id: args.id }, { organization: { key: args.organizationKey } }],
      },
      first: 1,
    },
    info
  );
  if (tournaments.length === 0) return null;

  return tournaments[0];
};
