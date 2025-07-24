import { apiRequest } from "./queryClient";

export interface PredictionRequest {
  avgAreaIncome: number;
  avgAreaHouseAge: number;
  avgAreaNumberOfRooms: number;
  avgAreaNumberOfBedrooms: number;
  areaPopulation: number;
  address?: string;
}

export interface PredictionResponse {
  id: number;
  predictedPrice: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  featureImportance: Record<string, number>;
}

export interface BatchJobResponse {
  id: number;
  fileName: string;
  status: 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  createdAt: string;
  completedAt?: string;
}

export const mlApi = {
  async predict(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await apiRequest("POST", "/api/predict", data);
    return response.json();
  },

  async getAllPredictions() {
    const response = await apiRequest("GET", "/api/predictions");
    return response.json();
  },

  async uploadBatch(file: File): Promise<{ jobId: number; message: string }> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const response = await fetch('/api/batch-predict', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  async getBatchJob(jobId: number): Promise<BatchJobResponse> {
    const response = await apiRequest("GET", `/api/batch-jobs/${jobId}`);
    return response.json();
  },

  async getAllBatchJobs(): Promise<BatchJobResponse[]> {
    const response = await apiRequest("GET", "/api/batch-jobs");
    return response.json();
  },

  async getMarketTrends() {
    const response = await apiRequest("GET", "/api/market-trends");
    return response.json();
  },
};
