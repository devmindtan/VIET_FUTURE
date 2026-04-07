const { ethers } = require('ethers');

/**
 * @param {Buffer} fileBuffer
 * @returns {string}
 */
const hashDocument = (fileBuffer) => {
    const hash = ethers.keccak256(fileBuffer);
    return hash;
};

module.exports = {
    hashDocument
};