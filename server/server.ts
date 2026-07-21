import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import ConnectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/onwerRoutes.js";


// console.log(process.env.MONGODB_URI);
const app = express();

// debug environment loading
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Loaded MONGODB_URI:", Boolean(process.env.MONGODB_URI));
console.log("MONGODB_URI prefix:", process.env.MONGODB_URI?.slice(0, 40));

// connect to MongoDB
await ConnectDB()


// Middleware
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use("/api/auth",authRouter)

app.use("/api/restaurant",restaurantRouter)

app.use("/api/bookings",bookingRouter)

app.use("/api/owner",ownerRouter)


// global error handler
app.use((err:Error ,req:Request ,res:Response ,next:NextFunction)=>{
    console.error("Unhandle Error:",err);
    res.status(500).json({
        message:err.message || "Internal Server Error",
        stack:process.env.NODE_ENV === "production"? undefined:err.stack,
    });
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});



