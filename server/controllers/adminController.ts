import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";




// Get all restaurants for admin management
//GET/ api/ admin/ restaurants
export const getAllRestaurants = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const restaurants = await Restaurant.find({}).populate("owner","name email phone").sort({createdAt: -1})
        
        res.json(restaurants)
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message});
    }
}


// Aprove/reject a restaurant profile
//PUT/ api/ admin/ restaurants/:id/approve
export const approveRestaurant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        if(!status || !["approved", "rejected", "pending"].includes(status)){
            res.status(400).json({ message: "Please provide a valid approval status"});
            return;
        }
        const restaurant = await Restaurant.findById(req.params.id);
        if(!restaurant){
            res.status(404).json({ message: "Restarant profile not found"});
            return;
        }
        restaurant.status = status;
        await restaurant.save();
        res.json(restaurant);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message});
    }
}
// Get system statistics
//GET/ api/ admin/ stats
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments({ role: "user"});
        const totalOwners = await User.countDocuments({ role: "owner"});
        const totalBookings = await Booking.countDocuments({});
        const totalRestaurants = await Restaurant.countDocuments({});

        //Get latest 10 bookings
        const latestBooking = await Booking.find({}).populate("user", "name email").populate("restaurant", name).sort({createdAr: -1}).limit(10);

        res.json(
            {
                users: {
                    totalUsers,
                    totalOwners,
                    total: totalUsers + totalOwners,
                },
                restaurants: {
                    total: totalRestaurants,
                },
                bookings: {
                    total: totalBookings,
                },
                latestBooking
            }
        )

    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message});
    }
}