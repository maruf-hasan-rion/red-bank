import mongoose from 'mongoose';

let connectionPromise;
let listenersAttached = false;

const warnIfStaleBlogIndex = async () => {
  try {
    const indexes = await mongoose.connection.collection('blogs').indexes();

    for (const index of indexes) {
      const keyFields = Object.keys(index.key || {});
      const isUnique = index.unique === true;
      const isIdIndex = keyFields.length === 1 && keyFields[0] === '_id';
      const isPermalinkIndex =
        keyFields.length === 1 && keyFields[0] === 'permalink';

      if (isUnique && !isIdIndex && !isPermalinkIndex) {
        console.warn(
          `[index] Stale unique index "${index.name}" on "${keyFields.join(
            ', '
          )}" found on "blogs". ` +
            'It can cause "A record with this value already exists" on every insert after the first. ' +
            `Drop it with: db.blogs.dropIndex("${index.name}")`
        );
      }
    }
  } catch {
    // Advisory check only — ignore failures.
  }
};

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!listenersAttached) {
    mongoose.connection.on('connected', () => {
      console.log(`MongoDB connected to: ${mongoose.connection.name}`);
      warnIfStaleBlogIndex();
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      connectionPromise = undefined;
    });
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
    listenersAttached = true;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_DB_URI, {
        serverSelectionTimeoutMS: 20000,
        maxPoolSize: 10,
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};
