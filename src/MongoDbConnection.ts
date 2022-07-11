import { MongoClient } from 'mongodb';

/**
 * Constructor arguments
 */
export interface MongoDbConnectionArgs {
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

export class MongoDbConnection {
  private cluster: string;

  private database: string;

  private connectionUri: string;

  private connection?: MongoClient;

  constructor(args: MongoDbConnectionArgs) {
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

  async getDatabase() {
    const connection = await this.getConnection();
    return connection.db(this.database);
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
}
