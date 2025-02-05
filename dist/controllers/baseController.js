"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    constructor(model) {
        this.model = model;
    }
    async getAll(req, res) {
        try {
            const items = await this.model.find();
            res.status(200).json(items);
        }
        catch (error) {
            res.status(500).json({ message: "Error retrieving data", error });
        }
    }
    async getById(req, res) {
        try {
            const item = await this.model.findById(req.params.id);
            if (!item) {
                res.status(404).json({ message: "Item not found" });
                return;
            }
            res.status(200).json(item);
        }
        catch (error) {
            res.status(500).json({ message: "Error retrieving item", error });
        }
    }
    async create(req, res) {
        try {
            const newItem = new this.model(req.body);
            const savedItem = await newItem.save();
            res.status(201).json(savedItem);
        }
        catch (error) {
            res.status(500).json({ message: "Error creating item", error });
        }
    }
    async update(req, res) {
        try {
            const updatedItem = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedItem) {
                res.status(404).json({ message: "Item not found" });
                return;
            }
            res.status(200).json(updatedItem);
        }
        catch (error) {
            res.status(500).json({ message: "Error updating item", error });
        }
    }
    async delete(req, res) {
        try {
            const deletedItem = await this.model.findByIdAndDelete(req.params.id);
            if (!deletedItem) {
                res.status(404).json({ message: "Item not found" });
                return;
            }
            res.status(200).json({ message: "Item deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting item", error });
        }
    }
}
exports.BaseController = BaseController;
