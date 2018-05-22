module.exports = (parent, args, context, info) =>
  context.db.query.tournaments(
    {
      where: {
        AND: [
          { organization: { key: args.organizationKey } },
          { status_in: args.status },
        ],
      },
      orderBy: args.orderBy,
      first: args.perPage,
      skip: args.page > 0 ? (args.page - 1) * args.perPage : 0,
    },
    info
  );
