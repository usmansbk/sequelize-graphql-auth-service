import {
  EmailAddressResolver,
  URLResolver,
  DateResolver,
  DateTimeResolver,
  PhoneNumberResolver,
  LocaleResolver,
  ByteResolver,
  JSONResolver,
  CountryCodeResolver,
  JWTResolver,
} from "graphql-scalars";
import { getImageUrl } from "~helpers/links";

export default {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
  PhoneNumber: PhoneNumberResolver,
  Locale: LocaleResolver,
  Byte: ByteResolver,
  JSON: JSONResolver,
  JWT: JWTResolver,
  CountryCode: CountryCodeResolver,
  Photo: {
    url(parent, { resize }) {
      return getImageUrl(parent.toJSON(), resize);
    },
    thumbnail(parent, { resize }) {
      return getImageUrl(parent.toJSON(), resize);
    },
  },
};
