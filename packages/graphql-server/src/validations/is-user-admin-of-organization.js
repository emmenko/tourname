module.exports = async (args, context) => {
  // Check that the user has access to the given organization
  // and is an Admin
  const organizationResults = await context.db.query.organizations({
    where: {
      AND: [
        { key: args.organizationKey },
        {
          memberRefs_some: {
            AND: [{ auth0Id: context.userId }, { role: 'Admin' }],
          },
        },
      ],
    },
  });

  if (!organizationResults || organizationResults.length === 0)
    // TODO: return proper status code
    throw new Error(
      `The organization with key "${
        args.organizationKey
      }" is either not found or you are not an Admin of this organization. In case you are part of the organization, remember that only admin members can perform those actions.`
    );
};
