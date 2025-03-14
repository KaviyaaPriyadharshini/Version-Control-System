const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Read a file and return its content.
 * @param {string} filePath - Path to the file.
 * @returns {string|null} - File content or null if not found.
 */
const readFile = (filePath) => {
    try {
        return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : null;
    } catch (error) {
        console.error(`❌ Error reading file: ${filePath} - ${error.message}`);
        return null;
    }
};

/**
 * Write data to a file with atomic updates.
 * @param {string} filePath - Path to the file.
 * @param {string} data - Data to write.
 */
const writeFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, data, 'utf-8');
    } catch (error) {
        console.error(`❌ Error writing to file: ${filePath} - ${error.message}`);
    }
};

/**
 * Append data to a file.
 * @param {string} filePath - Path to the file.
 * @param {string} data - Data to append.
 */
const appendFile = (filePath, data) => {
    try {
        fs.appendFileSync(filePath, data + '\n', 'utf-8');
    } catch (error) {
        console.error(`❌ Error appending to file: ${filePath} - ${error.message}`);
    }
};

/**
 * Ensure a directory exists, creating it if necessary.
 * @param {string} dirPath - Directory path.
 */
const ensureDirectoryExists = (dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (error) {
        console.error(`❌ Error creating directory: ${dirPath} - ${error.message}`);
    }
};

/**
 * Get the SHA-1 or SHA-256 hash of a file.
 * @param {string} filePath - Path to the file.
 * @param {string} [algorithm='sha1'] - Hashing algorithm ('sha1' or 'sha256').
 * @returns {string} - Hash of the file content.
 */
const getFileHash = (filePath, algorithm = 'sha1') => {
    try {
        const content = readFile(filePath) || '';
        return crypto.createHash(algorithm).update(content).digest('hex');
    } catch (error) {
        console.error(`❌ Error generating hash for file: ${filePath} - ${error.message}`);
        return '';
    }
};

/**
 * Copy a file to the staging area (only if changed).
 * @param {string} sourcePath - Original file path.
 * @param {string} stagingPath - Staging directory.
 * @param {string} hash - File hash (used for naming).
 */
const copyFileToStaging = (sourcePath, stagingPath, hash) => {
    try {
        const stagedFilePath = path.join(stagingPath, hash);
        if (!fs.existsSync(stagedFilePath)) {
            fs.copyFileSync(sourcePath, stagedFilePath);
        }
    } catch (error) {
        console.error(`❌ Error staging file: ${sourcePath} - ${error.message}`);
    }
};

/**
 * Delete a file or directory recursively.
 * @param {string} targetPath - Path to the file/directory.
 */
const deleteFileOrDirectory = (targetPath) => {
    try {
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }
    } catch (error) {
        console.error(`❌ Error deleting: ${targetPath} - ${error.message}`);
    }
};

module.exports = {
    readFile,
    writeFile,
    appendFile,
    ensureDirectoryExists,
    getFileHash,
    copyFileToStaging,
    deleteFileOrDirectory
};
