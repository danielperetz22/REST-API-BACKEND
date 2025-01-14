import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<T> {
    model: Model<T>;
    constructor(model: Model<T>) {
      this.model = model;
    }
  
    async create(req: Request, res: Response) {
      try {
        const newItem = await this.model.create(req.body);
        if (!newItem) {
          res.status(404).send("There has been Missing Data");
          return;
        } else {
          res.status(201).send(newItem);
          return;
        }
      } catch (error) {
        res.status(400).send(error);
        return;
      }
    }
  
    async getAll(req: Request, res: Response) {
      console.log("Query parameters:", req.query);
      const ownerFilter = req.query.owner;
      console.log("Owner Filter", ownerFilter);
      try {
        if (ownerFilter) {
          const Items = await this.model.find({ owner: ownerFilter });
          if (Items.length === 0) {
            res.status(404).send("There are no items with this owner");
            return;
          }
          res.status(200).send(Items);
          return;
        } else {
          const Items = await this.model.find();
          res.status(200).send(Items);
          return;
        }
      } catch (error) {
        console.log(error);
        res.status(400).send(error);
      }
    }
    
  
    async getById(req: Request, res: Response): Promise<void> {
      const askedID = req.params._id;
      
      try {
        const Item = await this.model.findById(askedID);
       
        if (!Item) {
          res.status(404).send("COULDNT FIND DUE TO AN ERROR");
          return;
        } else {
          res.status(200).send(Item);
          return;
        }
      } catch (error) {
        res.status(400).send(error);
        return;
      }
    }
  }
  const createController = <T>(model: Model<T>) => {
    return new BaseController(model);
  };
  
  export default createController;