import { BaseRepository } from "./base";
import { AIConversation, InsertAIConversation } from "../types";
import { aiConversations, aiMessages, aiUsage, modelUsage, promptTemplates } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export class AIRepository extends BaseRepository<AIConversation, InsertAIConversation, typeof aiConversations> {
  constructor() {
    super(aiConversations);
  }

  // Create a new chat session thread
  async createConversation(profileId: string, title: string): Promise<AIConversation> {
    return await this.insert({
      profileId,
      title,
    });
  }

  // Append message to conversation thread
  async addMessage(data: {
    conversationId: string;
    role: string;
    content: string;
    thinking?: string;
  }): Promise<any> {
    const results = await this.db
      .insert(aiMessages)
      .values(data)
      .returning();
    return results[0];
  }

  // Retrieve message history
  async getMessages(conversationId: string): Promise<any[]> {
    return await this.db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(aiMessages.createdAt);
  }

  // Log raw token metrics
  async logUsage(data: {
    profileId: string;
    modelId: string;
    promptTokens: number;
    completionTokens: number;
  }): Promise<void> {
    const totalTokens = data.promptTokens + data.completionTokens;
    await this.db.insert(aiUsage).values({
      ...data,
      totalTokens,
    });
  }

  // Log conversation costing
  async logCost(conversationId: string, tokensUsed: number, cost: string): Promise<void> {
    await this.db.insert(modelUsage).values({
      conversationId,
      tokensUsed,
      cost,
    });
  }

  // Get prompt template
  async getPromptTemplate(name: string): Promise<string | null> {
    const results = await this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.name, name))
      .limit(1);
    return results[0]?.content || null;
  }
}
