import User from "@/app/api/models/user.model"
import { NextResponse } from "next/server"
import connectDB from "@/app/api/lib/db"

export async function GET(req) {
    try {
    
        await connectDB()
        // console.log("Headers: ",req.headers.get('authorization'))
        
        const users = await User.find({}).select('-password -__v')
        
        if (!users) {
            console.error('No users found in the database')
            return NextResponse.json(
                { error: "No users found" }, 
                { status: 404 }
            )
        }
        
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        console.error('Error in GET /api/audience/get:', error)
        return NextResponse.json(
            { 
                error: "Failed to fetch users",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, 
            { status: 500 }
        )
    }
}
