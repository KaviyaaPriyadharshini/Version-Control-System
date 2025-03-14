const fs = require('fs');
const path = require('path');
const { readFile, writeFile } = require('../utils/fileHelper');

module.exports = () => {
    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('No repository found.');
        return;
    }

    const indexPath = path.join(repoPath, 'index');
    if (!fs.existsSync(indexPath)) {
        console.log('Nothing to stash.');
        return;
    }

    const stashPath = path.join(repoPath, 'stash');
    let stashes = fs.existsSync(stashPath) ? JSON.parse(readFile(stashPath)) : [];

    stashes.push({ timestamp: new Date(), index: readFile(indexPath) });
    writeFile(stashPath, JSON.stringify(stashes, null, 2));

    fs.unlinkSync(indexPath);
    console.log('Changes stashed.');
};
