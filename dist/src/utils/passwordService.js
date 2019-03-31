"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
exports.hashPassword = async (password) => await bcrypt.hash(password, 10);
exports.comparePassword = async (password, encrypted) => await bcrypt.compare(password, encrypted);
//# sourceMappingURL=passwordService.js.map