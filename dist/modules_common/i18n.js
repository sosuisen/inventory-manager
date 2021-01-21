"use strict";
/**
 * Inventory Manager
 * Copyright (c) Hidekazu Kubota
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLanguage = exports.availableLanguages = exports.Japanese = exports.English = void 0;
const LanguagesCommon = {
    en: 'English',
    ja: '日本語(Japanese)',
};
exports.English = Object.assign(Object.assign({}, LanguagesCommon), { appName: 'Inventory Manager' });
exports.Japanese = Object.assign(Object.assign({}, LanguagesCommon), { appName: '収納ボックス管理' });
exports.availableLanguages = ['en', 'ja'];
exports.defaultLanguage = 'en';
