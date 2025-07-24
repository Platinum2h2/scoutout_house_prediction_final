import { predictions, batchJobs, priceProjections, type Prediction, type InsertPrediction, type BatchJob, type InsertBatchJob, type PriceProjection, type InsertPriceProjection } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Prediction methods
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPrediction(id: number): Promise<Prediction | undefined>;
  getAllPredictions(): Promise<Prediction[]>;
  
  // Price projection methods
  createPriceProjection(projection: InsertPriceProjection): Promise<PriceProjection>;
  getPriceProjections(predictionId: number): Promise<PriceProjection[]>;
  
  // Batch job methods
  createBatchJob(job: InsertBatchJob): Promise<BatchJob>;
  getBatchJob(id: number): Promise<BatchJob | undefined>;
  updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined>;
  getAllBatchJobs(): Promise<BatchJob[]>;
}

export class MemStorage implements IStorage {
  private predictions: Map<number, Prediction>;
  private batchJobs: Map<number, BatchJob>;
  private priceProjections: Map<number, PriceProjection[]>;
  private currentPredictionId: number;
  private currentBatchJobId: number;
  private currentProjectionId: number;

  constructor() {
    this.predictions = new Map();
    this.batchJobs = new Map();
    this.priceProjections = new Map();
    this.currentPredictionId = 1;
    this.currentBatchJobId = 1;
    this.currentProjectionId = 1;
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      address: insertPrediction.address || null,
      createdAt: new Date(),
      investmentScore: insertPrediction.investmentScore || null,
      appreciationPotential: insertPrediction.appreciationPotential || null,
      riskScore: insertPrediction.riskScore || null,
      confidence: insertPrediction.confidence || null,
      predictedPrice: insertPrediction.predictedPrice || null,
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async getAllPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createBatchJob(insertJob: InsertBatchJob): Promise<BatchJob> {
    const id = this.currentBatchJobId++;
    const job: BatchJob = {
      ...insertJob,
      id,
      status: insertJob.status || "processing",
      totalRecords: insertJob.totalRecords || null,
      processedRecords: 0,
      createdAt: new Date(),
      completedAt: null,
    };
    this.batchJobs.set(id, job);
    return job;
  }

  async getBatchJob(id: number): Promise<BatchJob | undefined> {
    return this.batchJobs.get(id);
  }

  async updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const job = this.batchJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.batchJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getAllBatchJobs(): Promise<BatchJob[]> {
    return Array.from(this.batchJobs.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createPriceProjection(insertProjection: InsertPriceProjection): Promise<PriceProjection> {
    const id = this.currentProjectionId++;
    const projection: PriceProjection = {
      ...insertProjection,
      id,
      createdAt: new Date(),
      predictionId: insertProjection.predictionId || 0,
      marketFactors: insertProjection.marketFactors || null,
    };
    
    const predId = projection.predictionId;
    if (predId !== null) {
      const existing = this.priceProjections.get(predId) || [];
      existing.push(projection);
      this.priceProjections.set(predId, existing);
    }
    
    return projection;
  }

  async getPriceProjections(predictionId: number): Promise<PriceProjection[]> {
    const projections = this.priceProjections.get(predictionId) || [];
    return projections.sort((a, b) => a.year - b.year);
  }
}

export class DatabaseStorage implements IStorage {
  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db
      .insert(predictions)
      .values(insertPrediction)
      .returning();
    return prediction;
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id));
    return prediction || undefined;
  }

  async getAllPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }

  async createBatchJob(insertJob: InsertBatchJob): Promise<BatchJob> {
    const [job] = await db
      .insert(batchJobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async getBatchJob(id: number): Promise<BatchJob | undefined> {
    const [job] = await db.select().from(batchJobs).where(eq(batchJobs.id, id));
    return job || undefined;
  }

  async updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const [job] = await db
      .update(batchJobs)
      .set(updates)
      .where(eq(batchJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getAllBatchJobs(): Promise<BatchJob[]> {
    return await db.select().from(batchJobs).orderBy(desc(batchJobs.createdAt));
  }

  async createPriceProjection(insertProjection: InsertPriceProjection): Promise<PriceProjection> {
    const [projection] = await db
      .insert(priceProjections)
      .values(insertProjection)
      .returning();
    return projection;
  }

  async getPriceProjections(predictionId: number): Promise<PriceProjection[]> {
    return await db.select().from(priceProjections)
      .where(eq(priceProjections.predictionId, predictionId))
      .orderBy(priceProjections.year);
  }
}

export const storage = new DatabaseStorage();
