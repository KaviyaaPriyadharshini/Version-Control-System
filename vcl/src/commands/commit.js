const fs = require('fs');
const path = require('path');
const { readFile, writeFile } = require('../utils/fileHelper');

module.exports = (args) => {
    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('No repository found. Run "vcs init" first.');
        return;
    }

    const indexPath = path.join(repoPath, 'index');
    if (!fs.existsSync(indexPath)) {
        console.log('Nothing to commit.');
        return;
    }

    const message = args.join(' ');
    if (!message) {
        console.log('Commit message is required.');
        return;
    }

    const commitHash = Date.now().toString(36);  // Temporary hash (Replace with SHA-1)
    const commitPath = path.join(repoPath, 'objects', commitHash);
    
    // Save commit data
    writeFile(commitPath, JSON.stringify({ message, timestamp: new Date(), index: readFile(indexPath) }));
    
    // Update HEAD
    const headPath = path.join(repoPath, 'HEAD');
    writeFile(headPath, commitHash);

    console.log(`Committed with hash ${commitHash}`);
};
