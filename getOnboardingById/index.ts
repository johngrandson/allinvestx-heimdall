import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { notFound } from '@hapi/boom';
import connectToMongo from '../shared/libs/connectToMongo';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import { NewCustomer, NewCustomerModel } from '../shared/models/NewCustomer';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToMongo();

  const onboardingId: string = req.params.id;
  const onboardingData: NewCustomer = await NewCustomerModel.findById(onboardingId);

  if (!onboardingData) {
    throw notFound('Nenhum onboarding encontrado com o ID informado');
  }

  context.res = generateResponse(onboardingData);
};

export default requestPipeline(httpTrigger);
