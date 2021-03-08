import { AzureFunction, Context } from '@azure/functions';
import { EventGridEvent } from 'azure-eventgrid/lib/models';
import connectToMongo from '../shared/libs/connectToMongo';
import EventGridTopic from '../shared/libs/EventGridTopic';
import { BlacklistModel } from '../shared/models/Blacklist';
import { NewCustomer, NewCustomerModel } from '../shared/models/NewCustomer';

const eventGridTopic = new EventGridTopic();

function getBlacklistQuery(newCustomer: NewCustomer) {
  if (newCustomer.type === 'company') {
    return { cnpj: newCustomer.companyInfo.cnpj };
  }

  return { cpf: newCustomer.personalInfo.cpf };
}

const eventGridTrigger: AzureFunction =
  async function (context: Context, eventGridEvent: EventGridEvent): Promise<void> {
    await connectToMongo();

    const eventCustomer: NewCustomer = eventGridEvent.data;
    const newCustomer = await NewCustomerModel.findById(eventCustomer._id);

    if (newCustomer) {
      const blacklistQuery = getBlacklistQuery(eventCustomer);
      const blacklist = await BlacklistModel.findOne(blacklistQuery, { _id: 1 });

      // verifica se cliente está na blacklist
      if (blacklist) {
        newCustomer.status = 'refused';
        newCustomer.refusalReason = 'O CPF/CNPJ informado está na blacklist';
      } else {
        newCustomer.status = 'preApproved';
      }

      await newCustomer.save();
      await eventGridTopic.publish(newCustomer.status, [newCustomer]);
    }
  };

export default eventGridTrigger;
