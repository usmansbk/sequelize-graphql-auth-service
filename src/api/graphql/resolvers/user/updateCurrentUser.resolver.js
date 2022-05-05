import QueryError from "~utils/errors/QueryError";
import {
  INCORRECT_PASSWORD_ERROR,
  PASSWORD_UPDATED,
  PROFILE_UPDATED,
  SENT_SMS_OTP,
} from "~constants/i18n";
import { PHONE_NUMBER_KEY_PREFIX, SMS_OTP_EXPIRES_IN } from "~constants/auth";
import { Fail, Success } from "~helpers/response";

export default {
  Mutation: {
    async updateCurrentUserFullname(
      _parent,
      { input },
      { currentUser, dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(currentUser.id, input);

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserUsername(
      _parent,
      { username },
      { currentUser, dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(currentUser.id, {
          username,
        });

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserLocale(
      _parent,
      { locale },
      { currentUser, t, dataSources }
    ) {
      try {
        const user = await dataSources.users.update(currentUser.id, { locale });

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserTimeZone(
      _parent,
      { timezone },
      { currentUser, t, dataSources }
    ) {
      try {
        const user = await dataSources.users.update(currentUser.id, {
          timezone,
        });

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserPassword(
      _parent,
      { input },
      { currentUser, t, dataSources }
    ) {
      try {
        const user = await dataSources.users.findByPk(currentUser.id);

        const granted = await user.checkPassword(input.oldPassword);

        if (!granted) {
          throw new QueryError(INCORRECT_PASSWORD_ERROR);
        }

        await dataSources.users.update(currentUser.id, {
          password: input.newPassword,
        });

        return Success({
          code: PASSWORD_UPDATED,
          message: t(PASSWORD_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async removeCurrentUserAvatar(
      _parent,
      _args,
      { currentUser, t, dataSources }
    ) {
      try {
        const user = await dataSources.users.findByPk(currentUser.id);
        const avatar = await user.getAvatar();
        if (avatar) {
          await dataSources.files.destroy(avatar.id);
        }

        return Success({ user: currentUser });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserPhoneNumber(
      _parent,
      { phoneNumber },
      { currentUser, cache, t, otp, mailer, dataSources }
    ) {
      try {
        const user = await dataSources.users.update(currentUser.id, {
          phoneNumber,
        });

        if (phoneNumber) {
          const { id, phoneNumberVerified } = user;
          const key = `${PHONE_NUMBER_KEY_PREFIX}:${id}`;
          const sentToken = await cache.exists(key);

          if (!(sentToken || phoneNumberVerified)) {
            const token = otp.getNumberCode();

            await cache.set(key, token, SMS_OTP_EXPIRES_IN);

            mailer.sendSMS(token, phoneNumber);
          }
        }

        return Success({
          message: phoneNumber
            ? t(SENT_SMS_OTP, { phoneNumber })
            : t(PROFILE_UPDATED),
          code: phoneNumber ? SENT_SMS_OTP : PROFILE_UPDATED,
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
  },
};
