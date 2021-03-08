import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { badRequest } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';
import EventGridTopic from '../shared/libs/EventGridTopic';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import { Email, NewCustomerModel } from '../shared/models/NewCustomer';

interface IEmailVerificationPayload {
  _id: string;
  name: string;
  email: string;
}

const eventGridTopic = new EventGridTopic();
const verificationEmailSecret: string = process.env.VerificationEmailSecret;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const token: string = req.query.token;

    if (!token) {
      throw badRequest('O parâmetro token é obrigatório.');
    }

    const tokenPayload: IEmailVerificationPayload =
      jwt.verify(token, verificationEmailSecret) as IEmailVerificationPayload;
    const onboardingData = await NewCustomerModel.findById(tokenPayload._id);

    if (!onboardingData) {
      throw badRequest('Nenhum usuário encontrado para o token especificado.');
    }

    const verificationEmail: Email = onboardingData.contactInfo.emails.find((e) => e.address === tokenPayload.email);

    if (!verificationEmail) {
      throw badRequest('Nenhum e-mail encontrado para o token especificado.');
    }

    if (verificationEmail.isVerified) {
      throw badRequest('Este e-mail já foi verificado.');
    }

    verificationEmail.isVerified = true;

    // temporário para esse MVP
    onboardingData.status = 'approved';

    await onboardingData.save();

    eventGridTopic.publish('emailVerified', [onboardingData]);

    // para essse MVP o cliente será aprovado depois de verificar o e-mail
    // a ideia futuramente é que ele só seja aprovado depois de um funcionário
    // do banco aprove seu cadastro
    eventGridTopic.publish('approved', [onboardingData]);

    context.res = generateResponse({ message: 'E-mail verificado com sucesso!' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw badRequest('O link de verificação expirou.');
    }

    throw error;
  }
};

export default requestPipeline(httpTrigger);
