const fs = require('fs');
const path = require('path');
const { ensureDirectoryExists } = require('../utils/fileHelper');

module.exports = () => {
    const repoPath = path.resolve('.vcs');
    if (fs.existsSync(repoPath)) {
        console.log('Repository already initialized.');
        return;
    }

    // Create necessary directories
    ensureDirectoryExists(repoPath);
    ensureDirectoryExists(path.join(repoPath, 'objects'));
    ensureDirectoryExists(path.join(repoPath, 'refs', 'heads'));

    // Create HEAD reference
    fs.writeFileSync(path.join(repoPath, 'HEAD'), 'ref: refs/heads/main\n', 'utf-8');

    console.log('Initialized an empty repository in .vcs/');
};
