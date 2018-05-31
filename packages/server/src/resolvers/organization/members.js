module.exports = async (parent, args, context) => {
  if (!parent.key) {
    throw new Error(
      'Cannot resolve members without the organization key. Make sure the parent resolver correctly returns a valid object.'
    );
  }

  const members = await context.db.query.memberRefs(
    {
      where: {
        organization: { key: parent.key },
      },
    },
    '{ id auth0Id role }'
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
