import { notFound } from '@hapi/boom';
import * as jwt from 'jsonwebtoken';
import EventGridTopic from './libs/EventGridTopic';
import { Email, NewCustomer } from './models/NewCustomer';

const eventGridTopic = new EventGridTopic('hermod');

export default async function sendConfirmationEmail(newCustomer: NewCustomer, email: Email) {
  if (!newCustomer) {
    throw notFound('Nenhum onboarding encontrado com o ID informado');
  }

  if (!email) {
    throw notFound('Nenhum e-mail encontrado com o ID informado');
  }

  const name = newCustomer.type === 'person' ? newCustomer.personalInfo.name : newCustomer.companyInfo.tradingName;
  const token = jwt.sign({
    _id: newCustomer._id,
    email: email.address,
    name
  }, process.env.VerificationEmailSecret,
    {
      expiresIn: '30m'
    }
  );

  await eventGridTopic.publish('sendEmail', [{
    data: {
      name,
      url: `${process.env.HeimdallFrontendBaseUrl}/emailVerification/${token}`
    },
    subject: 'Email de confirmação de cadastro',
    template: 'heimdall/new-onboarding',
    to: email.address
  }]);
}
