import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from 'axios';
import fs from 'fs/promises';
import tmp from 'tmp-promise';
import md5 from 'md5';
import { getEmbeddings } from './embeddings';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
// import { doublePrecision } from 'drizzle-orm/pg-core';
// import { fileURLToPath } from 'url';
import { convertToASCII } from './utils';
// import { downloadFromS3 } from './s3-server';       
let pinecone: Pinecone | null = null;

const s3Client = new S3Client({ 
region: process.env.AWS_REGION,
credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY!
}
});

export async function downloadFromS3(bucket: string, key: string) {
const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
});

// Generate URL valid for 15 minutes
return await getSignedUrl(s3Client, command, { expiresIn: 900 });
}

export const getPinecone = async () => {
if (!pinecone) {
    pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });
}
return pinecone;
}

export async function downloadFileBuffer(file_key: string): Promise<Buffer> {
// Obtain the signed URL from S3
const signedUrl = await downloadFromS3(process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!, file_key);

// Download the file content as a buffer
const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
return Buffer.from(response.data);
}

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {pageNumber:number}
    }
}
async function embedDocument(doc: Document){
    try{
        const embeddings = await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);
        return {id:hash, values : embeddings, metadata : {text : doc.metadata.text, pageNumber:doc.metadata.pageNumber}} as PineconeRecord;
    }
    catch(e){
        console.error('error embedding the documnet',e);
        throw e;
    }
}
export async function LoadS3IntoPineCone(file_key: string) {
console.log("Downloading from S3");

// Download the PDF file into a buffer
const fileBuffer = await downloadFileBuffer(file_key);
if (!fileBuffer) {
    throw new Error("Failed to download from S3");
}

// Write the buffer to a temporary file
const { path: tempFilePath } = await tmp.file({ postfix: '.pdf' });
await fs.writeFile(tempFilePath, fileBuffer);

// Load the PDF from the local temporary file
console.log("Loading into Pinecone");
const loader = new PDFLoader(tempFilePath);
const docs = (await loader.load()) as PDFPage[];
console.log("Loaded into Pinecone");
// Split the PDFpage into smaller chunks
const documents = await Promise.all(docs.map(page=>prepareDocument(page)));
// console.log(documents);
// Vectorise and embed individual documents
const records = await Promise.all(documents.flat().map(doc=>embedDocument(doc)));

// Load the Pinecone client
// const client = await getPinecone();

console.log("Indexing into Pinecone");
const namespace = convertToASCII(file_key);
if(pinecone){
    const index = pinecone.index('askpdfanything2');
    await index.namespace(namespace).upsert(records);
    console.log("Indexed into Pinecone");
}else{
    console.error('Pinecone not initialized');
}


// Optionally, clean up the temporary file after processing
// await fs.unlink(tempFilePath);

// Return docs or process further as needed
return documents[0];
}

export const truncateStringByBytes = (str: string, numBytes: number) => {
const encoder = new TextEncoder();
return new TextDecoder().decode(encoder.encode(str).slice(0, numBytes));

}

async function prepareDocument(page: PDFPage) {
    let { pageContent } = page;
    const { metadata } = page;
    pageContent = pageContent.replace(/\n/g, '');
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text : truncateStringByBytes(pageContent, 36000)
            },
        }),
    ])
    return docs;

}
