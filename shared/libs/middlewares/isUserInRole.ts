import { Context, HttpRequest } from "@azure/functions";
import { unauthorized } from "@hapi/boom";

export default function isUserInRole(...roles: string[]) {
  return async function(context: Context, req: HttpRequest): Promise<void> { 
    const { user } = req;

    if (!user) {
      throw unauthorized('Não foi possível verificar as informações do usuário');
    }

    const isAllowed: boolean = user.roles && roles.some(r => req.user.roles.some(ur => ur === r));

    if (!isAllowed) {
      throw unauthorized('O usuário precisa ter pelo menos uma das seguintes roles: ' + roles.join(','));
    }
  }
}