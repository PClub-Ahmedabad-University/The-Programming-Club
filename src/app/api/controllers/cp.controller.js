// src/app/api/controllers/cp.controller.js
import mongoose from 'mongoose';
import CPProblem from '../models/cp-problem.model';
import connectDB from '../lib/db';

const handler = async (request) => { // Changed from (req, res) to (request)
    try {
        const body = await request.json();
        const link = body.link || body.problemLink; 

        if (!link) {
            throw new Error('Problem link is required');
        }

        await connectDB();

        const problemDetails = parseProblemLink(link);
        
        if (!problemDetails) {
            throw new Error('Invalid Codeforces problem link');
        }

        const { contestId, problemId } = problemDetails;
        const uniqueProblemId = `${contestId}-${problemId}`;

        const existingProblem = await CPProblem.findOne({ problemId: uniqueProblemId });
        
        if (existingProblem) {
            return {
                message: 'Problem already exists',
                problem: {
                    problem_id: existingProblem.problemId,
                    title: existingProblem.title,
                    contest_id: parseInt(contestId),
                    problem_link: existingProblem.link,
                    database_id: existingProblem._id,
                    created_at: existingProblem.createdAt
                }
            };
        }

        const problemData = await fetchProblemFromAPI(contestId, problemId);

        if (!problemData) {
            throw new Error('Problem not found on Codeforces');
        }

        const newProblem = new CPProblem({
            problemId: uniqueProblemId,
            title: problemData.name,
            link: link,
            postedAt: new Date(),
            submittedUsers: [],
            isActive: true
        });

        const savedProblem = await newProblem.save();

        return {
            message: 'Problem saved successfully',
            problem: {
                problem_id: savedProblem.problemId,
                title: savedProblem.title,
                contest_id: parseInt(contestId),
                problem_link: savedProblem.link,
                database_id: savedProblem._id,
                created_at: savedProblem.createdAt
            }
        };

    } catch (error) {
        console.error('Error processing problem:', error);
        throw error;
    }
};

// Helper functions
function parseProblemLink(link) {
    try {
        const url = new URL(link);
        
        if (url.hostname !== 'codeforces.com') {
            return null;
        }

        const pathParts = url.pathname.split('/').filter(part => part);
        let contestId, problemId;

        if (pathParts[0] === 'contest' && pathParts[2] === 'problem') {
            contestId = pathParts[1];
            problemId = pathParts[3];
        } else if (pathParts[0] === 'problemset' && pathParts[1] === 'problem') {
            contestId = pathParts[2];
            problemId = pathParts[3];
        } else {
            return null;
        }

        if (!/^\d+$/.test(contestId) || !/^[A-Z]$/i.test(problemId)) {
            return null;
        }

        return {
            contestId,
            problemId: problemId.toUpperCase()
        };

    } catch (error) {
        return null;
    }
}

async function fetchProblemFromAPI(contestId, problemId) {
    try {
        const response = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1&showUnofficial=true`);
        
        if (!response.ok) {
            const problemsetResponse = await fetch(`https://codeforces.com/api/problemset.problems`);
            
            if (!problemsetResponse.ok) {
                throw new Error('Failed to fetch from Codeforces API');
            }
            
            const problemsetData = await problemsetResponse.json();
            
            if (problemsetData.status !== 'OK') {
                throw new Error('API returned error status');
            }
            
            const problem = problemsetData.result.problems.find(p => 
                p.contestId === parseInt(contestId) && p.index === problemId
            );
            
            return problem || null;
        }
        
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error('API returned error status');
        }
        
        const problems = data.result.problems;
        const problem = problems.find(p => p.index === problemId);
        
        return problem || null;
        
    } catch (error) {
        console.error('Error fetching from Codeforces API:', error);
        
        try {
            const response = await fetch(`https://codeforces.com/api/problemset.problems`);
            const data = await response.json();
            
            if (data.status === 'OK') {
                const problem = data.result.problems.find(p => 
                    p.contestId === parseInt(contestId) && p.index === problemId
                );
                return problem || null;
            }
        } catch (fallbackError) {
            console.error('Fallback API call also failed:', fallbackError);
        }
        
        return null;
    }
}

export default handler;