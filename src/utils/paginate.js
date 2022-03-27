import btoa from "btoa";
import atob from "atob";

export const getNextCursor = (data = {}) => btoa(JSON.stringify(data));

export const parseCursor = (cursor) => JSON.parse(atob(cursor));

export const paginate = () => {};
