import { MongoClient } from "mongodb";

class DbClient {
  constructor() {
    this.cachedDb = null;
    this.client = null;
  }

  async connect() {
    if (this.cachedDb && this.client) {
      return Promise.resolve(this.cachedDb);
    }

    this.client = await MongoClient.connect(process.env.MONGO_URI);
    this.cachedDb = this.client.db();

    return Promise.resolve(this.cachedDb);
  }

  /**
   * Perform a find operation on a mongo collection.
   *
   * @param {string} collection The collection to query.
   * @param {import("mongodb").Filter<Document>} filter Filters to apply.
   * @param {import("mongodb").FindOptions<Document>} options Options to add to the query.
   */
  async find(collection, filter, options, skip = 0, limit = 0) {
    const db = await this.connect();
    const cursor = db.collection(collection).find(filter, options);

    return {
      totalItems: await cursor.count(),
      items: await cursor.skip(skip).limit(limit).toArray(),
    };
  }
}

export default new DbClient();
