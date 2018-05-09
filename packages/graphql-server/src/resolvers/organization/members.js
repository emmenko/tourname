module.exports = async (parent, args, context) => {
  const organizationKey = args.key || args.organizationKey;
  const members = await context.db.mutation.memberRefs(
    {
      where: {
        organization: { key: organizationKey },
      },
    },
    '{ auth0Id role }'
  );

  const normalizedMemberRefs = members.reduce((acc, memberRef) => {
    acc[memberRef.auth0Id] = memberRef;
    return acc;
  }, {});
  const userProfiles = await context.loaders.users.loadMany(
    Object.keys(normalizedMemberRefs)
  );
  return userProfiles.map(doc => ({
    id: doc.user_id,
    email: doc.email,
    name: doc.name,
    picture: doc.picture,
    role: normalizedMemberRefs[doc.user_id].role,
  }));
};
