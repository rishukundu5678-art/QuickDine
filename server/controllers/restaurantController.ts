import { Request, Response } from "express";
import { Restaurant } from "../models/Restaruant.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";
import { decode } from "node:punycode";
import { Booking } from "../models/Booking.js";

// Get all restuarants With search and filters
// Get /api/restuarants

export const getRestaurants=async (req:Request ,res:Response):Promise<void> =>{
    try{

        const{ search ,priceRange ,rating ,location ,sort} =req.query;

        // Build qurey object

        const queryObj:any ={status:"Approved"};

        if(search)
        {
            queryObj.$or=[
                {name:{$regex :search ,$options:"i"}},
                {tags:{$regex :search ,$options:"i"}},
                {location:{$regex :search ,$options:"i"}},
            ]
        }

        if(priceRange)
        {
            const prices=Array.isArray(priceRange)? priceRange : [priceRange];
            queryObj.priceRange={$in : prices};
        }
         if(rating)
        {
            queryObj.rating={$gete : parseFloat(rating as string)};
        }

         if(location)
        {
            queryObj.location={$regex : location as string,$options:"i" };
        }

        // sorting
        let sortOption:any ={createdAt:-1}
        if(sort=== "Rating"){
            sortOption ={rating :-1}
        } else if(sort===" price_low")
        {
            sortOption={priceRange:1};
        }
        else if(sort===" price_high")
        {
             sortOption={priceRange:-1};
        }

        const restaurant= await Restaurant.find(queryObj).sort(sortOption);
        res.json(restaurant)

    }catch(error:any)
    {
        console.error(error);
       res.status(400).json({message:error.message});
    }
}

// Get featured and exclusive restuarants 
// Get /api/restuarants/featured

export const getFeaturedRestaurants=async (req:Request ,res:Response):Promise<void> =>{
    try{
         
        const featured =await Restaurant.find({
            status:"Approved",
            $or:[{featured :true},{exclusive: true}]
        }).limit(6)

        res.json(featured);

    }catch(error:any)
    {
        console.error("Get Featured Restaurants Error:",error);
       res.status(500).json({message:"Server error"});
    }
}


// Get sinlge resturant by slug
// Get /api/restuarants/:slug

export const getRestaurantsBySlug=async (req:Request ,res:Response):Promise<void> =>{
    try{

const restaurant =await Restaurant.findOne({ slug: req.params.slug})
 if(!restaurant)
 {
     res.status(404).json({message:"Restaurant Not Found"});
     return;
 }
 // If not approved ,verify authrization (owner or admin)
 if(restaurant.status !=="Approved")
 {
    let isAuthorized=false;
    if(req.headers.authorization && req.headers.authorization?.startsWith("Bearer")){
        try{
            const token =req.headers.authorization.split(" ")[1];
            const decoded= jwt.verify(token, process.env.JWT_SECRET as string) as unknown as
            {id:string};
            

            const user=await User.findById(decoded.id);
            if(user && (user.role==="admin" ||(user.role==="owner" && restaurant.owner.toString() === user._id.toString())))
            {
                isAuthorized=true;
            }

        }catch(err)
        {
            // Ignore Token verify error
        }
    }
    if(!isAuthorized)
    {
        res.status(404).json({mesaage: "Restaurant not found or Pending approval"});
        return ;
    }
 }
 res.json(restaurant);

    }catch(error:any)
    {
        console.error(error);
       res.status(400).json({message:error.message});
    }
}


// Get dynamic seat availability for slots 
// Get /api/restuarants/:id/availability

export const getRestaurantsAvailability=async (req:Request ,res:Response):Promise<void> =>{
    try{
        
    const {date} =req.query;
    if(!date)
    {
        res.status(400).json({message:"Please provide a date"});
        return;
    }
    const restaurant =await Restaurant.findById(req.params.id);
    if(!restaurant)
    {
        res.status(400).json({message:"Restaurant Not Found"});
        return;
    }
    const bookingDate = new Date(date as string)

    // Get all Active Bookings on this date for th restaurant 
    const bookings=await Booking.find({
        restaurant:restaurant._id,
        date:bookingDate,
        status:"confirmed",
    })

    // Map slots to available capacities
    const availability=restaurant.availableSlots.map((slot)=>{
        const  bookedSeats=bookings.filter((b)=> b.time=== slot).reduce((sum,b)=>sum+b.guests,0)

        const totalSeats=restaurant.totalSeats || 20;
        const availableSeats=Math.max(0,totalSeats-bookedSeats);

        return{
            time:slot,
            availableSeats,
            isAvailable:availableSeats>0
        }
    })

    res.json(availability)

    }catch(error:any)
    {
        console.error(error);
       res.status(400).json({message:error.message});
    }
}