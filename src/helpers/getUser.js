// eslint-disable no-await-in-loop
import db from "~db/models";
import cache from "~utils/cache";
import { ROLE_PERMISSIONS_PREFIX, USER_PREFIX } from "~constants/auth";
import {
  PERMISSIONS_ALIAS,
  PERMISSIONS_SCOPE,
  ROLES_ALIAS,
  ROLES_SCOPE,
} from "~constants/models";

const saveUserInstance = async (key, user) => {
  await cache.setJSON(key, {
    ...user,
    roles: user.roles.map((role) => role.id),
  });

  await Promise.all(
    user.roles.map((role) =>
      cache.setJSON(`${ROLE_PERMISSIONS_PREFIX}:${role.id}`, role)
    )
  );
};

const getUser = async (id) => {
  const key = `${USER_PREFIX}:${id}`;
  let user = await cache.getJSON(key);

  if (user) {
    const instance = db.User.build(user, {
      isNewRecord: false,
      raw: false,
      include: {
        model: db.Role,
        as: ROLES_ALIAS,
        include: [
          {
            as: PERMISSIONS_ALIAS,
            model: db.Permission,
          },
        ],
      },
    });

    const roles = [];
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < user.roles.length; i += 1) {
      const roleId = user.roles[i];
      const roleKey = `${ROLE_PERMISSIONS_PREFIX}:${roleId}`;
      let role = await cache.getJSON(roleKey);

      if (!role) {
        role = (
          await db.Role.scope(PERMISSIONS_SCOPE).findByPk(roleId)
        ).toJSON();
        if (role) {
          await cache.setJSON(roleKey, role);
        }
      }

      if (role) {
        roles.push(role);
      }
    }
    return instance.set(ROLES_ALIAS, roles);
  } 
    user = await db.User.scope(ROLES_SCOPE).findByPk(id);

    if (user) {
      await saveUserInstance(key, user.toJSON());
    }

    return user;
  
};

export default getUser;
