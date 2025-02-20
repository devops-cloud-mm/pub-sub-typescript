"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const pubsub_1 = require("@google-cloud/pubsub");
//For env File 
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT_ || 3000;
// Instantiates Publisher
const pubSubClient = new pubsub_1.PubSub();
// Publishes a message to a topic
function publishMessage(msj, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const topicName = 'email-task'; // Replace with your Pub/Sub topic
        const data = JSON.stringify({ message: msj });
        // Convert data to a Buffer
        const dataBuffer = Buffer.from(data);
        try {
            const messageId = yield pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
            console.log(`Message ${messageId} published.`);
            const show = console.log('your result');
            res.status(200).send(`Message ${messageId} published. <script>${show}</script>`);
            // res.status(200).send(`<script>${show}</script>`);
        }
        catch (error) {
            if (error instanceof Error) {
                error = error.message;
            }
            console.error(`Error publishing message: ${error}`);
        }
    });
}
// Instantiates a subscription
const pubSubClient2 = new pubsub_1.PubSub();
// Function to listen for messages
function listenForMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        const subscriptionName = 'email-task-sub'; // Replace with your Pub/Sub subscription
        // const timeout = 120; // Set the timeout for how long to listen for messages
        // References an existing subscription
        const subscription = pubSubClient2.subscription(subscriptionName);
        // Event handler for incoming messages
        const messageHandler = (message) => {
            console.log(`Received message ${message.id}:`);
            console.log(`Data: ${message.data.toString()}`);
            console.log(`Attributes: ${JSON.stringify(message.attributes)}`);
            //res.send(Buffer.from(`Received message ${message.id} Data: ${message.data.toString()}`));
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
    });
}
//app.use( express.json() ); // raw
app.use('/', express_1.default.static('public'));
app.get('/', (req, res) => {
    //res.set('Content-Type', 'json');
    listenForMessages();
});
app.get('/server-sent-events', function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    let dateTime = new Date();
    const timeout = 120; // Set the timeout for how long to listen for messages
    let interval = setTimeout(() => {
        console.log(`data: ${dateTime} \n\n`);
    }, timeout * 1000);
    // close
    res.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});
app.get('/send', (req, res) => {
    const msj = req.query.msj;
    if (!msj) {
        res.status(500).send("messaje is empty");
        return;
    }
    publishMessage(msj, res);
});
app.listen(port, () => {
    console.log(`Server is Fire at https://localhost:${port}`);
});
