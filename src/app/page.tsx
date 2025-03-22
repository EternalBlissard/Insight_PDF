"use client"; // Add this directive at the top

import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
// import { useRouter } from "next/navigation"; // Note: Import from 'next/navigation'
import { LogIn } from "lucide-react";
import FileUpload from "@/components/fileUpload";

export default function Home() {
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-200 to-teal-200">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-4xl font-semibold"> Insight PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2">
            {isAuthenticated && (
              <Link href="/chat/1">
                <Button> Go to PDFs</Button>
              </Link>
            )}
          </div>
          <p className="max-w-xl mt-1 text-lg text-gray-500">
            Join Millions of Students, Researchers and Professionals who are
            already using AI to get answers from PDFs
          </p>

          <div className="w-full mt-4 ">
            {isAuthenticated ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get started
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
          {/* YES */}
        </div>
      </div>
    </div>
  );
}
