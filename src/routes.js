import { Request, Response,  Router } from "express";
import { Readable } from "stream"
import readline, { Interface } from "readline";

import multer from "multer";
import { client } from "./database/client";

const multerConfig = multer();

const router = Router();

Interface Companies{
    zip: String;
    name: String;
    website: String;
}

router.post(
  "/companies",
  multerConfig.single("file"),
  async (request: Request, response: Response) => {
   
   const { file } = request;
   const { buffer } = file

   const readableFile = new Readable();
   readableFile.push(buffer);
   readableFile.push(null);

   const companiesLine = readline.createInterface({
       input: readableFile
   })

   const companies: Company[] = [];

   for await(let line of companiesLine) {
       const companiesLineSplit = line.split(",")
       
       companies.push({
           name: companiesLineSplit[0],
           zip: companiesLineSplit[1],
       });
   }

   for await(let {name, zip, website} of companies){
       await client.companies.create({
           data: {
               name,
               zip,
               website,
           },
       });
   }
   
    return response.json(companies);
  }
);

export { router };
