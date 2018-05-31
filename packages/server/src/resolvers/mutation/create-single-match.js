/**
 * Args:
 * - organizationKey
 * - discipline
 * - teamLeft
 *   - size
 *   - playerIds
 * - teamRight
 *   - size
 *   - playerIds
 */
module.exports = (parent, args, context, info) =>
  context.db.mutation.createMatchSingle({
    data: {
      organization: { connect: { key: args.organizationKey } },
      discipline: args.discipline,
      status: 'New',
      teamLeft: {
        create: {
          size: args.teamLeft.size,
          playerRefs: { connect: args.teamLeft.playerIds.map(id => ({ id })) },
        },
      },
      teamRight: {
        create: {
          size: args.teamRight.size,
          playerRefs: { connect: args.teamRight.playerIds.map(id => ({ id })) },
        },
      },
    },
    info,
  });
