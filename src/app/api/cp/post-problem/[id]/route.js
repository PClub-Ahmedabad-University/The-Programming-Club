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
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { solutionLink, solution } = await req.json();
        const { id } = params;
        
        // Use either solutionLink or solution, with solutionLink taking precedence
        const solutionToSave = solutionLink || solution;
        
        if (!solutionToSave) {
            return NextResponse.json(
                { error: "Solution link is required" },
                { status: 400 }
            );
        }

        const updatedProblem = await CPProblem.findByIdAndUpdate(
            id, 
            { solution: solutionToSave },
            { new: true }
        );

        if (!updatedProblem) {
            return NextResponse.json(
                { error: "Problem not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProblem);
    } catch (error) {
        console.error("Error updating problem solution:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update problem solution" },
            { status: 500 }
        );
    }
}