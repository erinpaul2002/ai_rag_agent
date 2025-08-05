import OpenAI, { AzureOpenAI } from 'openai';
import { config } from 'dotenv';
config();



// Chat Client Options Interface
export interface AzureOpenAIChatClientOptions {
  apiKey: string;
  baseURL: string;
  apiVersion: string;
  model: string;
}



// Azure OpenAI Chat Client
class AzureOpenAIChatClient {
  private client: OpenAI;
  private model: string;

  constructor(options: AzureOpenAIChatClientOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options.baseURL,
      defaultQuery: { 'api-version': options.apiVersion },
      defaultHeaders: { 'api-key': options.apiKey },
    });
    this.model = options.model;
  }

  async chatCompletion(
    messages: import('openai/resources/chat/completions').ChatCompletionMessageParam[],
    max_tokens = 1024,
    temperature = 0.7
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      messages,
      max_tokens,
      temperature,
      model: this.model,
    });
    if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
      throw new Error('No response from Azure OpenAI');
    }
    return response.choices[0].message.content.trim();
  }
}


// Singleton Chat Client Instance
const azureOpenAIChatClient = new AzureOpenAIChatClient({
  apiKey: process.env.AZURE_OAI_KEY!,
  baseURL: process.env.AZURE_OAI_BASEURL!,
  apiVersion: process.env.AZURE_OAI_API_VERSION!,
  model: process.env.AZURE_OAI_MODEL || 'gpt-4o-mini',
});

export { AzureOpenAIChatClient, azureOpenAIChatClient };


// Embedding Client Options Interface
export interface AzureOpenAIEmbedClientOptions {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion?: string;
}


// Azure OpenAI Embedding Client
class AzureOpenAIEmbedClient {
  private client: AzureOpenAI;
  private modelName: string;

  constructor(options: AzureOpenAIEmbedClientOptions, modelName: string) {
    this.client = new AzureOpenAI({
      endpoint: options.endpoint,
      apiKey: options.apiKey,
      deployment: options.deployment,
      apiVersion: options.apiVersion || '2024-04-01-preview',
    });
    this.modelName = modelName;
  }

  async embed(inputs: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      input: inputs,
      model: this.modelName,
    });
    return response.data.map((item: any) => item.embedding);
  }
}


// Singleton Embedding Client Instance
const azureOpenAIEmbedClient = new AzureOpenAIEmbedClient(
  {
    endpoint: process.env.AZURE_OAI_EMBED_ENDPOINT!,
    apiKey: process.env.AZURE_OAI_KEY!,
    deployment: process.env.AZURE_OAI_EMBED_DEPLOYMENT!,
    apiVersion: process.env.AZURE_OAI_EMBED_API_VERSION,
  },
  process.env.AZURE_OAI_EMBED_MODEL || 'text-embedding-3-large'
);

export { AzureOpenAIEmbedClient, azureOpenAIEmbedClient };
