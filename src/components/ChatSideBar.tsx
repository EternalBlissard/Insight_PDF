'use client'
import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { MessageCircle, PlusCircle } from 'lucide-react';
import { DrizzleChat } from '@/lib/db/schema';
import { cn } from "@/lib/utils"


type Props = {
    chats: DrizzleChat[];
    chatId: number;
};

const truncateText = (text: string, limit = 15) => 
    text.length > limit ? text.substring(0, limit) + '...' : text;

const ChatSideBar = ({chats, chatId}: Props) => {
    return (
        <div className='w-full h-screen p-4 text-gray-200 bg-gray-800'>
            <Link href='/'>
                   <Button className='w-full border-dashed border-white border'> 
                    <PlusCircle className='mr-2 w-4 h-4'/>New Chat</Button>
            </Link>

            <div className='flex flex-col gap-2 mt-4'>
                {chats.map(chat => (
                    <Link key={chat.id} href={`/chat/${chat.id}`}>
                        <div className={
                        cn ('rounded-lg p-3 text-slate-300 flex items-center', {
                            'bg-blue-600' : chat.id === chatId,
                            'hover:text-white': chat.id !== chatId
                        })}>

                            <MessageCircle className='mr-2' />
                            <p className='w-full overflow-hidden text-sm'>  {truncateText(chat.pdfName, 15)}</p></div>
                    </Link>
                ))}
            </div>
            <div className='absolute bottom-4 left-4'>
                <div className='flex items-center gap-2 text-sm text-slate-500'>
                    <Link href='/'> Home </Link>
                    <Link href='/'> Source </Link>
                </div>

            </div>
        </div>
    );
}

export default ChatSideBar;