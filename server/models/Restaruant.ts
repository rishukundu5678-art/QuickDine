import {Types,Document,model,Schema} from 'mongoose';

export interface IRestaurant extends Document{
    owner: Types.ObjectId;
    name:string;
    slug:string;
    description:string;
    cuisine:string;
    priceRange: "$" | "$$" | "$$$" | "$$$$";
    rating:Number;
    reviewCount:number;
    location:string;
    address:string;
    image:string;
    chef:string;
    tags:string[];
    availableSlots:string[];
    featured:boolean;
    exclusive:boolean;
    status:"Pending" | "Approved" | "Rejected";
    totalSeats:number;
    createdAt:Date;
    updatedAt:Date;

}

const RestaurantSchema=new Schema<IRestaurant>(
    {
        name:{type:String ,required:true ,trim:true},
        slug:{type:String ,required:true ,unique:true,trim:true ,lowercase:true},
        description:{type:String ,required:true},
        cuisine:{type:String ,trim:true ,required:true},
        priceRange:{type:String ,enum: ["$", "$$", "$$$","$$$$"] ,required:true},
        rating:{type:Number, default:5.0 ,min:1 ,max:5},
        reviewCount:{type:Number, default:0},
        location:{type:String ,trim:true ,required:true},
        address:{type:String ,required:true},
        image:{type:String, default:""},
        chef:{type:String ,required:true},
        tags:[{type:String }],
        availableSlots:[{type:String }],
        featured:{type:Boolean, default:false},
        exclusive:{type:Boolean, default:false},
        owner:{type:Schema.Types.ObjectId, ref:"User", requried:true},
        status:{type:String ,enum: ["Pending", "Approved", "Rejected"] ,default:"Pending"},
        totalSeats:{type:Number, default:20},
    },
    {timestamps:true}

)


export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);