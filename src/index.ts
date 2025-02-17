import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {PubSub} from '@google-cloud/pubsub';


//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT_ || 3000;


// Instantiates Publisher
const pubSubClient = new PubSub();


// Publishes a message to a topic
async function publishMessage(msj: string, res: Response) {
    
  const topicName = 'email-task'; // Replace with your Pub/Sub topic
  const data = JSON.stringify({ message: msj});

  // Convert data to a Buffer
  const dataBuffer = Buffer.from(data);

  try {
    const messageId = await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);

    res.status(200).send(`Message ${messageId} published.`);

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

  
    data = `Received message ${message.id} Data: ${message.data.toString()}`

   //res.status(200).json({ id: message.id, data: message.data.toString(), attributes:JSON.stringify(message.attributes)});

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


  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

const interval = setInterval(() => {

    if(data != ""){
    res.write("data: " + data + "\n\n");
    }
    number++;
    data = "";
}, randomInteger(2, 9) * 1000);

// close
res.on('close', () => {
    clearInterval(interval);
    res.end();
});

}


app.use(cors());
app.use('/', express.static('public'));


let data: string ="";
let number: number = 1;

app.get('/server-sent-events', (req: Request, res: Response) => {

    listenForMessages(res);
   
});

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


app.get('/send', (req: Request, res: Response) => {

  const msj: string = req.query.msj as string;
  if (!msj) {
       
    res.status(500).send("messaje is empty");
    return;
  }
  publishMessage(msj, res);

});

app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});