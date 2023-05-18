import mongoose from 'mongoose';

class Database {
  url: string;

  private _connection?: Awaited<ReturnType<typeof mongoose.connect>>;

  constructor({url}: {url: string}) {
    this.url = url;

    this.connect();
  }

  get connection() {
    return this._connection;
  }

  private async connect() {
    if (this.connection != null) {
      return;
    }

    let connection: Awaited<ReturnType<typeof mongoose.connect>>;
    try {
      connection = await mongoose.connect(this.url);
    } catch (error) {
      console.error('connection error:', error);
      return;
    }

    this._connection = connection;
    console.log('database connection successful');
  }
}

export default Database;
