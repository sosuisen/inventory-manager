import packager from 'electron-packager';
import { rebuild } from 'electron-rebuild';
import electronInstaller from 'electron-winstaller';

const createInstaller = async () => {

  // Enter app name without dashes & spaces",
  const name = 'InventoryManager';

  await packager({
    dir: '.',
    name: name,
    appCopyright: "Copyright(C) 2021 Hidekazu Kubota",
    asar: true,
    icon: "assets/inventory_manager_icon",
    overwrite: true,
    ignore: ['^(\/html|\/installer|\/inventory_manager_data|\/out|\/src)', '\.vscode|\.eslint.*|\.gitignore|tsconfig.*|webpack.*|packager.mjs|package-lock.json|config.json|README.md'],
    win32metadata: {
      ProductName: "Inventory Manager",
      FileDescription: "Inventory Manager"
    },
    // … other options
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      rebuild({ buildPath, electronVersion, arch })
        .then(() => callback())
        .catch((error) => callback(error));
    }],
  
  }).catch(e => console.log(`Error in Packager: ${e.message}`));

  console.log('Building installer...');
  await electronInstaller.createWindowsInstaller({
      appDirectory: './InventoryManager-win32-x64',
      outputDirectory: './installer/',
      title: name,
      exe: name + '.exe',
    }).catch (e => console.log(`Error in Windows Installer: ${e.message}`));
};

createInstaller();
