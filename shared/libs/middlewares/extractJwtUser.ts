import { Context, HttpRequest } from "@azure/functions";
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import { unauthorized } from "@hapi/boom";

const jwtVerifyAsync = promisify(jwt.verify).bind(jwt);

declare module "@azure/functions" {
  interface HttpRequest {
    user: {
      name: string,
      roles: string[]
    };
  }
}

export default async function extractJwtUser(context: Context, req: HttpRequest): Promise<void> {
  try {
    const authorizationHeader: string = req.headers['authorization'] || '';
    const authorizationToken: string = authorizationHeader.split('Bearer ')[1];

    if (!authorizationHeader || !authorizationToken) {
      throw new Error('O token enviado não é válido.');
    }

    const userData = await jwtVerifyAsync(authorizationToken, 'a');

    req.user = userData;
  } catch (error) {
    throw unauthorized('Não foi possível identificar o usuário da requisição.');
  }
}
