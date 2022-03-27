import btoa from "btoa";
import atob from "atob";

export const getNextCursor = (data = {}) => btoa(JSON.stringify(data));

export const parseCursor = (cursor) => JSON.parse(atob(cursor));

/**
 * Based on
 * [MySQL cursor based pagination with multiple columns](https://stackoverflow.com/questions/38017054/mysql-cursor-based-pagination-with-multiple-columns/38017813)
 */
export const paginate = () => {};
