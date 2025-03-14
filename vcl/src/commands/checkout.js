const fs = require('fs');
const path = require('path');
const { readFile, writeFile, ensureDirectoryExists } = require('../utils/fileHelper');

module.exports = (args) => {
    const repoPath = path.resolve('.vcs');
    const refsPath = path.join(repoPath, 'refs', 'heads');
    const headPath = path.join(repoPath, 'HEAD');
    const indexPath = path.join(repoPath, 'index');

    if (!fs.existsSync(repoPath)) {
        console.log('❌ No repository found. Run "vcs init" first.');
        return;
    }

    if (args.length === 0) {
        console.log('⚠️ Please provide a branch name or commit hash.');
        return;
    }

    const option = args[0];

    // Handle new branch creation
    if (option === '-b') {
        if (args.length < 2) {
            console.log('❌ Please provide a branch name for the new branch.');
            return;
        }
        const newBranch = args[1];
        const newBranchPath = path.join(refsPath, newBranch);

        if (fs.existsSync(newBranchPath)) {
            console.log(`⚠️ Branch '${newBranch}' already exists.`);
            return;
        }

        ensureDirectoryExists(refsPath);
        const currentCommit = readFile(headPath).trim().split(' ')[1]; // Get current commit
        writeFile(newBranchPath, currentCommit);
        writeFile(headPath, `ref: refs/heads/${newBranch}\n`);

        console.log(`✅ Created and switched to new branch '${newBranch}'`);
        return;
    }

    const branchPath = path.join(refsPath, option);
    const commitPath = path.join(repoPath, 'objects', option);

    // Handle branch switching
    if (fs.existsSync(branchPath)) {
        const commitHash = readFile(branchPath).trim();
        writeFile(headPath, `ref: refs/heads/${option}\n`);
        restoreWorkingDirectory(commitHash);
        console.log(`✅ Switched to branch '${option}'`);
    }
    // Handle detached HEAD state (checkout specific commit)
    else if (fs.existsSync(commitPath)) {
        writeFile(headPath, option);
        restoreWorkingDirectory(option);
        console.log(`⚠️ HEAD is now in a detached state at ${option}`);
    }
    else {
        console.log(`❌ Branch or commit '${option}' not found.`);
    }
};

/**
 * Restores the working directory to match the given commit.
 * @param {string} commitHash - The commit hash to restore.
 */
const restoreWorkingDirectory = (commitHash) => {
    const repoPath = path.resolve('.vcs');
    const commitPath = path.join(repoPath, 'objects', commitHash);
    const indexPath = path.join(repoPath, 'index');

    if (!fs.existsSync(commitPath)) {
        console.log(`⚠️ Commit '${commitHash}' not found.`);
        return;
    }

    // Load commit data
    const commitData = JSON.parse(fs.readFileSync(commitPath, 'utf-8'));
    const trackedFiles = commitData.trackedFiles || {};

    // Restore files from commit
    Object.keys(trackedFiles).forEach(file => {
        const filePath = path.resolve(file);
        fs.writeFileSync(filePath, trackedFiles[file], 'utf-8');
    });

    // Update index file
    writeFile(indexPath, JSON.stringify(trackedFiles, null, 2));
};
