const minioClient = require('../config/minio');
require('dotenv').config();

const uploadFile = async (fileName, fileBuffer, mimeType) => {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    
    const metaData = {
        'Content-Type': mimeType,
    };

    await minioClient.putObject(bucketName, fileName, fileBuffer, fileBuffer.length, metaData);
    
    return `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${fileName}`;
};

module.exports = {
    uploadFile
};