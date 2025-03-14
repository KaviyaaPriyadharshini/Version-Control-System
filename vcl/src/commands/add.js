const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');  // Allows wildcards (e.g., "*.js")
const { getFileHash, writeFile, copyFileToStaging } = require('../utils/fileHelper');

module.exports = (args) => {
    const repoPath = path.resolve('.vcs');
    if (!fs.existsSync(repoPath)) {
        console.log('❌ No repository found. Run "vcs init" first.');
        return;
    }

    const indexPath = path.join(repoPath, 'index');
    const stagingPath = path.join(repoPath, 'staging');
    
    // Ensure staging directory exists
    if (!fs.existsSync(stagingPath)) fs.mkdirSync(stagingPath, { recursive: true });

    let index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf-8')) : {};

    args.forEach(pattern => {
        // Expand pattern (handles wildcards, directories)
        const files = glob.sync(pattern, { nodir: false });

        if (files.length === 0) {
            console.log(`⚠️ No matching files found for "${pattern}".`);
            return;
        }

        files.forEach(file => {
            const absolutePath = path.resolve(file);

            if (fs.existsSync(absolutePath)) {
                const hash = getFileHash(absolutePath);
                
                // Skip if file is already staged with the same content
                if (index[file] === hash) {
                    console.log(`✔ ${file} already staged (no changes).`);
                    return;
                }

                // Copy to staging area
                copyFileToStaging(absolutePath, stagingPath, hash);

                // Update index
                index[file] = hash;
                console.log(`✅ Staged: ${file}`);
            } else {
                console.log(`❌ File ${file} not found.`);
            }
        });
    });

    // Save updated index
    writeFile(indexPath, JSON.stringify(index, null, 2));
};
