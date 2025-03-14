const fs = require('fs');
const path = require('path');

module.exports = () => {
    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('No repository found. Run "vcs init".');
        return;
    }

    const objectDir = path.join(repoPath, 'objects');
    const commits = fs.readdirSync(objectDir);

    if (commits.length === 0) {
        console.log('No commits yet.');
        return;
    }

    commits.forEach(commit => {
        const commitData = JSON.parse(fs.readFileSync(path.join(objectDir, commit), 'utf-8'));
        console.log(`Commit: ${commit}`);
        console.log(`Message: ${commitData.message}`);
        console.log(`Timestamp: ${commitData.timestamp}\n`);
    });
};
