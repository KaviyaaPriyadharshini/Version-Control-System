const fs = require('fs');
const path = require('path');
const { readFile, getFileHash } = require('../utils/fileHelper');

module.exports = () => {
    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('Not a repository. Run "vcs init" first.');
        return;
    }

    const indexPath = path.join(repoPath, 'index');
    if (!fs.existsSync(indexPath)) {
        console.log('No files added to staging.');
        return;
    }

    const index = JSON.parse(readFile(indexPath));
    let modifiedFiles = [];
    let untrackedFiles = [];

    for (const file in index) {
        if (!fs.existsSync(file)) {
            console.log(`Deleted: ${file}`);
            continue;
        }
        if (getFileHash(file) !== index[file]) {
            modifiedFiles.push(file);
        }
    }

    fs.readdirSync('.').forEach(file => {
        if (!index[file] && fs.lstatSync(file).isFile()) {
            untrackedFiles.push(file);
        }
    });

    if (modifiedFiles.length) {
        console.log('Modified files:');
        modifiedFiles.forEach(f => console.log(`  ${f}`));
    }
    if (untrackedFiles.length) {
        console.log('Untracked files:');
        untrackedFiles.forEach(f => console.log(`  ${f}`));
    }
};
