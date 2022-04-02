import { actions, resources } from "~constants/permission";

export default {
  Query: {
    actions: () => actions,
    resources: () => resources,
  },
};
