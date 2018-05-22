module.exports = async (parent, args, context) => {
  // NOTE: using `context.db.exists.Organization({ key: args.key })`
  // does not work as the internal query `organizations` requires
  // a sub selection.
  //   `Error: Field 'organizations' of type 'Organization' must have a sub selection. (line 2, column 3))`
  const org = await context.db.query.organization(
    { where: { key: args.key } },
    '{ key }'
  );
  return Boolean(org);
};
