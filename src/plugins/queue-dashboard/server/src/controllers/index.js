'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const controller_1 = __importDefault(require('./controller'));
const dashboard_1 = __importDefault(require('./dashboard'));
exports.default = {
  controller: controller_1.default,
  dashboard: dashboard_1.default,
};
