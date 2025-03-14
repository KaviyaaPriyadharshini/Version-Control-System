const fs = require('fs');
const path = require('path');
const { applyCommit, hasUncommittedChanges, resolveConflicts } = require('../utils/mergeHelper');
const { readFile, writeFile } = require('../utils/fileHelper');

const CHERRY_PICK_STATE_PATH = path.resolve('.vcs', 'cherry-pick-state.json');

module.exports = (args) => {
    const repoPath = path.resolve('.vcs');

    if (!fs.existsSync(repoPath)) {
        console.log('❌ No repository found. Run "vcs init" first.');
        return;
    }

    if (args.length === 0) {
        console.log('⚠️ Please provide a commit hash or use --continue / --abort.');
        return;
    }

    const option = args[0];

    // Continue cherry-pick after resolving conflicts
    if (option === '--continue') {
        if (!fs.existsSync(CHERRY_PICK_STATE_PATH)) {
            console.log('❌ No cherry-pick in progress.');
            return;
        }

        const cherryPickState = JSON.parse(readFile(CHERRY_PICK_STATE_PATH));
        if (resolveConflicts(cherryPickState.commitHash)) {
            console.log(`✅ Cherry-pick of ${cherryPickState.commitHash} completed.`);
            fs.unlinkSync(CHERRY_PICK_STATE_PATH); // Remove cherry-pick state
        } else {
            console.log(`⚠️ Unresolved conflicts remain. Please resolve them and run "vcs cherry-pick --continue".`);
        }
        return;
    }

    // Abort cherry-pick
    if (option === '--abort') {
        if (fs.existsSync(CHERRY_PICK_STATE_PATH)) {
            fs.unlinkSync(CHERRY_PICK_STATE_PATH);
            console.log('❌ Cherry-pick aborted.');
        } else {
            console.log('⚠️ No cherry-pick in progress.');
        }
        return;
    }

    // Regular cherry-pick operation
    const commitHash = option;
    const commitPath = path.join(repoPath, 'objects', commitHash);

    if (!fs.existsSync(commitPath)) {
        console.log(`❌ Commit ${commitHash} not found.`);
        return;
    }

    // Ensure there are no uncommitted changes before cherry-picking
    if (hasUncommittedChanges()) {
        console.log('⚠️ You have uncommitted changes. Please commit or stash them before cherry-picking.');
        return;
    }

    console.log(`🔄 Cherry-picking commit ${commitHash}...`);

    const success = applyCommit(commitHash);
    if (success) {
        console.log(`✅ Successfully applied commit ${commitHash}`);
    } else {
        console.log(`⚠️ Conflict detected in commit ${commitHash}. Resolve conflicts and run "vcs cherry-pick --continue".`);
        writeFile(CHERRY_PICK_STATE_PATH, JSON.stringify({ commitHash }));
    }
};
