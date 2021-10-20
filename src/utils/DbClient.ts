import { Db, MongoClient, Filter, FindOptions } from "mongodb";

class DbClient {
  private cachedDb: Db | null = null;
  private client: MongoClient | null = null;

  private async connect(): Promise<Db> {
    if (this.cachedDb && this.client) {
      return Promise.resolve(this.cachedDb);
    }

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
}

export default new DbClient();
