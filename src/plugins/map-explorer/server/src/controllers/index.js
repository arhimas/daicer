"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const map_controller_1 = __importDefault(require("./map-controller"));
const forge_controller_1 = __importDefault(require("./forge-controller"));
const voxel_preview_1 = __importDefault(require("./voxel-preview"));
exports.default = {
    mapController: map_controller_1.default,
    forgeController: forge_controller_1.default,
    voxelPreview: voxel_preview_1.default,
};
