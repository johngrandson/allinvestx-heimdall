import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { EventGridEvent } from 'azure-eventgrid/lib/models';
import { generateResponse } from '../shared/libs/responseHelpers';
import { Email, NewCustomer, NewCustomerModel } from '../shared/models/NewCustomer';
import sendConfirmationEmail from '../shared/sendConfirmationEmail';

const eventGridTrigger: AzureFunction =
  async function (context: Context, eventGridEvent: EventGridEvent, req: HttpRequest): Promise<void> {
    const newCustomer: NewCustomer = eventGridEvent.data;
    const email: Email = newCustomer.contactInfo.emails.find((e) => e.isMainEmail);

    await sendConfirmationEmail(newCustomer, email);

    context.res = generateResponse(null, 204);
  };

export default eventGridTrigger;
