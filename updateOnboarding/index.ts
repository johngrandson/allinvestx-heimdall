import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { notFound } from '@hapi/boom';
import connectToMongo from '../shared/libs/connectToMongo';
import EventGridTopic from '../shared/libs/EventGridTopic';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import updateDocument from '../shared/libs/updateDocument';
import {  NewCustomerModel } from '../shared/models/NewCustomer';

const eventGridTopic = new EventGridTopic();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToMongo();

  const onboardingId: string = req.params.id;
  const onboardingData = await NewCustomerModel.findById(onboardingId);

  if (!onboardingData) {
    throw notFound('Nenhum onboarding encontrado com o ID informado');
  }

  const updatedOnboarding = updateDocument(onboardingData, req.body);

  await updatedOnboarding.save();
  await eventGridTopic.publish('newCustomerUpdated', [updatedOnboarding]);

  context.res = generateResponse(updatedOnboarding);
};

export default requestPipeline(httpTrigger);
