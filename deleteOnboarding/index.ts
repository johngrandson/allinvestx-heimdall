import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { notFound } from '@hapi/boom';
import connectToMongo from '../shared/libs/connectToMongo';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import { NewCustomerModel } from '../shared/models/NewCustomer';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToMongo();

  const newCustomerId: string = req.params.id;
  const newCustomer = await NewCustomerModel.findByIdAndDelete(newCustomerId);

  if (!newCustomer) {
    throw notFound('Nenhum onboarding encontrado com o ID informado');
  }

  context.res = generateResponse(null, 204);
};

export default requestPipeline(
  //   extractJwtUser,
  //   isUserInRole('admin'),
  httpTrigger
);
