import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3: S3Client | null = null;
  private bucket: string | null = null;

  constructor(private cfg: ConfigService) {
    const key = this.cfg.get<string>('AWS_ACCESS_KEY_ID');
    if (key) {
      this.s3 = new S3Client({
        region: this.cfg.get<string>('AWS_REGION') || 'us-east-1',
        credentials: {
          accessKeyId: key,
          secretAccessKey: this.cfg.get<string>('AWS_SECRET_ACCESS_KEY') || ''
        }
      });
      this.bucket = this.cfg.get<string>('S3_BUCKET') || null;
      this.logger.log('S3 client configured');
    } else {
      this.logger.log('AWS credentials not provided - using local fallback for uploads');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      if (this.s3 && this.bucket) {
        const key = `${Date.now()}_${file.originalname}`;
        const upload = new Upload({
          client: this.s3,
          params: {
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer
          }
        });
        const result = await upload.done();
        // build public URL (may vary depending on bucket policy)
        const url = `https://${this.bucket}.s3.${this.cfg.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
        this.logger.log(`Uploaded file to S3: ${url}`);
        return url;
      }

      // Local fallback
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
      const filename = `${Date.now()}_${file.originalname}`;
      const dest = path.join(uploadsDir, filename);
      fs.writeFileSync(dest, file.buffer);
      const port = this.cfg.get<number>('PORT') || 3000;
      const localUrl = `http://localhost:${port}/uploads/${filename}`;
      this.logger.log(`Saved file locally: ${localUrl}`);
      return localUrl;
    } catch (err) {
      this.logger.error('Failed to upload file', err as any);
      throw err;
    }
  }

  async uploadBuffer(filename: string, buffer: Buffer, contentType = 'application/pdf'): Promise<string> {
    try {
      if (this.s3 && this.bucket) {
        const key = `${Date.now()}_${filename}`;
        const upload = new Upload({
          client: this.s3,
          params: {
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType
          }
        });
        await upload.done();
        const url = `https://${this.bucket}.s3.${this.cfg.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
        this.logger.log(`Uploaded buffer to S3: ${url}`);
        return url;
      }

      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
      const dest = path.join(uploadsDir, `${Date.now()}_${filename}`);
      fs.writeFileSync(dest, buffer);
      const port = this.cfg.get<number>('PORT') || 3000;
      const localUrl = `http://localhost:${port}/uploads/${path.basename(dest)}`;
      this.logger.log(`Saved buffer locally: ${localUrl}`);
      return localUrl;
    } catch (err) {
      this.logger.error('Failed to upload buffer', err as any);
      throw err;
    }
  }
}
