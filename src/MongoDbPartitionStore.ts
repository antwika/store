import { ObjectId } from 'mongodb';
import { IPartitionStore, Partition } from './IPartitionStore';
import { DataId, WithId } from './IStore';
import { MongoDbConnection, MongoDbConnectionArgs } from './MongoDbConnection';
import { ensureHex } from './util';

export interface MongoDbPartitionStoreArgs extends MongoDbConnectionArgs {}

export class MongoDbPartitionStore extends MongoDbConnection implements IPartitionStore {
  async createWithoutId<T>(partition: Partition, data: T): Promise<WithId<T>> {
    const database = await this.getDatabase();
    const collection = database.collection(partition.name);

    const doc = { ...data, _id: new ObjectId() };
    await collection.insertOne(doc);

    // eslint-disable-next-line no-underscore-dangle
    const result: WithId<T> = { ...data, id: doc._id.toHexString() };
    return result;
  }

  async read<T>(partition: Partition, id: DataId): Promise<WithId<T>> {
    const database = await this.getDatabase();
    const collection = database.collection(partition.name);
    const found = await collection.findOne({ _id: new ObjectId(ensureHex(id, 24)) });
    if (!found) {
      throw new Error(`Could not find data by id: ${ensureHex(id, 24)}`);
    }
    // eslint-disable-next-line no-underscore-dangle
    const data: any = { ...found, id: found._id.toHexString() };
    // eslint-disable-next-line no-underscore-dangle
    delete data._id;
    return data as WithId<T>;
  }

  async readAll<T>(partition: Partition): Promise<WithId<T>[]> {
    const database = await this.getDatabase();
    const collection = database.collection(partition.name);
    const found = await collection.find({}).toArray();
    const data = found.map((f) => {
      // eslint-disable-next-line no-underscore-dangle
      const d: any = { ...f, id: f._id.toHexString() };
      // eslint-disable-next-line no-underscore-dangle
      delete d._id;
      return d;
    });
    return data as unknown as WithId<T>[];
  }

  async update<T>(partition: Partition, data: WithId<T>) {
    const database = await this.getDatabase();
    const collection = database.collection(partition.name);
    const doc = { ...data, _id: new ObjectId(ensureHex(data.id, 24)) };
    await collection.updateOne({ _id: new ObjectId(ensureHex(data.id, 24)) }, { $set: doc });
  }

  async delete(partition: Partition, id: DataId) {
    const database = await this.getDatabase();
    const collection = database.collection(partition.name);
    const deleted = await collection.deleteOne({ _id: new ObjectId(ensureHex(id, 24)) });

    if (deleted.deletedCount === 0) {
      throw new Error('Could not delete non-existant data');
    }
  }
}
