import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const now = Date.now();

    // Log da requisição
    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      `Body: ${JSON.stringify(body)} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)}`,
    );

    return next
      .handle()
      .pipe(
        tap({
          next: (data) => {
            const responseTime = Date.now() - now;
            this.logger.log(
              `Outgoing Response: ${method} ${url} - ${responseTime}ms`,
              `Response: ${JSON.stringify(data)}`,
            );
          },
          error: (error) => {
            const responseTime = Date.now() - now;
            this.logger.error(
              `Request Error: ${method} ${url} - ${responseTime}ms`,
              error.stack,
            );
          },
        }),
      );
  }
}
