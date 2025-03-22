import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ChatComponent from "@/components/ChatComponent";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY!,
  },
});

async function downloadFromS3_page(bucket: string, key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  // Generate URL valid for 15 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 600 });
}

const page = async ({ params }: { params: Promise<{ chatId: string }> }) => {
  const { chatId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  let _chats;
  try {
    _chats = await db.select().from(chats).where(eq(chats.userId, userId));
    // console.log(_chats);
  } catch (error) {
    console.error(error);
    return redirect("/");
  }

  if (!_chats) {
    return redirect("/");
  }
  if (_chats.length === 0) {
    return redirect("/");
  }
  const parsedChatId = parseInt(chatId);
  if (isNaN(parsedChatId) || !_chats.find((chat) => chat.id === parsedChatId)) {
    return redirect("/");
  }
  const currChat = _chats.find((chat) => chat.id === parseInt(chatId));
  if (!currChat) {
    return redirect("/");
  }
  // # Get url from S3
  const Currurl = await downloadFromS3_page(
    process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
    currChat.fileKey
  );
  if (!Currurl) {
    return redirect("/");
  }
  return (
    <div className="flex max-h-screen overflow-hidden">
      <div className="flex w-full max-h-screen ">
        {/* Chat Sidebar*/}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        {/* PDF Viewer*/}
        <div className="max-h-screen overflow-scroll p-4 flex-[5]">
          <PDFViewer pdfUrl={Currurl || ""} />
        </div>
        {/* Chat Box*/}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
      {/* <h1>ChatPage {chatId}</h1> */}
    </div>
  );
};

export default page;
