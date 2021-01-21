"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = exports.emitter = void 0;
/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
const events_1 = require("events");
exports.emitter = new events_1.EventEmitter();
// Register channel name of eventListener to remove it later.
exports.handlers = [];
