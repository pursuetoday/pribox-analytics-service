import mongoose from "mongoose";
import { databaseConfig } from "../config";


export default function connectDatabase() {
    return new Promise((resolve, reject) => {
      mongoose.Promise = global.Promise;
      mongoose.connection
        .on("error", (err) => {
          console.log(`MongoDB connection error: ${err}`);
          reject(err);
        })
        .on("close", () => console.log("Database connection closed."))
        .once("open", () => resolve(mongoose.connections[0]));
  
      mongoose.connect(databaseConfig, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
    });
  }