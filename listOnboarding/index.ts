import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import connectToMongo from '../shared/libs/connectToMongo';
import mongoQueryGenerator from '../shared/libs/middlewares/mongoQueryGenerator';
import requestPipeline from '../shared/libs/requestPipeline';
import { generateResponse } from '../shared/libs/responseHelpers';
import { NewCustomerModel } from '../shared/models/NewCustomer';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  await connectToMongo();

  const { filter, skip, limit, sort, projection } = req.mongoQuery;
  
  const documentCount: number = await NewCustomerModel.count(filter);
  const responseBody = await NewCustomerModel
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select(projection);

  context.res = generateResponse(responseBody, 200, {
    'Access-Control-Expose-Headers': 'X-Total-Count',
    'X-Total-Count': documentCount
  });
};

export default requestPipeline(
  mongoQueryGenerator,
  httpTrigger
);
