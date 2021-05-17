<img alt="Inventory Manager" src="https://github.com/sosuisen/inventory-manager/blob/main/assets/inventory_manager_icon-128x128.png" width=60 height=60 align="left"> 

# Inventory Manager
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](LICENSE)

Electron app to manage what's in the box

Use Inventory Manager to...
- Record what item is where.
- Manage whether an item is inside or outside of the box.
- Save your inventory to Git repository and sync automatically.

This is an example application of [git-documentdb](https://github.com/sosuisen/git-documentdb).

NOTE for v0.2: Create JSON config file to synchronize with GitHub.

**Windows:**

 C:\tmp\inventory_manager_env

**Others:**

 /tmp/inventory_manager_env

```
{
  "INVENTORY_MANAGER_TOKEN": "Enter your personal access token with checked [repo]",
  "INVENTORY_MANAGER_URL": "https://github.com/enter_your_account_name/git-documentdb-example-sync.git"
}
```


 