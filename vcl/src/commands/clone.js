const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

module.exports = async (args) => {
    if (args.length !== 2) {
        console.log('Usage: vcs clone <repo-url> <destination>');
        return;
    }

    const [repoUrl, destination] = args;
    if (fs.existsSync(destination)) {
        console.log(`Error: Directory "${destination}" already exists.`);
        return;
    }

    console.log(`Cloning ${repoUrl} into ${destination}...`);
    fs.mkdirSync(destination, { recursive: true });

    try {
        const response = await axios.get(`${repoUrl}/refs`);
        const branches = response.data;

        fs.mkdirSync(path.join(destination, '.vcs'), { recursive: true });
        fs.writeFileSync(path.join(destination, '.vcs', 'config.json'), JSON.stringify({ remote: repoUrl }, null, 2));
        fs.mkdirSync(path.join(destination, '.vcs', 'refs', 'heads'), { recursive: true });

        for (const branch of branches) {
            fs.writeFileSync(path.join(destination, '.vcs', 'refs', 'heads', branch.name), branch.commit);
        }

        execSync(`cp -r ${repoUrl}/objects ${destination}/.vcs/`);
        console.log('Repository cloned successfully.');
    } catch (error) {
        console.error('Failed to clone repository:', error.message);
    }
};
