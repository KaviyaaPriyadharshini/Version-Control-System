const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

    console.log(`Pushing changes from ${currentBranch} to remote...`);
    
    try {
        await axios.post(`${remoteUrl}/update`, { branch: currentBranch, commit: localCommit });
        console.log('Push completed successfully.');
    } catch (error) {
        console.error('Failed to push to remote repository:', error.message);
    }
};
