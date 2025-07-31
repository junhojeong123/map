"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
let AppController = class AppController {
    // 업로드된 이미지 목록 가져오기
    getImages() {
        const uploadDir = './uploads';
        if (!(0, fs_1.existsSync)(uploadDir)) {
            return { images: [] };
        }
        const files = (0, fs_1.readdirSync)(uploadDir);
        const images = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => ({
            url: `/uploads/${file}`,
            filename: file
        }));
        return { images };
    }
};
__decorate([
    (0, common_1.Get)('images'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getImages", null);
AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
exports.AppController = AppController;
