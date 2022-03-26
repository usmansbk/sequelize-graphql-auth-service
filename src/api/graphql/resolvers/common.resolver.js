import { EmailAddressResolver, URLResolver } from "graphql-scalars";
import { GraphQLDate, GraphQLDateTime } from "graphql-iso-date";
import { getImageUrl } from "~helpers/links";

export default {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
  Photo: {
    url(parent, { resize }) {
      return getImageUrl(parent, resize);
    },
    thumbnail(parent, { resize }) {
      return getImageUrl(parent, resize);
    },
  },
};
