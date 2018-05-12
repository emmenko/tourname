module.exports = (parent, args, context, info) =>
  context.db.query.matchSingles(
    {
      where: {
        AND: [
          { organization: { key: args.organizationKey } },
          { status: args.status },
        ],
      },
      orderBy: args.orderBy,
      first: args.perPage,
      skip: args.page > 0 ? (args.page - 1) * args.perPage : 0,
    },
    info
  );
