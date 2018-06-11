module.exports = async (parent, args, context, info) => {
  const members = await context.db.query.memberRefs(
    {
      where: {
        organization: { key: args.organizationKey },
      },
    },
    info
  );

  const normalizedMemberRefs = members.reduce((acc, memberRef) => {
    acc[memberRef.auth0Id] = memberRef;
    return acc;
  }, {});
  const userProfiles = await context.loaders.users.loadMany(
    Object.keys(normalizedMemberRefs)
  );
  return userProfiles.map(doc => ({
    // From Auth0
    auth0Id: doc.user_id,
    email: doc.email,
    name: doc.name,
    picture: doc.picture,
    // From DB
    id: normalizedMemberRefs[doc.user_id].id,
    role: normalizedMemberRefs[doc.user_id].role,
  }));
};
