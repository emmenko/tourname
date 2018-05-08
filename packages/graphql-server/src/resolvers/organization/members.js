module.exports = async (parent, args, context) => {
  const organizationKey = args.key || args.organizationKey;
  const orgs = await context.db.query.organizations(
    {
      where: {
        AND: [
          { key: organizationKey },
          { memberRefs_some: { auth0Id: context.userId } },
        ],
      },
      first: 1,
    },
    '{ memberRefs { auth0Id role } }'
  );
  if (orgs.length === 0) return null;

  const org = orgs[0];

  const normalizedMemberRefs = org.memberRefs.reduce((acc, memberRef) => {
    acc[memberRef.auth0Id] = memberRef;
    return acc;
  }, {});
  const docs = await context.loaders.users.loadMany(
    Object.keys(normalizedMemberRefs)
  );
  return docs.map(doc => ({
    id: doc.user_id,
    email: doc.email,
    name: doc.name,
    picture: doc.picture,
    role: normalizedMemberRefs[doc.user_id].role,
  }));
};
