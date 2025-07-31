"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // CORS 허용
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    // uploads 폴더를 정적 파일로 제공 (이미지)
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    // public 폴더를 정적 파일로 제공 (HTML)
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), {
        prefix: '/',
    });
    await app.listen(3000);
    console.log('서버가 http://localhost:3000 에서 실행 중입니다!');
}
bootstrap();
