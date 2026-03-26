const hashService = require('../services/hash.service');
const minioService = require('../services/minio.service');

const verifyDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File not found" });
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;  
        const hash = hashService.hashDocument(fileBuffer);
 
        const fileExtension = mimeType.split('/')[1]; 
        const minioFileName = `${hash}.${fileExtension}`;
 
        const fileUrl = await minioService.uploadFile(minioFileName, fileBuffer, mimeType);
 
        const currentTimestamp = new Date().toISOString();
 
        res.json({
            status: "success",
            message: "Done",
            fileName: req.file.originalname,
            fileType: mimeType, 
            fileSize: `${(req.file.size / 1024).toFixed(2)} KB`, 
            documentHash: hash,
            fileUrl: fileUrl,           
            timestamp: currentTimestamp 
        });

    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    verifyDocument
};