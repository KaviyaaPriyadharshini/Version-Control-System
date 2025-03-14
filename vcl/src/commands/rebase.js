const fs = require('fs');
const path = require('path');
const { getCommitsBetween, applyCommit } = require('../utils/mergeHelper');

module.exports = (args) => {
    if (args.length !== 1) {
        console.log('Usage: vcs rebase <target-branch>');
        return;
    }

    const repoPath = path.resolve('.vcs');
    const targetBranch = args[0];
    const targetPath = path.join(repoPath, 'refs', 'heads', targetBranch);

    if (!fs.existsSync(targetPath)) {
        console.log(`Branch "${targetBranch}" not found.`);
        return;
    }

    const headBranch = fs.readFileSync(path.join(repoPath, 'HEAD'), 'utf-8').trim().split('/').pop();
    if (headBranch === targetBranch) {
        console.log('Cannot rebase onto the same branch.');
        return;
    }

    const headCommit = fs.readFileSync(path.join(repoPath, 'refs', 'heads', headBranch), 'utf-8').trim();
    const targetCommit = fs.readFileSync(targetPath, 'utf-8').trim();

    console.log(`Rebasing ${headBranch} onto ${targetBranch}...`);
    const commitsToReapply = getCommitsBetween(targetCommit, headCommit);

    for (const commit of commitsToReapply) {
        if (!applyCommit(commit)) {
            console.log(`Conflict detected in commit ${commit}. Resolve it and run "vcs rebase --continue"`);
            return;
        }
    }

    fs.writeFileSync(path.join(repoPath, 'refs', 'heads', headBranch), targetCommit);
    console.log(`Successfully rebased ${headBranch} onto ${targetBranch}`);
};
