// import {Request} from 'express';
import {db} from '@/lib/db';
import {messages} from '@/lib/db/schema';
import {eq} from 'drizzle-orm';
import {NextResponse} from 'next/server';
// import { log } from '@vercel/og';
// log.info("Database response", _messages);

// export const runtime = 'edge';

export const POST = async (req: Request) => {
    const {chatId} = await req.json();
    // console.log("Chat ID",chatId);
    const _messages = await db.select().from(messages).where(eq(messages.chatId, chatId)).catch(error => {
        console.error("DB ERROR:", error);
        throw error});
    // console.log("Messages Retrived",_messages);
    return NextResponse.json(_messages);
}

