#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Command Imports
const init = require('./src/commands/init');
const add = require('./src/commands/add');
const commit = require('./src/commands/commit');
const status = require('./src/commands/status');
const log = require('./src/commands/log');
const branch = require('./src/commands/branch');
const checkout = require('./src/commands/checkout');
const merge = require('./src/commands/merge');
const stash = require('./src/commands/stash');
const tag = require('./src/commands/tag');
const revert = require('./src/commands/revert');
const rebase = require('./src/commands/rebase');
const cherryPick = require('./src/commands/cherry-pick');
const clone = require('./src/commands/clone');
const pull = require('./src/commands/pull');
const push = require('./src/commands/push');
const submodule = require('./src/commands/submodule');
const bisect = require('./src/commands/bisect');
const sparseCheckout = require('./src/commands/sparse-checkout');
const gc = require('./src/commands/gc');

const command = process.argv[2];
const args = process.argv.slice(3);

// CLI command routing
switch (command) {
    case 'init': init(); break;
    case 'add': add(args); break;
    case 'commit': commit(args); break;
    case 'status': status(); break;
    case 'log': log(); break;
    case 'branch': branch(args); break;
    case 'checkout': checkout(args); break;
    case 'merge': merge(args); break;
    case 'stash': stash(args); break;
    case 'tag': tag(args); break;
    case 'revert': revert(args); break;
    case 'rebase': rebase(args); break;
    case 'cherry-pick': cherryPick(args); break;
    case 'clone': clone(args); break;
    case 'pull': pull(args); break;
    case 'push': push(args); break;
    case 'submodule': submodule(args); break;
    case 'bisect': bisect(args); break;
    case 'sparse-checkout': sparseCheckout(args); break;
    case 'gc': gc(); break;
    default:
        console.log(`Unknown command: ${command}`);
        console.log('Available commands: init, add, commit, status, log, branch, checkout, merge, stash, tag, revert, rebase, cherry-pick, clone, pull, push, submodule, bisect, sparse-checkout, gc');
        process.exit(1);
}
