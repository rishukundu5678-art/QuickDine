import { Router } from "express";
import upload from "../config/multer.js";
import { ownerOnly, protect } from "../middlewares/auth.js";
import { createOwnerRestaurant, getOwnerBookings, getOwnerRestaurant, updateBookingStatus, updateOwnerRestaurant } from "../controllers/ownerController.js";

const ownerRouter=Router();

ownerRouter.use(protect)
ownerRouter.use(ownerOnly)

ownerRouter.get("/restaurant", protect, getOwnerRestaurant);
ownerRouter.post("/restaurant", protect, upload.single("image"), createOwnerRestaurant);
ownerRouter.put("/restaurant", protect, upload.single("image"), updateOwnerRestaurant);
ownerRouter.get("/bookings", protect,getOwnerBookings);
ownerRouter.put("/bookings/:id/status", protect,updateBookingStatus);

export default ownerRouter;


