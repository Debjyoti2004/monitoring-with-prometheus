import express from 'express'
import type { Response, Request, NextFunction } from 'express';
import client from 'prom-client';

const register = new client.Registry();

const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(requestCounter);

function middleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime}ms`);

        requestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
    });

    next();
};


const app = express();

app.use(middleware);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Monitoring with Prometheus API"
    });
});

app.get("/cpu",(req,res)=>{
    for (let i = 0; i < 1000000000; i++) {}
    res.json({
        message: "CPU intensive task completed"
    });
});

app.get("/status",(req,res)=>{
    res.json({
        status: "OK",
        statusCode: 200,
        timestamp: new Date()
    });
});

app.get("/metrics", async (req, res) => {
    try {
        const metrics = await register.metrics();
        res.set('Content-Type', register.contentType);
        res.end(metrics);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});