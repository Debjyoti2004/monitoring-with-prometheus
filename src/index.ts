import express from 'express'
import middleware from './middleware/middleware.js';

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


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});