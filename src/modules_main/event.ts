/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
import { EventEmitter } from 'events';

export const emitter = new EventEmitter();

// Register channel name of eventListener to remove it later.
export const handlers: string[] = [];
