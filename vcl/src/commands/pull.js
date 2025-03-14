const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { mergeBranches } = require('../utils/mergeHelper');

module.exports = async () => {
    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('Error: Not a valid repository. Run "vcs init" first.');
        return;
    }

    const config = JSON.parse(fs.readFileSync(path.join(repoPath, 'config.json')));
    const remoteUrl = config.remote;
    const currentBranch = fs.readFileSync(path.join(repoPath, 'HEAD'), 'utf-8').trim().split('/').pop();
    const localCommit = fs.readFileSync(path.join(repoPath, 'refs', 'heads', currentBranch), 'utf-8').trim();

    try {
        const response = await axios.get(`${remoteUrl}/refs/heads/${currentBranch}`);
        const remoteCommit = response.data.commit;

        if (localCommit === remoteCommit) {
            console.log('Already up to date.');
            return;
        }

        console.log(`Merging changes from remote branch ${currentBranch}...`);
        if (mergeBranches(localCommit, remoteCommit)) {
            fs.writeFileSync(path.join(repoPath, 'refs', 'heads', currentBranch), remoteCommit);
            console.log('Pull completed successfully.');
        } else {
            console.log('Merge conflict detected. Resolve conflicts and run "vcs commit".');
        }
    } catch (error) {
        console.error('Failed to pull from remote repository:', error.message);
    }
};
