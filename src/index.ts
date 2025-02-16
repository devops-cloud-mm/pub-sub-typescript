import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import {PubSub} from '@google-cloud/pubsub';


//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;


// Instantiates Publisher
const pubSubClient = new PubSub();


// Publishes a message to a topic
async function publishMessage(msj: string) {
    
  const topicName = 'email-task'; // Replace with your Pub/Sub topic
  const data = JSON.stringify({ message: msj});

  // Convert data to a Buffer
  const dataBuffer = Buffer.from(data);

  try {
    const messageId = await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    if (error instanceof Error) {
        error = error.message;
      }
    console.error(`Error publishing message: ${error}`);
  }
}



// Instantiates a subscription
const pubSubClient2 = new PubSub();

// Function to listen for messages
async function listenForMessages(res: Response) {
    
  const subscriptionName = 'email-task-sub'; // Replace with your Pub/Sub subscription
 // const timeout = 120; // Set the timeout for how long to listen for messages

  // References an existing subscription
  const subscription = pubSubClient2.subscription(subscriptionName);

  // Event handler for incoming messages
  const messageHandler = (message: { id: any; data: { toString: () => any; }; attributes: any; ack: () => void; }) => {
    


    console.log(`Received message ${message.id}:`);
    console.log(`Data: ${message.data.toString()}`);
    console.log(`Attributes: ${JSON.stringify(message.attributes)}`);


    res.type("application/json");
    res.status(200).json({ id: message.id, data: message.data.toString(), attributes:JSON.stringify(message.attributes)});

    // Acknowledge the message
    message.ack();
  };

  // Listen for new messages
  subscription.on('message', messageHandler);

  // Timeout after X seconds
  /*setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${timeout} seconds elapsed, stopping subscription listener.`);
  }, timeout * 1000);*/
}


app.get('/', (req: Request, res: Response) => {

    const msj: string = req.query.msj as string;

    if (!msj) {
        res.type("application/json");
        res.status(500).json({ error: "messaje is empty"});
        return;
      }

    publishMessage(msj);

    listenForMessages(res);

});

app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});