const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { applyPatch } = require('../utils/diffChecker');

module.exports = (args) => {
    if (args.length !== 1) {
        console.log('Usage: vcs revert <commit-hash>');
        return;
    }

    const commitHash = args[0];
    const repoPath = path.resolve('.vcs');
    
    if (!fs.existsSync(repoPath)) {
        console.log('Error: Not a valid repository. Run "vcs init" first.');
        return;
    }

    const commitsPath = path.join(repoPath, 'commits');
    const commitFile = path.join(commitsPath, `${commitHash}.json`);

    if (!fs.existsSync(commitFile)) {
        console.log('Error: Commit not found.');
        return;
    }

    console.log(`Reverting commit ${commitHash}...`);
    
    const commitData = JSON.parse(fs.readFileSync(commitFile, 'utf-8'));
    const inversePatch = commitData.changes.map(change => ({
        file: change.file,
        content: change.oldContent, // Revert to the previous content
    }));

    inversePatch.forEach(change => {
        applyPatch(change.file, change.content);
    });

    const newCommitHash = execSync('uuidgen').toString().trim();
    fs.writeFileSync(path.join(commitsPath, `${newCommitHash}.json`), JSON.stringify({
        message: `Revert: ${commitData.message}`,
        changes: inversePatch
    }, null, 2));

    console.log(`Revert completed. New commit created: ${newCommitHash}`);
};
