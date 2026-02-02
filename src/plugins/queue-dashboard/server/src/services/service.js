"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service = ({ strapi: _strapi }) => ({
    getWelcomeMessage() {
        return 'Welcome to Strapi 🚀';
    },
});
exports.default = service;
