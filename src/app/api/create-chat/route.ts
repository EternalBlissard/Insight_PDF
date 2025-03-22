import { NextResponse } from "next/server";
import {db} from "@/lib/db"; 
import {chats} from "@/lib/db/schema";
// import {serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import { downloadFromS3 } from "@/lib/pinecone";
import {auth} from "@clerk/nextjs/server";
export async function POST(req: Request){
    const {userId} = await auth();
    if(!userId){
        return NextResponse.json({error:"unauthorized"}, {"status": 401})
    }
    try{
        const body = await req.json();
        const {file_key, file_name} = body;
        console.log(file_key, file_name);
        const chat_id = await db.insert(chats).values({
            fileKey: file_key,
            fileUrl: await downloadFromS3(process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!, file_key),
            pdfName: file_name,
            userId: userId
        }).returning({
            insertedId : chats.id
        })
        return NextResponse.json({chat_id:chat_id[0].insertedId}, {"status": 200});
    }catch(error){
        console.error(error);
        return NextResponse.json({error:"internal server error"}, {"status": 500})
    }
}