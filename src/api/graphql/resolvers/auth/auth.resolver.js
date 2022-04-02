import { actions, resources } from "~constants/auth";

export default {
  Query: {
    supportedAuthActions: () => actions,
    supportedAuthResources: () => resources,
  },
};
