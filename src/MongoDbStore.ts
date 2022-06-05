import { MongoClient } from 'mongodb';
import { Data, DataId, IStore } from './IStore';

interface MongoDbStoreArgs {
  username: string | undefined,
  password: string | undefined,
  cluster: string,
  database: string,
  collection: string,
}

export class MongoDbStore implements IStore {
  private database: string;

  private collection: string;

  private connectionUri: string;

  private connection: MongoClient | undefined;

  constructor(args: MongoDbStoreArgs) {
    this.database = args.database;
    this.collection = args.collection;
    this.connectionUri = `mongodb://${args.cluster}/${args.database}?retryWrites=true&w=majority`;
  }

  async getConnection() {
    if (!this.connection) {
      const connection = new MongoClient(this.connectionUri);
      await connection.connect();
      this.connection = connection;
      console.log('Connected to MongoDb database');
    }
    return this.connection;
  }

  async connect() {
    await this.getConnection();
  }

  async disconnect() {
    const connection = await this.getConnection();
    if (connection) {
      await connection.close();
      this.connection = undefined;
      console.log('Disconnected from MongoDb database');
    }
  }

  async create<T extends Data>(data: T) {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(this.collection);
    await collection.insertOne(data);
    return data;
  }

  async read<T extends Data>(id: DataId): Promise<T> {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(this.collection);
    const found = await collection.findOne({ id });
    if (!found) {
      throw new Error('Could not find data by id');
    }
    return found as unknown as T;
  }

  async readAll<T extends Data>(): Promise<T[]> {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(this.collection);
    const found = await collection.find({}).toArray();
    return found as unknown as T[];
  }

  async update<T extends Data>(data: T) {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(this.collection);
    await collection.updateOne({ id: data.id }, { $set: data });
  }

  async delete(id: DataId) {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(this.collection);
    const deleted = await collection.deleteOne({ id });

    if (deleted.deletedCount === 0) {
      throw new Error('Could not delete non-existant data');
    }
  }
}
