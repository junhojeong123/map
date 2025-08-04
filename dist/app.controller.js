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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const image_entity_1 = require("./image/image.entity");
const fs_1 = require("fs");
const path_1 = require("path");
let AppController = class AppController {
    constructor(imageRepository) {
        this.imageRepository = imageRepository;
    }
    // 데이터베이스에서 이미지 목록 가져오기 (우선도 순으로 정렬)
    async getImages() {
        try {
            const images = await this.imageRepository.find({
                order: {
                    priority: 'ASC',
                    uploadedAt: 'DESC', // 우선도 같으면 최신순
                },
            });
            return { images };
        }
        catch (error) {
            console.error('데이터베이스 조회 에러:', error);
            return { images: [] };
        }
    }
    // 이미지 삭제
    async deleteImage(id) {
        try {
            const image = await this.imageRepository.findOne({
                where: { id },
            });
            if (!image) {
                return { success: false, message: '이미지를 찾을 수 없습니다.' };
            }
            const filePath = (0, path_1.join)(process.cwd(), image.url);
            if ((0, fs_1.existsSync)(filePath)) {
                (0, fs_1.unlinkSync)(filePath);
            }
            await this.imageRepository.delete(id);
            return { success: true, message: '이미지가 삭제되었습니다.' };
        }
        catch (error) {
            console.error('이미지 삭제 에러:', error);
            return { success: false, message: '이미지 삭제 중 오류가 발생했습니다.' };
        }
    }
    //  우선도 변경
    async updatePriority(id, priority, zIndex) {
        try {
            const image = await this.imageRepository.findOne({
                where: { id },
            });
            if (!image) {
                return { success: false, message: '이미지를 찾을 수 없습니다.' };
            }
            // 우선도와 zIndex 업데이트
            image.priority = priority !== undefined ? priority : image.priority;
            image.zIndex = zIndex !== undefined ? zIndex : image.zIndex;
            await this.imageRepository.save(image);
            return {
                success: true,
                message: '우선도가 업데이트되었습니다.',
                image
            };
        }
        catch (error) {
            console.error('우선도 업데이트 에러:', error);
            return { success: false, message: '우선도 업데이트 중 오류가 발생했습니다.' };
        }
    }
    //  이미지 순서 재정렬 (드래그 앤 드롭 후)
    async reorderImages(imageIds) {
        try {
            // 우선도를 배열 순서대로 재설정 (0, 1, 2, 3...)
            for (let i = 0; i < imageIds.length; i++) {
                await this.imageRepository.update(imageIds[i], {
                    priority: i,
                    zIndex: i // CSS z-index도 함께 업데이트
                });
            }
            return {
                success: true,
                message: '이미지 순서가 업데이트되었습니다.',
                reorderedIds: imageIds
            };
        }
        catch (error) {
            console.error('순서 재정렬 에러:', error);
            return { success: false, message: '순서 재정렬 중 오류가 발생했습니다.' };
        }
    }
    //  특정 우선도 범위의 이미지들 가져오기
    async getImagesByPriorityRange(min, max) {
        try {
            const images = await this.imageRepository
                .createQueryBuilder('image')
                .where('image.priority >= :min AND image.priority <= :max', { min, max })
                .orderBy('image.priority', 'ASC')
                .getMany();
            return { images };
        }
        catch (error) {
            console.error('우선도 범위 조회 에러:', error);
            return { images: [] };
        }
    }
};
__decorate([
    (0, common_1.Get)('images'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getImages", null);
__decorate([
    (0, common_1.Delete)('images/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Patch)('images/:id/priority'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('priority')),
    __param(2, (0, common_1.Body)('zIndex')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "updatePriority", null);
__decorate([
    (0, common_1.Post)('images/reorder'),
    __param(0, (0, common_1.Body)('imageIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "reorderImages", null);
__decorate([
    (0, common_1.Get)('images/priority/:min/:max'),
    __param(0, (0, common_1.Param)('min', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('max', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getImagesByPriorityRange", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppController);
exports.AppController = AppController;
