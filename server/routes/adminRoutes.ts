import { Router } from "express";
import { approveRestaurant, getAdminStats, getAllRestaurants } from "../controllers/adminController.js";
const adminRouter = Router()
import { adminOnly, protect } from "../middlewares/auth.js"

adminRouter.use(protect)
adminRouter.use(adminOnly)


adminRouter.get("/restaurants", getAllRestaurants)
adminRouter.get("/restaurants/:id/approve", approveRestaurant)
adminRouter.get("/stats", getAdminStats)

export default adminRouter
