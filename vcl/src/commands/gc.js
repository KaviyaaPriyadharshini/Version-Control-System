const fs = require('fs');
const path = require('path');

module.exports = () => {
    const repoPath = path.resolve('.vcs');
    const objectsPath = path.join(repoPath, 'objects');
    const refsPath = path.join(repoPath, 'refs');

    if (!fs.existsSync(objectsPath)) {
        console.log('No objects found to clean.');
        return;
    }

    // Get all referenced commits
    const referencedCommits = new Set();
    const scanRefs = (dir) => {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                scanRefs(fullPath);
            } else {
                referencedCommits.add(fs.readFileSync(fullPath, 'utf-8').trim());
            }
        });
    };

    scanRefs(refsPath);

    // Get all stored commits
    const allCommits = new Set(fs.readdirSync(objectsPath));

    // Identify orphaned commits
    const orphanedCommits = [...allCommits].filter(commit => !referencedCommits.has(commit));

    if (orphanedCommits.length === 0) {
        console.log('No orphaned commits found.');
        return;
    }

    // Delete orphaned commits
    orphanedCommits.forEach(commit => {
        fs.unlinkSync(path.join(objectsPath, commit));
    });

    console.log(`Garbage collection completed. Removed ${orphanedCommits.length} unreachable commits.`);
};
