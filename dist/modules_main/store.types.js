"use strict";
/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialSettingsState = exports.initialTemporalSettingsState = exports.initialPersistentSettingsState = exports.dataDirName = void 0;
const i18n_1 = require("../modules_common/i18n");
exports.dataDirName = 'inventory_manager_data';
exports.initialPersistentSettingsState = {
    storage: {
        type: '',
        path: '',
    },
    navigationAllowedURLs: [],
    language: '',
};
exports.initialTemporalSettingsState = {
    messages: i18n_1.English,
    app: {
        name: '',
        version: '',
        iconDataURL: '',
    },
};
exports.initialSettingsState = {
    persistent: exports.initialPersistentSettingsState,
    temporal: exports.initialTemporalSettingsState,
};
