import db from "~db/models";
import cache from "~utils/cache";

const getUser = async (id) => {
  let userRoles;

  const cached = await cache.get(id);

  if (cached) {
    userRoles = JSON.parse(cached);
  } else {
    const user = await db.User.scope("roles").findByPk(id);
    userRoles = user.roles;
    await cache.set({
      key: id,
      value: JSON.stringify(userRoles),
      expiresIn: 5 * 60, // 5 minutes
    });
  }

  return {
    id,
    hasRole: (roles) => userRoles.some((role) => roles.includes(role.name)),
    hasPermission: (scopes) => userRoles.some((role) =>
        role.permissions.some(({ action, resource }) =>
          scopes.includes(`${action}:${resource}`)
        )
      ),
  };
};

export default getUser;
