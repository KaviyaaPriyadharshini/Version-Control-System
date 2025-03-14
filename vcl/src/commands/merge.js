const fs = require('fs');
const path = require('path');

module.exports = (args) => {
    if (args.length === 0) {
        console.log('Branch name required.');
        return;
    }

    const repoPath = path.resolve('.vcs');
    const branchName = args[0];
    const branchPath = path.join(repoPath, 'refs', 'heads', branchName);
    
    if (!fs.existsSync(branchPath)) {
        console.log(`Branch ${branchName} not found.`);
        return;
    }

    const currentBranch = fs.readFileSync(path.join(repoPath, 'HEAD'), 'utf-8').trim();
    if (currentBranch === `ref: refs/heads/${branchName}`) {
        console.log('Cannot merge a branch into itself.');
        return;
    }

    const commitHash = fs.readFileSync(branchPath, 'utf-8').trim();
    fs.writeFileSync(path.join(repoPath, 'HEAD'), commitHash);
    console.log(`Merged branch ${branchName} into current branch.`);
};
