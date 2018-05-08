module.exports = (parent, args, context, info) =>
  context.db.query.tournaments(
    {
      first: args.perPage,
      skip: args.page > 0 ? (args.page - 1) * args.perPage : 0,
      orderBy: args.orderBy,
      where: {
        organization: { key: parent.key },
        status_in: args.status,
      },
    },
    info
  );
