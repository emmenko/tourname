/* eslint-disable no-param-reassign */
const { defaultFieldResolver } = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
const isUserAdminOfOrganization = require('../validations/is-user-admin-of-organization');

class IsAdminDirective extends SchemaDirectiveVisitor {
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (...args) => {
      const params = args[1];
      const context = args[2];
      await isUserAdminOfOrganization(params, context);
      return resolve.apply(this, args);
    };
  }
}

module.exports = IsAdminDirective;
