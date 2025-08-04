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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const image_entity_1 = require("../image/image.entity");
let UploadController = class UploadController {
    constructor(imageRepository) {
        this.imageRepository = imageRepository;
    }
    async uploadImage(imageUrl, originalname, res) {
        if (!imageUrl) {
            return res.status(400).json({ error: '이미지 URL이 필요합니다.' });
        }
        try {
            // 데이터베이스에 이미지 정보 저장
            const image = this.imageRepository.create({
                url: imageUrl,
                filename: imageUrl.split('/').pop() || 'image',
                originalname: originalname || imageUrl.split('/').pop() || 'image',
            });
            const savedImage = await this.imageRepository.save(image);
            return res.status(201).json({
                id: savedImage.id,
                url: savedImage.url,
                filename: savedImage.filename,
                originalname: savedImage.originalname,
                uploadedAt: savedImage.uploadedAt,
            });
        }
        catch (error) {
            console.error('데이터베이스 저장 에러:', error);
            return res.status(500).json({ error: '이미지 저장 중 오류가 발생했습니다.' });
        }
    }
};
__decorate([
    (0, common_1.Post)('image'),
    __param(0, (0, common_1.Body)('imageUrl')),
    __param(1, (0, common_1.Body)('originalname')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __param(0, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UploadController);
exports.UploadController = UploadController;
