import db from "~db/models";
import cache from "~utils/cache";

const getUser = async (id) => {
  let userRoles;

  const key = `auth:${id}`;
  const cached = await cache.get(key);

  const loadFromDb = async () => {
    const user = await db.User.scope("roles").findByPk(id);
    await cache.set({
      key,
      value: JSON.stringify(user.roles),
      expiresIn: 5 * 60, // 5 minutes
    });
    return user.roles;
  };

  if (cached) {
    userRoles = JSON.parse(cached);
  } else {
    userRoles = (await loadFromDb()).roles;
  }

  return {
    id,
    hasRole: (roles) => userRoles.some((role) => roles.includes(role.name)),
    hasPermission: (scopes) =>
      userRoles.some((role) =>
        role.permissions.some(({ action, resource }) =>
          scopes.includes(`${action}:${resource}`)
        )
      ),
  };
};

export default getUser;
