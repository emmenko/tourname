/**
 * Args:
 * - key
 * - name
 */
module.exports = async (parent, args, context) => {
  const existingOrgForGivenKey = await context.db.query.organization({
    where: { key: args.key },
  });
  if (existingOrgForGivenKey)
    throw new Error(`An organization for key "${args.key}" already exist`);

  return context.db.mutation.createOrganization({
    data: {
      key: args.key,
      name: args.name,
      memberRefs: {
        create: [{ auth0Id: context.userId, role: 'Admin' }],
      },
    },
  });
};
