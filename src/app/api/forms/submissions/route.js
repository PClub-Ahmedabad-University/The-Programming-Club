import Submission from "@/app/api/models/submission.model";
import connectDB from "@/app/api/lib/db";
import User from "@/app/api/models/user.model";
export async function GET() {
    try {
      await connectDB();
      const allSubmissions = await Submission.find();
      const processedSubmissions = await Promise.all(
        allSubmissions.map(async (submission) => {
          if (submission.userId) {
            const user = await User.findOne({ _id: submission.userId });
            return {
              ...submission.toObject(),
              userName: user?.name || 'No name',
              userEnrollmentnum: user?.enrollmentNumber || 'No enrollment number',
              userEmail: user?.email || 'No email'
            };
          }
          return submission;
        })
      );
  
      return new Response(JSON.stringify(processedSubmissions), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch submissions' }), { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }