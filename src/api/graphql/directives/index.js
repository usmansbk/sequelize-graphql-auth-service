import authDirectiveTransformer from "./auth";

const applyDirectives = (schema) => authDirectiveTransformer(schema, "auth");

export default applyDirectives;
