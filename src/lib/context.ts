import { getEmbeddings } from './embeddings';
import { Pinecone} from '@pinecone-database/pinecone';
import {convertToASCII} from './utils';

export async function getMatchesUsingEmbeddings(embeddings: number[], file_key: string) {
    try{
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        
        const index = pinecone.index('askpdfanything2');

        try{
            const namespace = convertToASCII(file_key);
            const queryResponse =  await index.namespace(namespace).query({
                vector: embeddings,
                topK: 5,
                includeMetadata: true,
                // namespace
            });
            return queryResponse.matches || [];
        }
        catch(e){
            console.error("Get Matches Inialisation Error",e);
        }
    }
    catch(e){
        console.error("Get embeddings Inialisation Error",e);
    }
}

export async function getContext(query:string, file_key: string) {
    const embeddings = await getEmbeddings(query);
    const matches = await getMatchesUsingEmbeddings(embeddings, file_key) || [];
    console.log("Matches", matches);
    const qualifyingMatches = matches.filter((match) => (match.score ?? 0) > 0.5);

    type Metadata = {
        text: string;
        pageNumber: number;
    }
    console.log("Qualifying Matches", qualifyingMatches);
    const docs = qualifyingMatches.map((match) => (match.metadata as Metadata).text);
    console.log("Context", docs);
    return docs.join('\n').substring(0, 10000);
}