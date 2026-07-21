import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";

// Create a new booking
// Post/api/bookings
// @acess private
export const createBooking=async (req:AuthRequest,res:Response):Promise<void> =>{
    try{
        const {restaurantId, date,time,guests ,occasion ,specialRequests}=req.body;
        if(!restaurantId || !date ||!time || !guests)
        {
            res.status(400).json({message:"Please provide all required reservation details"});
            return;
        }
        // Check if restaurant exists
        const restaurant =await Restaurant.findById(restaurantId);
        if(!restaurant)
        {
            res.status(400).json({message:"Restaurant nor found"});
            return;
        }

        // Check Restaurant is verified or not
        if(restaurant.status !=="approved")
        {
            res.status(400).json({message:"Reservations are not open for this restaurant yet"});
            return;
        }

        // Verify seat Availablity
        const requestedGuests=Number(guests);
        const existingBookings =await Booking.find({
            restaurant:restaurantId,
            date:new Date(date),
            time,
            status:"confirmed",
        })
        const bookedSeats=existingBookings.reduce((sum,b)=>sum+b.guests,0)

        const totalSeats=restaurant.totalSeats || 20 ;

        const availableSeats=totalSeats-bookedSeats;

        if(requestedGuests >availableSeats)
        {
             res.status(400).json({message:`Unable to reserve. Only ${availableSeats} seats are available for this time slot.`
            });
        }

        const booking=await Booking.create({
            user:req.user?._id,
            restaurant:restaurantId,
            date: new Date(date),
            time,
            guests:Number(guests),
            occasion,
            specialRequests,
            status:"confirmed",
        })
        // Populate resturant info before returning
        const populatedBooking= await booking.populate("resturant","name location image address");

        res.status(201).json(populatedBooking);

    }catch(error:any)
    {
        console.error(error);
        res.status(400).json({message:error.message});

    }

}


// Get logged in user bookings
// GET/api/bookings/my
// @acess private
export const getMyBookings=async (req:AuthRequest,res:Response):Promise<void> =>{
    try{

        const bookings=await Booking.find({user:req.user?._id}).populate("restaurant","name location image address slug").sort({date:-1 , time:-1});

        res.json(bookings);
    }catch(error:any)
    {
        console.error(error);
        res.status(400).json({message:error.message});

    }

}



// Cancel a booking
// PUT/api/bookings/:id/cancel
// @acess private
export const cancelBooking=async (req:AuthRequest,res:Response):Promise<void> =>{
    try{
       
        const booking=await Booking.findById(req.params.id);
        if(!booking)
        {
            res.status(404).json({message:"Booking not found"});
            return;
        }

        // Verify User owns the booking
        if(booking.user.toString() !== req.user?._id.toString())
        {
          res.status(401).json({message:"Not Authorized to cancel this booking"});
            return;  
        }

        booking.status="cancelled";
        await booking.save();

       const populatedBooking= await booking.populate("resturant","name location image address");

       res.json(populatedBooking);


    }catch(error:any)
    {
        console.error(error);
        res.status(400).json({message:error.message});

    }

}
