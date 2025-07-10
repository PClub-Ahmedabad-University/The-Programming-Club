import { NextResponse } from "next/server";
import CPProblem from "@/app/api/models/cp-problem.model";
import connectDB from "@/app/api/lib/db";

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = params;
        const deletedProblem = await CPProblem.findByIdAndDelete(id);

        return NextResponse.json(deletedProblem);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete problem" },
            { status: 500 }
        );
    }
}