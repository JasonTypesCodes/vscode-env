const execSync = require('child_process').execSync;
const fs = require('fs')
const path = require('path');
const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const extensionsFile = path.join(__dirname, 'my.extensions');

function doInstall(packagesToInstall) {
  doSomething(packagesToInstall, '--install-extension', 'install');
}

function doRemove(packagesToRemove) {
  doSomething(packagesToRemove, '--uninstall-extension', 'remove');
}

function doSomething(packages, commandSwitch, description) {
  if(packages.length > 0) {
    const command = packages
      .reduce((result, item) => `${result} ${commandSwitch} ${item}`, 'code');
  
    execSync(command, {stdio: [process.stdin, process.stdout, process.stderr]});
  } else {
    console.log(`Nothing to ${description}!`);
  }
}

function updateMyExtensions() {
  console.log('Updating my.extensions...');
  execSync('code --list-extensions > my.extensions', {stdio: [process.stdin, process.stdout, process.stderr]});
}

function start(packagesToRemove, packagesToInstall) {
  doRemove(packagesToRemove);
  doInstall(packagesToInstall);
  updateMyExtensions();
  console.log('Done!');
  rl.close();
}

const installedPackages = execSync('code --list-extensions').toString()
  .split('\n')
  .map((item) => item.trim())
  .filter((item) => !!item);

const desiredPackages = fs.readFileSync(extensionsFile, {encoding: 'utf-8'})
  .split('\n')
  .map((item) => item.trim())
  .filter((item) => !!item);

const packagesToRemove = installedPackages
  .filter((item) => desiredPackages.indexOf(item) < 0);

const packagesToInstall = desiredPackages
  .filter((item) => installedPackages.indexOf(item) < 0);

if(packagesToRemove.length > 0){
  console.log('\nPackages flagged for removal:');
  packagesToRemove.forEach((item) => {
    console.log(`== ${item}`);
  });

  rl.question('Do you want to remove these packages? (Y/n):', (answer) => {
    
    answer = answer ? answer.trim().toLowerCase() : 'y';
    
    if(answer === 'y') {
      start(packagesToRemove, packagesToInstall);
    } else {
      start([], packagesToInstall);
    }
    
  });
} else {
  start(packagesToRemove, packagesToInstall);
}
