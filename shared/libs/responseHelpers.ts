import * as boom from '@hapi/boom';
import { Logger } from '@azure/functions';

export function generateResponse(body: any, status: number = 200, additionalHeaders = {}) {
  if (body && status !== 204) {
    return {
      body,
      headers: {
        'Content-Type': body instanceof String ? 'text/plain' : 'application/json',
        ...additionalHeaders
      },
      status
    };
  }

  return { status };
}

export function handleError(error: Error, logger: Logger) {
  let body;
  
  // ValidationError do Mongoose
  if (error && error.name === 'ValidationError') {
    body = boom.boomify(error, { statusCode: 400 });
  } else {
    body = boom.boomify(error);
    logger.error(error);
    if (process.env.NODE_ENV === 'development') {
      body.output.payload = { ...body.output.payload as any, message: error.message, stack: error.stack };
    }
  }

  return this.generateResponse(body.output.payload, body.output.statusCode);
}
