const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Basic schema with only type checking
const basicSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["taskId", "walletAddress", "submissions"],
    properties: {
      id: { bsonType: "string" },
      taskId: { bsonType: "string" },
      walletAddress: { bsonType: "string" },
      submissions: { 
        bsonType: "array", 
        items: { bsonType: "string" }
      },
      grading: { 
        bsonType: ["int", "null"]
      },
      isAccepted: { 
        bsonType: "bool"
      }
    }
  }
};

async function updateSchema() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI_PROD);
    logger.info('Connected to MongoDB');
    logger.info('Database:', mongoose.connection.db.databaseName);

    // Get the database and collection
    const db = mongoose.connection.db;
    const collection = db.collection('submissions');

    // First, get the current schema
    logger.info('Checking current schema...');
    const collectionInfo = await collection.options();
    logger.info('Current collection info:', JSON.stringify(collectionInfo, null, 2));

    // Update the collection validation rules
    logger.info('Updating collection validation rules...');
    await db.command({
      collMod: "submissions",
      validator: basicSchema,
      validationLevel: "strict",
      validationAction: "error"
    });

    // Verify the update
    logger.info('Verifying updated schema...');
    const updatedCollectionInfo = await collection.options();
    logger.info('Updated collection info:', JSON.stringify(updatedCollectionInfo, null, 2));
    logger.info('Schema updated successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error updating schema:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  }
}

// Run the update
updateSchema(); 