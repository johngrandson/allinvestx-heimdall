import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import connectToMongo from '../shared/libs/connectToMongo';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import { Email, NewCustomer, NewCustomerModel } from '../shared/models/NewCustomer';
import sendConfirmationEmail from '../shared/sendConfirmationEmail';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToMongo();

  const newCustomer: NewCustomer = await NewCustomerModel.findById(req.params.id);
  const email: Email = newCustomer.contactInfo.emails.find((e) => e._id.toString() === req.params.emailId);

  await sendConfirmationEmail(newCustomer, email);

  context.res = generateResponse(null, 204);
};

export default requestPipeline(
  httpTrigger
);
