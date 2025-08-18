import type { Request, Response, NextFunction } from "express";

export default function middleware(req:Request, res: Response, next: NextFunction) {
   let start = Date.now();
   next();
   let duration = Date.now() - start;
   console.log(`Request Method: ${req.method}, Request URL: ${req.url}, Duration: ${duration}ms`);
}
