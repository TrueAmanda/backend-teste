"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let S3Service = S3Service_1 = class S3Service {
    constructor(cfg) {
        this.cfg = cfg;
        this.logger = new common_1.Logger(S3Service_1.name);
        this.s3 = null;
        this.bucket = null;
        const key = this.cfg.get('AWS_ACCESS_KEY_ID');
        if (key) {
            this.s3 = new client_s3_1.S3Client({
                region: this.cfg.get('AWS_REGION') || 'us-east-1',
                credentials: {
                    accessKeyId: key,
                    secretAccessKey: this.cfg.get('AWS_SECRET_ACCESS_KEY') || ''
                }
            });
            this.bucket = this.cfg.get('S3_BUCKET') || null;
            this.logger.log('S3 client configured');
        }
        else {
            this.logger.log('AWS credentials not provided - using local fallback for uploads');
        }
    }
    async uploadFile(file) {
        try {
            if (this.s3 && this.bucket) {
                const key = `${Date.now()}_${file.originalname}`;
                const upload = new lib_storage_1.Upload({
                    client: this.s3,
                    params: {
                        Bucket: this.bucket,
                        Key: key,
                        Body: file.buffer
                    }
                });
                const result = await upload.done();
                // build public URL (may vary depending on bucket policy)
                const url = `https://${this.bucket}.s3.${this.cfg.get('AWS_REGION')}.amazonaws.com/${key}`;
                this.logger.log(`Uploaded file to S3: ${url}`);
                return url;
            }
            // Local fallback
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir))
                fs.mkdirSync(uploadsDir);
            const filename = `${Date.now()}_${file.originalname}`;
            const dest = path.join(uploadsDir, filename);
            fs.writeFileSync(dest, file.buffer);
            const port = this.cfg.get('PORT') || 3000;
            const localUrl = `http://localhost:${port}/uploads/${filename}`;
            this.logger.log(`Saved file locally: ${localUrl}`);
            return localUrl;
        }
        catch (err) {
            this.logger.error('Failed to upload file', err);
            throw err;
        }
    }
    async uploadBuffer(filename, buffer, contentType = 'application/pdf') {
        try {
            if (this.s3 && this.bucket) {
                const key = `${Date.now()}_${filename}`;
                const upload = new lib_storage_1.Upload({
                    client: this.s3,
                    params: {
                        Bucket: this.bucket,
                        Key: key,
                        Body: buffer,
                        ContentType: contentType
                    }
                });
                await upload.done();
                const url = `https://${this.bucket}.s3.${this.cfg.get('AWS_REGION')}.amazonaws.com/${key}`;
                this.logger.log(`Uploaded buffer to S3: ${url}`);
                return url;
            }
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir))
                fs.mkdirSync(uploadsDir);
            const dest = path.join(uploadsDir, `${Date.now()}_${filename}`);
            fs.writeFileSync(dest, buffer);
            const port = this.cfg.get('PORT') || 3000;
            const localUrl = `http://localhost:${port}/uploads/${path.basename(dest)}`;
            this.logger.log(`Saved buffer locally: ${localUrl}`);
            return localUrl;
        }
        catch (err) {
            this.logger.error('Failed to upload buffer', err);
            throw err;
        }
    }
};
S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
exports.S3Service = S3Service;
//# sourceMappingURL=s3.service.js.map