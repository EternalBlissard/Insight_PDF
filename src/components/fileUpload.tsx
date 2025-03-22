'use client'
import { uploadToS3 } from '@/lib/s3';
import { useMutation} from '@tanstack/react-query';
import { Inbox, Loader2 } from 'lucide-react';
import React, {useState} from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {toast} from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const FileUpload = () => {
    const router = useRouter();

    const [isUploading, setIsUploading] = useState(false);
    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: async ({file_key, file_name}:{file_key:string ,  file_name:string}) => {
            const response = await axios.post('api/create-chat', {
                file_key, file_name
            });
            return response.data;
        }
    }
    )
    const { getRootProps, getInputProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            // console.log(acceptedFiles);
            const file = acceptedFiles[0];
            if(file.size > 10*1024*1024){
                toast.error('File size must be less than 10MB');
                alert('File size must be less than 10MB');
                return;
            }
            try {
                setIsUploading(true);
                const data = await uploadToS3(file);
                if(!data?.file_key || !data.file_name){
                    toast.error('Something went wrong');
                    // alert("Something went wrong");
                    return;
                }
                mutate(data,{
                    onSuccess : ({chat_id}) => {
                        toast.success('Chat created successfully');
                        router.push(`/chat/${chat_id}`);
                    },
                    onError : (error) => {
                        toast.error('Error creating chat' + error.message);
                        console.error(error);
                        // error.response?.data?.error || 
                        // 'Error creating chat: ' + error.message
                    }
                });
                console.log(data);
            }
            catch(error){
                console.error(error);
            }
            finally{
                setIsUploading(false);
            }
            // console.log(data);
        },
    });
    return (
        <div className='p-2 bg-white rounded-xl'>
            <div {...getRootProps({
                className: 'border-2 border-gray-300 border-dashed rounded-md p-6  cursor-pointer text-center hover:bg-gray-50'
            })}>
                <input {...getInputProps()} />
                <div className='flex flex-col items-center justify-center'>
                    {isUploading || isLoading ? (
                        <>
                            <Loader2 className='w-10 h-10 text-gray-500 animate-spin' />
                            <p className='mt-2 text-sm text-gray-500'>
                                Spilling Tea to LLMs
                            </p>
                        </>
                    ) : (
                        <Inbox className='w-10 h-10 text-gray-500' />
                    )}
                    <p className='mt-2 text-sm text-gray-500'>Drag and drop a file here, or click to select a file</p>
                </div>
            </div>
        </div>
    )
}

export default FileUpload;