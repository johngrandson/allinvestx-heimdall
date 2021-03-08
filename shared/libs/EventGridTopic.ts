import EventGrid from 'azure-eventgrid';
import { EventGridEvent } from 'azure-eventgrid/lib/models';
import * as msRestAzure from 'ms-rest-azure';
import * as url from 'url';
import * as uuid from 'uuid/v4';

export default class EventGridTopic {
  constructor(
    private namespace: string = process.env.EventGridTopicNamespace,
    private endpoint: string = process.env.EventGridTopicEndpoint,
    private key: string = process.env.EventGridTopicKey) {
  }

  public async publish(event: string, data: any[]) {
    const topicCredentials = new msRestAzure.TopicCredentials(this.key);
    const eventGridClient = new EventGrid(topicCredentials);
    const topicHostName = url.parse(this.endpoint, true).host;
    const currentDate = new Date();
    const events: EventGridEvent[] = data.map((d) => ({
      data: d,
      dataVersion: '2.0',
      eventTime: currentDate,
      eventType: `${this.namespace}:${event}`,
      id: uuid(),
      subject: `${this.namespace}:${event}`
    }));

    return await eventGridClient.publishEvents(topicHostName, events);
  }
}
