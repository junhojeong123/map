"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
// src/app.module.ts
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const image_entity_1 = require("./image/image.entity");
const upload_controller_1 = require("./upload/upload.controller");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: '1234',
                database: 'chat_app',
                entities: [image_entity_1.Image],
                synchronize: true,
                logging: false,
            }),
            typeorm_1.TypeOrmModule.forFeature([image_entity_1.Image]),
        ],
        controllers: [app_controller_1.AppController, upload_controller_1.UploadController],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
