import { Db, MongoClient, Filter, FindOptions, Document, MatchKeysAndValues } from "mongodb";

class DbClient {
  private cachedDb: Db | null = null;
  private client: MongoClient | null = null;

  private async connect(): Promise<Db> {
    if (this.cachedDb && this.client) return Promise.resolve(this.cachedDb);

    this.client = await MongoClient.connect(process.env.MONGO_URI || "");
    this.cachedDb = this.client.db();

    return Promise.resolve(this.cachedDb);
  }

  /**
   * Perform a find operation on a mongo collection.
   */
  public async find<T>(
    collection: string,
    filter: Filter<T> = {},
    options: FindOptions,
    skip = 0,
    limit = 0,
  ): Promise<{ totalItems: number; items: T[] }> {
    const db = await this.connect();
    const cursor = db.collection<T>(collection).find<T>(filter, options);

    return {
      totalItems: await cursor.count(),
      items: await cursor.skip(skip).limit(limit).toArray(),
    };
  }

  /**
   * Perform a find operation on a mongo collection.
   */
  public async findOne<T>(
    collection: string,
    filter: Filter<T> = {},
    options: FindOptions,
  ): Promise<T | null> {
    const db = await this.connect();
    const document = db.collection<T>(collection).findOne<T>(filter, options);

    return document;
  }

  /**
   * Inserts a document
   *
   * @param collection The collection to update
   * @param document The document to insert
   */
  public async insertOne(collection: string, document: Document): Promise<string> {
    const db = await this.connect();

    const result = await db.collection(collection).insertOne(document);

    if (!result.acknowledged) throw new Error(`${document} could not be written to ${collection}.`);

    return result.insertedId.toString();
  }

  /**
   * Updates a document.
   * Currently does not accept options.
   *
   * @param collection The collection to update
   * @param filter Field(s) to filter by
   * @param updates Keys and values to update
   */
  public async updateOne<T>(collection: string, filter: Filter<T>, updates: MatchKeysAndValues<T>) {
    const db = await this.connect();

    const result = await db
      .collection<T>(collection)
      .updateOne(filter, { $set: updates }, { upsert: false });

    if (!result.acknowledged) throw new Error(`updates could not be written to ${collection}.`);
  }
}

export default new DbClient();

// add aggregate function