import dns from "node:dns";
import mongoose from "mongoose";

const ConnectDB = async () => {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    mongoose.connection.on("connected", () => {
        console.log("MongoDB connected");
    });
    mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error);
    });
    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });

    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    try {
        await mongoose.connect(uri);
    } catch (error) {
        console.error("MongoDB connect failed:", error);
        throw error;
    }
};



export default ConnectDB;