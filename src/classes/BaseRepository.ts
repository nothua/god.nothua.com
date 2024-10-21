import { Model, Document } from "mongoose";

class BaseRepository<T extends Document> {
    constructor(public model: Model<T>) {}

    async create(data: Partial<T>): Promise<T> {
        const newDocument = new this.model(data);
        return newDocument.save();
    }

    async edit(id: string, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id);
    }

    async getAll(): Promise<T[]> {
        return this.model.find();
    }

    async get(id: string): Promise<T | null> {
        if (id == "null" || !id) return null;
        return this.model.findById(id);
    }

    async getByField(field: string, value: string): Promise<T | null> {
        return this.model.findOne({ [field as any]: value });
    }

    async upsert(data: Partial<T> & { _id?: string }): Promise<T | null> {
        return this.model.findOneAndUpdate({ _id: data._id }, data, {
            upsert: true,
            new: true,
        });
    }
}

export default BaseRepository;
