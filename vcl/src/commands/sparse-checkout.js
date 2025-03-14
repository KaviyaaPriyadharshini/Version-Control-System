const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = async (args) => {
    if (args.length === 0) {
        console.log('Usage: vcs sparse-checkout <file-path> [file-path2] ...');
        return;
    }

    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('Error: Not a valid repository. Run "vcs init" first.');
        return;
    }

    const config = JSON.parse(fs.readFileSync(path.join(repoPath, 'config.json')));
    const remoteUrl = config.remote;
    
    console.log('Fetching selected files...');
    
    for (const filePath of args) {
        try {
            const response = await axios.get(`${remoteUrl}/files/${filePath}`);
            const localFilePath = path.join(repoPath, filePath);

            fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
            fs.writeFileSync(localFilePath, response.data);
            console.log(`✔ Fetched: ${filePath}`);
        } catch (error) {
            console.error(`✖ Error fetching ${filePath}:`, error.message);
        }
    }
    
    console.log('Sparse checkout complete.');
};
