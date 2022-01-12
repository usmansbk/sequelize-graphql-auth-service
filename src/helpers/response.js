/*
Successful responses ( 200 – 299 )
Redirection messages ( 300 – 399 )
Client error responses ( 400 – 499 )
Server error responses ( 500 – 599 ) 
*/

/**
 * The request succeeded.
 */
export const Ok = ({ message = 'Success', ...payload }) => ({
	code: 200,
	success: true,
	message,
	...payload,
});

/**
 * The request succeeded, and a new resource was created as a result.
 * This is typically the response sent after POST requests, or some PUT requests. 
 */
export const Created = ({ message = 'Created', ...payload }) => ({
	code: 201,
	success: true,
	message,
	...payload,
});

/**
 * The request has been received but not yet acted upon.
 * It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request.
 * It is intended for cases where another process or server handles the request, or for batch processing. 
 */
export const Accepted = ({ message = 'Accepted', ...payload }) => ({
	code: 202,
	success: true,
	message,
	...payload,
});

/**
 * The server could not understand the request due to invalid syntax.
 */
export const BadRequest = ({ message = 'Bad Request', ...payload }) => ({
	code: 400,
	success: false,
	message,
	...payload,
});

/**
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated".
 * That is, the client must authenticate itself to get the requested response. 
 */
export const Unauthorized = ({ message = 'Unauthorized', ...payload }) => ({
	code: 401,
	success: false,
	message,
	...payload,
});

/**
 * The client does not have access rights to the content; that is, it is unauthorized, so the server is
 * refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server.
 */
export const Forbidden = ({ message = 'Forbidden', ...payload }) => ({
	code: 403,
	success: false,
	message,
	...payload,
});

/**
 * The server can not find the requested resource. In the browser, this means the URL is not
 * recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist.
 * Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client.
 * This response code is probably the most well known due to its frequent occurrence on the web.
 */
export const NotFound = ({ message = 'Not Found', ...payload }) => ({
	code: 404,
	success: false,
	message,
	...payload,
});

/**
 * The user has sent too many requests in a given amount of time ("rate limiting").
 */
export const TooManyRequests = ({ message = 'Too Many Requests', ...payload }) => ({
	code: 429,
	success: false,
	message,
	...payload,
});