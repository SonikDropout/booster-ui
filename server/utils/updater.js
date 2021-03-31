const path = require('path');
const getJSON = require('./getJSON');
const { version, repository } = require('../../package.json');
const { exec } = require('child_process');
const { isPi } = require('../globals');

const cwd = path.join(__dirname, '..', '..');
const linuxGetBranch = 'git rev-parse --abbrev-ref HEAD';
const winGetBranch = 'git branch --show-current';

function getBranchName() {
  return new Promise((resolve, reject) => {
    exec(isPi ? linuxGetBranch : winGetBranch, { cwd }, (err, stdout) => {
      if (err) reject(err);
      resolve(stdout.trim());
    });
  });
}

exports.checkUpdate = async function checkVersions() {
  try {
    const repoName = new URL(repository.url).pathname;
    const branch = await getBranchName();
    const remotePackageInfo = await getJSON({
      hostname: 'raw.githubusercontent.com',
      port: 443,
      path: `${repoName}/${branch}/package.json`,
    });
    const remoteVersion = +remotePackageInfo.version.split('.').join('');
    const currentVersion = +version.split('.').join('');
    return remoteVersion != currentVersion;
  } catch (e) {
    console.error(e.message);
  }
};

exports.update = function update() {
  return new Promise((resolve, reject) => {
    exec(
      `git pull && npm run dev && reboot`,
      {
        cwd,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};
