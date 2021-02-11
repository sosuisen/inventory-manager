import packager from 'electron-packager';
import electronRebuild from 'electron-rebuild';
import electronInstaller from 'electron-winstaller';
import packageJson from './package.json';

const createInstaller = async () => {

  // Enter app name without dashes & spaces",
  const name = 'InventoryManager';

  // Default App icon
  // If the file extension of icon is omitted, its is auto-completed to the correct extension based on the platform.
  const icon = 'assets/inventory_manager_icon'; 
  
  // A URL to an ICO file displayed in Control Panel > Programs and Features
  // Defaults to the Atom icon.
  // iconUrl must be a url that start with http or https. Squirrel cannot accept a local file.
  const iconUrl = 'https://raw.githubusercontent.com/sosuisen/inventory-manager/main/assets/inventory_manager_icon.ico';
  
  const copyright = 'Copyright(C) 2021 Hidekazu Kubota';

  await packager({
    dir: '.',
    name: name,
    appCopyright: copyright,
    asar: true,
    icon: icon,
    overwrite: true,
    ignore: ['^(\/html|\/installer|\/inventory_manager_data|\/out|\/src)', '\.vscode|\.eslint.*|\.gitignore|tsconfig.*|webpack.*|packager.mjs|package-lock.json|config.json|README.md'],
    win32metadata: {
      ProductName: packageJson.productName,
      FileDescription: packageJson.productName,
    },
    // … other options
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      electronRebuild.rebuild({ buildPath, electronVersion, arch })
        .then(() => callback())
        .catch((error) => callback(error));
    }],
  
  }).catch(e => console.log(`Error in Packager: ${e.message}`));

  console.log('Building installer...');
  await electronInstaller.createWindowsInstaller({
      appDirectory: './InventoryManager-win32-x64',
      outputDirectory: './installer/',
      title: name,
      name: name, // name must be without - (dashes). See https://github.com/electron/windows-installer/issues/264
      exe: `${name}.exe`,
      iconUrl: iconUrl, // icon 
      setupExe: `${name}-${packageJson.version}-Setup.exe`,
      noMsi: true
    }).catch (e => console.log(`Error in Windows Installer: ${e.message}`));
};

createInstaller();
