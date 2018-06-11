module.exports = async (parent, args, context, info) => {
  const members = await context.db.query.memberRefs(
    {
      where: {
        AND: [{ id: args.id }, { organization: { key: args.organizationKey } }],
      },
      first: 1,
    },
    info
  );
  if (members.length === 0) return null;

  const member = members[0];
  const userProfile = await context.loaders.users.load(member.auth0Id);
  return {
    // From Auth0
    auth0Id: userProfile.user_id,
    email: userProfile.email,
    name: userProfile.name,
    picture: userProfile.picture,
    // From DB
    id: member.id,
    role: member.role,
  };
};
