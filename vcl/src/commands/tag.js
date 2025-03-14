const fs = require('fs');
const path = require('path');

module.exports = (args) => {
    if (args.length < 1) {
        console.log('Tag name required.');
        return;
    }

    const repoPath = path.resolve('.vcs');
    const tagName = args[0];
    const headCommit = fs.readFileSync(path.join(repoPath, 'HEAD'), 'utf-8').trim();

    const tagsDir = path.join(repoPath, 'refs', 'tags');
    if (!fs.existsSync(tagsDir)) {
        fs.mkdirSync(tagsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(tagsDir, tagName), headCommit);
    console.log(`Tag ${tagName} created at commit ${headCommit}`);
};
