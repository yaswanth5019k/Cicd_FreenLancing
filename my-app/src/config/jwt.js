import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN=process.env.ACCESS_TOKEN;
const REFRESH_TOKEN=process.env.REFRESH_TOKEN;

if(!ACCESS_TOKEN || !REFRESH_TOKEN){
    throw new Error('JWT_SECRET is not defined');
}

export const generateAccessToken=(payload)=>{
    return jwt.sign(payload,ACCESS_TOKEN,{expiresIn:'5m'});
}

export const generateRefreshToken=(payload)=>{
    return jwt.sign(payload,REFRESH_TOKEN,{expiresIn:'15m'});
}

export const generateAuthTokens=(payload)=>{
    const accessToken=generateAccessToken(payload);
    const refreshToken=generateRefreshToken(payload);
    return {accessToken,refreshToken};
}

export const verifyAccessToken=(token)=>{
    return jwt.verify(token,ACCESS_TOKEN);
}

export const verifyRefreshToken=(token)=>{
    return jwt.verify(token,REFRESH_TOKEN);
}