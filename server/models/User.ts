import {Types,Document,model,Schema} from 'mongoose';

export interface IUser extends Document{
     _id: Types.ObjectId;
    name:string;
    email:string;
    password?:string;
    phone?:string;
    role: "user" | "admin" | "owner";
    createdAt:Date;
    updatedAt:Date;
}

const UserSchema=new Schema<IUser>(
    {
        name:{type:String ,required:true ,trim:true},
        email:{type:String ,required:true ,unique:true,trim:true ,lowercase:true},
        password:{type:String ,required:true ,minlength:8},
        phone:{type:String ,trim:true ,minlength:10},
        role:{type:String ,enum: ["user", "admin", "owner"] ,default:"user"},
    },
    {timestamps:true}

)
//Removing the password and convert to json

UserSchema.set("toJSON",{
    transform:(doc,ret)=>
    {
        delete ret.password;
        return ret;
    }
})

export const User= model<IUser>("User",UserSchema);