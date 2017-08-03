import * as express from 'express';
import * as mongo from 'connect-mongo'; // (mongo session)
import * as session from 'express-session';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';

/**
 * Loading environment variables, such as API key and mongoDB.
 */
dotenv.config({ path: ".env.dev" });

/** 
 * Controllers
*/
import * as apiController from './controllers/api';

const MongoStore = mongo(session);

const app = express();

let mongodbURI: string = process.env.MONGODB_URI || process.env.MONGOLAB_URI || '';

(<any>mongoose).Promise = global.Promise; //setting Mongoose.promise to native promises

mongoose.connect(mongodbURI, {useMongoClient: true});

mongoose.connection.on("error", () => {
    console.log("MongoDB failed.");
    process.exit();
});

app.use(bodyParser.json())
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || '',
    store: new MongoStore({
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI || '',
        autoReconnect: true
    })
}));


app.get("/api/newRoom", apiController.newRoom)

app.post("/api/registerPick", apiController.registerPick)

app.get("/api/cancelDraft", apiController.cancelDraft)

app.get("/", function(req: Request, res: Response) {
    console.log(req.session.id);
    res.send({test: 'hello!'});
});


app.listen(3000, function() {
    console.log("Listening on port 3000.")
})
