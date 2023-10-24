import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HttpSuccessResponse } from '../types';
import { Observable, map } from 'rxjs';

// Re-format all non-error response to fit Google JSON style
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, HttpSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<HttpSuccessResponse<T>> {
    const requestUrl = context.switchToHttp().getRequest().originalUrl;

    if (requestUrl.includes('api-specs')) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => ({ data })));
  }
}
