import {
  EmailAddressResolver,
  URLResolver,
  DateResolver,
  DateTimeResolver,
  PhoneNumberResolver,
  LocaleResolver,
} from "graphql-scalars";
import { getImageUrl } from "~helpers/links";

export default {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
  PhoneNumber: PhoneNumberResolver,
  Locale: LocaleResolver,
  Photo: {
    url(parent, { resize }) {
      return getImageUrl(parent, resize);
    },
    thumbnail(parent, { resize }) {
      return getImageUrl(parent, resize);
    },
  },
};
