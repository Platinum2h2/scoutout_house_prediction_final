import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  avgAreaIncome: real("avg_area_income").notNull(),
  avgAreaHouseAge: real("avg_area_house_age").notNull(),
  avgAreaNumberOfRooms: real("avg_area_number_of_rooms").notNull(),
  avgAreaNumberOfBedrooms: real("avg_area_number_of_bedrooms").notNull(),
  areaPopulation: real("area_population").notNull(),
  predictedPrice: real("predicted_price"),
  confidence: real("confidence"),
  investmentScore: real("investment_score"),
  appreciationPotential: real("appreciation_potential"),
  riskScore: real("risk_score"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceProjections = pgTable("price_projections", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").references(() => predictions.id),
  year: integer("year").notNull(),
  projectedPrice: real("projected_price").notNull(),
  confidenceLevel: real("confidence_level").notNull(),
  marketFactors: text("market_factors"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
});

export const batchJobs = pgTable("batch_jobs", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  totalRecords: integer("total_records"),
  processedRecords: integer("processed_records").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertBatchJob = z.infer<typeof insertBatchJobSchema>;
export type BatchJob = typeof batchJobs.$inferSelect;

// Price projections
export const insertPriceProjectionSchema = createInsertSchema(priceProjections).omit({
  id: true,
  createdAt: true,
});
export type InsertPriceProjection = z.infer<typeof insertPriceProjectionSchema>;
export type PriceProjection = typeof priceProjections.$inferSelect;

// Form validation schemas
export const predictionFormSchema = z.object({
  avgAreaIncome: z.number().min(1000, "Income must be at least $1,000").max(500000, "Income cannot exceed $500,000"),
  avgAreaHouseAge: z.number().min(0, "Age cannot be negative").max(100, "Age cannot exceed 100 years"),
  avgAreaNumberOfRooms: z.number().min(1, "Must have at least 1 room").max(20, "Cannot exceed 20 rooms"),
  avgAreaNumberOfBedrooms: z.number().min(1, "Must have at least 1 bedroom").max(10, "Cannot exceed 10 bedrooms"),
  areaPopulation: z.number().min(100, "Population must be at least 100").max(1000000, "Population cannot exceed 1,000,000"),
  address: z.string().optional(),
});

export type PredictionForm = z.infer<typeof predictionFormSchema>;
