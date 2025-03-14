const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { getCommitsBetween, checkoutCommit } = require('../utils/mergeHelper');

const repoPath = path.resolve('.vcs');
const bisectStateFile = path.join(repoPath, 'bisect.json');

/**
 * Prompts the user for input synchronously.
 * @param {string} question - The question to ask.
 * @returns {Promise<string>} - User input.
 */
const promptUser = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(question, answer => {
        rl.close();
        resolve(answer.trim().toLowerCase());
    }));
};

/**
 * Saves bisect state to a file.
 * @param {Array<string>} commits - List of commits to bisect.
 */
const saveBisectState = (commits) => {
    fs.writeFileSync(bisectStateFile, JSON.stringify({ commits, left: 0, right: commits.length - 1 }, null, 2));
};

/**
 * Loads the bisect state from a file.
 * @returns {object|null} - The bisect state or null if not found.
 */
const loadBisectState = () => {
    if (fs.existsSync(bisectStateFile)) {
        return JSON.parse(fs.readFileSync(bisectStateFile, 'utf-8'));
    }
    return null;
};

/**
 * Clears the bisect state.
 */
const clearBisectState = () => {
    if (fs.existsSync(bisectStateFile)) {
        fs.unlinkSync(bisectStateFile);
    }
};

/**
 * Runs the bisect search interactively.
 * @param {Array<string>} commits - List of commits.
 */
const bisectSearch = async (commits) => {
    let state = loadBisectState() || { commits, left: 0, right: commits.length - 1 };

    while (state.left <= state.right) {
        const mid = Math.floor((state.left + state.right) / 2);
        const commit = state.commits[mid];

        console.log(`🔍 Checking commit: ${commit}`);
        checkoutCommit(commit);

        let userInput = await promptUser('Is this commit bad? (yes/no/exit): ');

        if (userInput === 'exit') {
            saveBisectState(state);
            console.log('⚠️ Bisect session saved. Resume later with "vcs bisect resume".');
            return;
        } else if (userInput === 'yes') {
            state.right = mid - 1;
        } else if (userInput === 'no') {
            state.left = mid + 1;
        } else {
            console.log('❌ Invalid input. Please enter "yes", "no", or "exit".');
            continue;
        }
    }

    console.log(`✅ First bad commit found: ${state.commits[state.left]}`);
    clearBisectState();
};

module.exports = async (args) => {
    if (!fs.existsSync(repoPath)) {
        console.log('❌ No repository found. Run "vcs init" first.');
        return;
    }

    if (args[0] === 'resume') {
        const state = loadBisectState();
        if (!state) {
            console.log('❌ No ongoing bisect session found.');
            return;
        }
        await bisectSearch(state.commits);
        return;
    }

    if (args.length !== 2) {
        console.log('Usage: vcs bisect <good-commit> <bad-commit> or vcs bisect resume');
        return;
    }

    const [goodCommit, badCommit] = args;
    const commits = getCommitsBetween(goodCommit, badCommit);

    if (commits.length === 0) {
        console.log('⚠️ No commits to bisect.');
        return;
    }

    console.log(`🔍 Starting bisect from ${goodCommit} to ${badCommit}...`);
    saveBisectState(commits);
    await bisectSearch(commits);
};
