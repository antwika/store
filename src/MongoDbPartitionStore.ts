import { MongoClient, ObjectId } from 'mongodb';
import { IPartitionStore, Partition } from './IPartitionStore';
import { DataId, WithId } from './IStore';

/**
 * Constructor arguments
 */
export interface MongoDbPartitionStoreArgs {
  /**
   * A required prefix to identify that this is a string in the standard connection format.
   * @example `mongodb://`
   */
  protocol: string,

  /**
   * Authorization credential username
   * @example `testuser`
   */
  username?: string,

  /**
   * Authorization credential username
   * @example `testpass`
   */
  password?: string,

  /**
   * The host (and optional port number) where the mongod instance is running.
   * @example `host[:port]`
   */
  cluster: string,

  /**
   * The specific Mongodb database name to connect to.
   * @example `testdb`
   */
  database: string,

  /**
   * A query string that specifies connection specific options..
   * @see [Connection String Options](https://www.mongodb.com/docs/manual/reference/connection-string/#std-label-connections-connection-options)
   * @example `replicaSet=mySet&authSource=authDB`
   */
  flags?: string,
}

export class MongoDbPartitionStore implements IPartitionStore {
  private cluster: string;

  private database: string;

  private connectionUri: string;

  private connection?: MongoClient;

  constructor(args: MongoDbPartitionStoreArgs) {
    const {
      protocol,
      username,
      password,
      cluster,
      database,
      flags,
    } = args;

    this.cluster = cluster;
    this.database = args.database;

    let connectionUri = `${protocol}://`;
    if (username && password) connectionUri += `${username}:${password}@`;
    connectionUri += `${cluster}/${database}`;
    if (flags) connectionUri += `?${flags}`;

    this.connectionUri = connectionUri;
  }

  async getConnection() {
    if (!this.connection) {
      const connection = new MongoClient(this.connectionUri);
      await connection.connect();
      this.connection = connection;
      console.log(`Connected to MongoDb database [${this.cluster}/${this.database}]`);
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
      console.log(`Disconnected from MongoDb database [${this.cluster}/${this.database}]`);
    }
  }

  async createWithoutId<T>(partition: Partition, data: T): Promise<WithId<T>> {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(partition.name);

    const doc = { ...data, _id: new ObjectId() };
    await collection.insertOne(doc);

    // eslint-disable-next-line no-underscore-dangle
    const result: WithId<T> = { ...data, id: doc._id.toHexString() };
    return result;
  }

  async read<T>(partition: Partition, id: DataId): Promise<WithId<T>> {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(partition.name);
    const found = await collection.findOne({ _id: new ObjectId(this.ensureHex(id, 24)) });
    if (!found) {
      throw new Error(`Could not find data by id: ${this.ensureHex(id, 24)}`);
    }
    // eslint-disable-next-line no-underscore-dangle
    const data: any = { ...found, id: found._id.toHexString() };
    // eslint-disable-next-line no-underscore-dangle
    delete data._id;
    return data as WithId<T>;
  }

  async readAll<T>(partition: Partition): Promise<WithId<T>[]> {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
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
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(partition.name);
    const doc = { ...data, _id: new ObjectId(this.ensureHex(data.id, 24)) };
    await collection.updateOne({ _id: new ObjectId(this.ensureHex(data.id, 24)) }, { $set: doc });
  }

  async delete(partition: Partition, id: DataId) {
    const connection = await this.getConnection();
    const database = connection.db(this.database);
    const collection = database.collection(partition.name);
    const deleted = await collection.deleteOne({ _id: new ObjectId(this.ensureHex(id, 24)) });

    if (deleted.deletedCount === 0) {
      throw new Error('Could not delete non-existant data');
    }
  }

  /**
   * @deprecated
   */
  private ensureHex(str: string, length: number) {
    if (!/^[0-9a-fA-F]+$/.test(str) || str.length !== 24) {
      let result = '';
      for (let i = 0; i < str.length; i += 1) {
        result += str.charCodeAt(i).toString(16);
      }
      result = result.padStart(length, '0');
      return result.substring(result.length - length);
    }
    return str;
  }
}
