import { actions, resources } from "~constants/permission";

export default {
  Query: {
    supportedAuthActions: () => actions,
    supportedAuthResources: () => resources,
  },
};
