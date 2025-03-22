import OpenAI from "openai";

// Configure for Nebius AI
const client = new OpenAI({
  baseURL: 'https://api.studio.nebius.com/v1/',
  apiKey: process.env.OPENAI_API_KEY2,
});

export async function getEmbeddings(text: string) {
  try {
    console.log("Calling Nebius embeddings API for ", text);
    const response = await client.embeddings.create({
      model: "intfloat/e5-mistral-7b-instruct",
      input: text.replace(/\n/g, " "),
    });
    console.log("Embeddings response", response);
    return response.data[0].embedding as number[];
  } catch (error) {
    console.log("Error calling Nebius embeddings API", error);
    throw error;
  }
}
