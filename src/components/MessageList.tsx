import React from 'react'
import { Message } from 'ai'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Props = {
    messages: Message[]
    isLoading: boolean
    loadingDone: boolean
}

const MessageList = ({messages, isLoading}: Props) => {
    // if(loadingDone && messages.length === 0){
    //     return (
    //         <div className='flex items-center justify-center h-full'>
    //             <p className='text-gray-400'>Error in Retrieving messages</p>
    //         </div>
    //     )
    // }

    if(isLoading){
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading ....
      </div>
        )
    }else{
        console.log("Loading",isLoading)
    }
  if(!messages){
      <></>
  }
//   console.log("Messages List",messages)
  return (
    <div className='flex flex-col gap-2 px-4'>
        {
            // console.log(messages),
            messages.map(message => {
                return (
                    <div key={message.id} className={cn('flex', {
                        'justify-end pl-10': message.role === 'user',
                        'justify-start pr-10': message.role === 'assistant'
                    })}>
                        <div className={cn('rounded-lg px-3 text-sm py-2 shadow-md ring-1 ring-gray-900/10', {
                            'bg-blue-500 text-white': message.role === 'user',
                            'bg-gray-200 text-black': message.role === 'assistant'
                        })}>
                            {message.content}
                        </div>
                    </div>
                )
            }
)}
    </div>)
}

export default MessageList