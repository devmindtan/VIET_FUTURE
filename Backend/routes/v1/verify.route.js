const express = require('express');
const router = express.Router();
const multer = require('multer');

const uploadMiddleware = require('../../middlewares/upload.middleware');
const verifyController = require('../../controllers/verify.controller');

const upload = uploadMiddleware.single('file');

router.post('/verify', (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                error: "Lỗi đính kèm file!", 
                detail: `Error: ${err.message}. ` 
            });
        } else if (err) { 
            return res.status(400).json({ 
                error: "File không hợp lệ!", 
                detail: err.message 
            });
        } 
        next();
    });
}, verifyController.verifyDocument);

module.exports = router;