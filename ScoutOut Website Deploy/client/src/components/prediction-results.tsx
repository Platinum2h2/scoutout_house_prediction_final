import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

interface PredictionResultsProps {
  result: {
    predictedPrice: number;
    confidence?: number;
    investmentScore?: number;
    appreciationPotential?: number;
    riskScore?: number;
    priceRange?: {
      min: number;
      max: number;
    };
    featureImportance?: Record<string, number>;
    priceProjections?: any[];
  };
  compact?: boolean;
}

export default function PredictionResults({ result, compact = false }: PredictionResultsProps) {
  const { predictedPrice, confidence, priceRange, featureImportance } = result;

  if (compact) {
    return (
      <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200/50 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Predicted Value</h4>
          <Badge className="bg-green-100 text-green-700">{(confidence || 0).toFixed(1)}% Confidence</Badge>
        </div>
        <div className="text-3xl font-bold text-gray-800 mb-2">
          ${predictedPrice.toLocaleString()}
        </div>
        <p className="text-sm text-gray-600">Based on current market trends and property features</p>
      </div>
    );
  }

  return (
    <GlassCard className="p-8 shadow-xl prediction-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Prediction Results</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Estimated Value</h4>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            ${predictedPrice.toLocaleString()}
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+12.5% vs. last year</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Confidence Score</h4>
          <div className="text-4xl font-bold text-green-600 mb-2">
            {(confidence || 0).toFixed(1)}%
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="mr-1 h-4 w-4" />
            <span>High accuracy prediction</span>
          </div>
        </div>
      </div>
      
      {priceRange && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Price Range Estimate</h4>
          <div className="relative">
            <Progress value={75} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${priceRange.min.toLocaleString()}</span>
              <span className="font-semibold text-gray-800">${predictedPrice.toLocaleString()}</span>
              <span>${priceRange.max.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {featureImportance && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Price Factors</h4>
          <div className="space-y-3">
            {Object.entries(featureImportance)
              .sort(([,a], [,b]) => b - a)
              .map(([feature, importance]) => {
                const percentage = (importance * 100).toFixed(0);
                const widthPercentage = (importance * 100);
                
                return (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-200 rounded-full h-2 w-16 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
    </GlassCard>
  );
}
