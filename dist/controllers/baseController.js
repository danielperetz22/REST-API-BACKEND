"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    constructor(model) {
        this.model = model;
    }
    async create(req, res) {
        try {
            const newItem = await this.model.create(req.body);
            if (!newItem) {
                res.status(404).send("There has been Missing Data");
                return;
            }
            else {
                res.status(201).send(newItem);
                return;
            }
        }
        catch (error) {
            res.status(400).send(error);
            return;
        }
    }
    async getAll(req, res) {
        const ownerFilter = req.query.owner;
        try {
            if (ownerFilter) {
                const Items = await this.model.find({ owner: ownerFilter });
                if (Items.length === 0) {
                    res.status(404).send("There are no items with this owner");
                    return;
                }
                res.status(200).send(Items);
                return;
            }
            else {
                const Items = await this.model.find();
                res.status(200).send(Items);
                return;
            }
        }
        catch (error) {
            console.log(error);
            res.status(400).send(error);
        }
    }
    async getById(req, res) {
        const askedID = req.params._id;
        console.log("GET BY ID");
        try {
            const Item = await this.model.findById(askedID);
            if (!Item) {
                res.status(404).send("COULDNT FIND DUE TO AN ERROR");
                return;
            }
            else {
                res.status(200).send(Item);
                return;
            }
        }
        catch (error) {
            res.status(400).send(error);
            return;
        }
    }
}
exports.BaseController = BaseController;
const createController = (model) => {
    return new BaseController(model);
};
exports.default = createController;
