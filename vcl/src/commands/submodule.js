const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = (args) => {
    if (args.length !== 2) {
        console.log('Usage: vcs submodule add <repo-url> <path>');
        return;
    }

    const [repoUrl, submodulePath] = args;
    const repoPath = path.resolve('.vcs');
    
    if (!fs.existsSync(repoPath)) {
        console.log('Error: Not a valid repository. Run "vcs init" first.');
        return;
    }

    const submoduleFullPath = path.join(repoPath, submodulePath);
    if (fs.existsSync(submoduleFullPath)) {
        console.log('Error: Directory already exists.');
        return;
    }

    console.log(`Adding submodule from ${repoUrl} into ${submodulePath}...`);
    fs.mkdirSync(submoduleFullPath, { recursive: true });
    execSync(`vcs clone ${repoUrl} ${submoduleFullPath}`);
    
    fs.appendFileSync(path.join(repoPath, 'config.json'), `\n{submodule: "${submodulePath}", url: "${repoUrl}"}`);
    console.log('Submodule added successfully.');
};
