import bunyan from "bunyan";

const log = bunyan.createLogger({ name: process.env.APP_NAME });

export default log;
