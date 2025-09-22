import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const URL = process.env.MONGO_URL;

let client=null;

if(!URL){
    console.log('Environment variables MONGO_URL or MONGO_DB are not set');
    process.exit(1);
}

export async function connect() {
    try {
        if (!client) {
            client = new MongoClient(URL);
            await client.connect();
            console.log("Connected to MongoDB");
        }
        return client.db();
    } catch(err) {
        console.log(err);
        throw err;
    }
}

export async function disconnect() {
    try {
        if (client) {
            await client.close();
            client = null;
        }
    } catch(err) {    
        console.log(err);
        throw err;
    }
}

