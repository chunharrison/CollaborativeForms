require('dotenv').config(); // Loading dotenv to have access to env variables
const AWS = require('aws-sdk'); // Requiring AWS SDK.

// Configuring AWS
AWS.config = new AWS.Config({
  accessKeyId: process.env.S3_BUCKET_ACCESS_KEY, // stored in the .env file
  secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY, // stored in the .env file
  region: process.env.S3_BUCKET_REGION // This refers to your bucket configuration.
});

// Creating a S3 instance
const s3 = new AWS.S3({
    region: process.env.S3_BUCKET_REGION,
    endpoint: "us-east-1.linodeobjects.com",
    apiVersion: "2006-03-01",
    credentials: new AWS.Credentials({
      accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
      secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY
    })
});
// Retrieving the bucket name from env variable
const Bucket = process.env.S3_BUCKET_NAME;

// In order to create pre-signed GET adn PUT URLs we use the AWS SDK s3.getSignedUrl method.
// getSignedUrl(operation, params, callback) ⇒ String

// GET URL Generator
function generateGetUrl(Key) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket,
      Key,
      Expires: 120 // 2 minutes
    };
    // Note operation in this case is getObject
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        reject(err);
      } else {
        // If there is no errors we will send back the pre-signed GET URL
        resolve(url);
      }
    });
  });
}

// PUT URL Generator
function generatePutUrl(Key, ContentType) {
    console.log(Key);
  return new Promise((resolve, reject) => {
    // Note Bucket is retrieved from the env variable above.
    const params = { Bucket, Key, ContentType };
    // Note operation in this case is putObject
    s3.getSignedUrl('putObject', params, function(err, url) {
      if (err) {
        reject(err);
      }
      // If there is no errors we can send back the pre-signed PUT URL
      resolve(url);
    });
  });
}

// Finally, we export the methods so we can use it in our main application.
module.exports = { generateGetUrl, generatePutUrl };