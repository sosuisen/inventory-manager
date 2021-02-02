/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

import { DatabaseCommand } from '../modules_common/action.types';

interface WindowWithAPI extends Window {
  api: {
    db: (command: DatabaseCommand) => Promise<void>;
  };
}
declare const window: WindowWithAPI;
export default window;
