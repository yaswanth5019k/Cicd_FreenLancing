import { verifyAccessToken } from "../config/jwt";
import { cookies } from "next/headers";

export async function authMiddleware(request){
    try{
        const cookieStore=cookies();
        const accessToken=cookieStore.get('accessToken');
        if(!accessToken){
            return Response.json({error:'No access token provided'},{status:401});
        }

        try {
            const decoded=verifyAccessToken(accessToken.value);
            if(!decoded){
                return Response.json({error:'Invalid token'},{status:401});
            }
            request.user=decoded;
            return null;
        } catch(err) {
            if(err.name === 'TokenExpiredError') {
                return Response.json({error:'Token expired'},{status:401});
            } else if(err.name === 'JsonWebTokenError') {
                return Response.json({error:'Invalid token signature'},{status:401});
            }
            throw err;  // Re-throw unexpected errors
        }
    }catch(error){
        console.log('Auth middleware error:', error);
        return Response.json({error:'Internal Server Error'},{status:500});
    }
}