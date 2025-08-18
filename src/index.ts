import express from 'express'
import type { Response, Request, NextFunction } from 'express';
import client from 'prom-client';

const register = new client.Registry();

const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeRequestsGauge = new client.Gauge({
    name: 'http_active_requests',
    help: 'Current number of active HTTP requests'
});

register.registerMetric(requestCounter);
register.registerMetric(activeRequestsGauge);

function middleware(req: Request, res: Response, next: NextFunction) {

    if(req.path !== '/metrics') {
        activeRequestsGauge.inc();
    }
    const startTime = Date.now();

    res.on('finish', () => {
        const endTime = Date.now();
        console.log(`Request took ${endTime - startTime}ms`);

        requestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
        if(req.path !== '/metrics') {
        activeRequestsGauge.dec();
        }
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

app.get("/cpu", async (req, res) => {
    //for (let i = 0; i < 100000000000000; i++) {}    // Simulate CPU intensive task (it's single threaded so if I open lots of tap and hit this end point its doing job first in first out, So i cant see the metrics end point while this is running)
    await new Promise(resolve => setTimeout(resolve, 100000)); // Simulate CPU intensive task with delay
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