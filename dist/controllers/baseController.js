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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield this.model.find();
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving data", error });
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield this.model.findById(req.params.id);
                if (!item) {
                    res.status(404).json({ message: "Item not found" });
                    return;
                }
                res.status(200).json(item);
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving item", error });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newItem = new this.model(req.body);
                const savedItem = yield newItem.save();
                res.status(201).json(savedItem);
            }
            catch (error) {
                res.status(500).json({ message: "Error creating item", error });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedItem = yield this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedItem) {
                    res.status(404).json({ message: "Item not found" });
                    return;
                }
                res.status(200).json(updatedItem);
            }
            catch (error) {
                res.status(500).json({ message: "Error updating item", error });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedItem = yield this.model.findByIdAndDelete(req.params.id);
                if (!deletedItem) {
                    res.status(404).json({ message: "Item not found" });
                    return;
                }
                res.status(200).json({ message: "Item deleted successfully" });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting item", error });
            }
        });
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=baseController.js.map