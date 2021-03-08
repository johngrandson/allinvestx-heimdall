import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { badRequest } from '@hapi/boom';
import connectToMongo from '../shared/libs/connectToMongo';
import EventGridTopic from '../shared/libs/EventGridTopic';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import { NewCustomer, NewCustomerModel } from '../shared/models/NewCustomer';

const eventGridTopic = new EventGridTopic();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToMongo();

  const requestBody: NewCustomer = req.body;
  const newCustomer = await new NewCustomerModel(req.body);
  const isAlreadySignedUp = await NewCustomerModel.isAlreadySignedUp(requestBody);

  if (isAlreadySignedUp) {
    throw badRequest('Já existe um cadastro com esse CPF/CNPJ');
  }

  await newCustomer.save();
  await eventGridTopic.publish('newCustomer', [newCustomer]);

  context.res = generateResponse(newCustomer, 201);
};

export default requestPipeline(
//   extractJwtUser,
//   isUserInRole('admin'),
  httpTrigger
);
