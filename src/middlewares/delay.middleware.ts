import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class DelayMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log({
      method: req.method,
      url: req.baseUrl,
      headers: req.headers,
      body: req.body,
    });
    setTimeout(next, 1);
  }
}
