import packager from 'electron-packager';
import { rebuild } from 'electron-rebuild';

packager({
  dir: '.',
  name: 'InventoryManager',
  appVersion: '0.1.0',
  appCopyright: "Copyright(C) 2021 Hidekazu Kubota",
  asar: true,
  icon: "assets/inventory_manager_icon",
  overwrite: true,
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
  // … other options
});
