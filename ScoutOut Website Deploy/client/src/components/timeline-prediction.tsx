import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, BarChart3 } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import EnhancedTimelineChart from "./enhanced-timeline-chart";

interface TimelineControlsProps {
  timelineYears: number;
  onTimelineChange: (years: number) => void;
  useSlider: boolean;
  onToggleSlider: (value: boolean) => void;
}

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "yellow" | "red";
}

interface PriceProjection {
  year: number;
  projectedPrice: number;
  confidenceLevel: number;
  marketFactors: string;
}

interface TimelinePredictionProps {
  investmentScore?: number;
  appreciationPotential?: number;
  riskScore?: number;
  priceProjections?: PriceProjection[];
  onTimelineChange: (years: number) => void;
}

function TimelineControls({ timelineYears, onTimelineChange, useSlider, onToggleSlider }: TimelineControlsProps) {
  const [inputValue, setInputValue] = useState(timelineYears.toString());

  const handleSliderChange = (value: number[]) => {
    onTimelineChange(value[0]);
    setInputValue(value[0].toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      onTimelineChange(numValue);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Timeline Prediction</h3>
            <p className="text-sm text-gray-600">Adjust the prediction timeline</p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="slider-toggle" className="text-sm">Use Slider</Label>
            <Switch
              id="slider-toggle"
              checked={useSlider}
              onCheckedChange={onToggleSlider}
            />
          </div>
        </div>

        <div className="space-y-4">
          {useSlider ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Years: {timelineYears}</Label>
              <Slider
                value={[timelineYears]}
                onValueChange={handleSliderChange}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="timeline-input" className="text-sm font-medium">
                Timeline (Years)
              </Label>
              <Input
                id="timeline-input"
                type="number"
                min="1"
                max="30"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 year</span>
            <span>30 years</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ScoreCard({ title, score, icon, description, color }: ScoreCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white";
      case "blue":
        return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white";
      case "yellow":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "red":
        return "bg-gradient-to-r from-red-400 to-pink-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const getScoreCategory = (score: number, isRisk: boolean = false) => {
    if (isRisk) {
      if (score <= 25) return "Low";
      if (score <= 50) return "Moderate";
      if (score <= 75) return "High";
      return "Very High";
    } else {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Fair";
      return "Poor";
    }
  };

  const isRiskScore = title.toLowerCase().includes("risk");

  return (
    <GlassCard className="p-6 hover:scale-105 transition-transform duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${getColorClasses(color)}`}>
              {icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{title}</h4>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">{Math.round(score)}</span>
            <Badge variant="secondary" className="text-xs">
              {getScoreCategory(score, isRiskScore)}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getColorClasses(color)}`}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ProjectionChart({ projections }: { projections: PriceProjection[] }) {
  if (!projections || projections.length === 0) return null;

  const maxPrice = Math.max(...projections.map(p => p.projectedPrice));
  const minPrice = Math.min(...projections.map(p => p.projectedPrice));
  const priceRange = maxPrice - minPrice;

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Price Projection Timeline</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projections.slice(0, 6).map((projection, index) => {
              const heightPercent = priceRange > 0 ? ((projection.projectedPrice - minPrice) / priceRange) * 100 : 50;
              
              return (
                <div key={projection.year} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{projection.year}</span>
                    <span className="text-gray-600">{Math.round(projection.confidenceLevel * 100)}%</span>
                  </div>
                  
                  <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-purple-500 transition-all duration-1000 rounded-lg"
                      style={{ 
                        height: `${Math.max(heightPercent, 10)}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-800">
                      ${Math.round(projection.projectedPrice).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((projection.projectedPrice - projections[0].projectedPrice) / projections[0].projectedPrice * 100).toFixed(1)}% growth
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {projections.length > 6 && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                +{projections.length - 6} more years
              </Badge>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default function TimelinePrediction({ 
  investmentScore = 0, 
  appreciationPotential = 0, 
  riskScore = 0, 
  priceProjections = [],
  onTimelineChange 
}: TimelinePredictionProps) {
  const [timelineYears, setTimelineYears] = useState(10);
  const [useSlider, setUseSlider] = useState(true);

  const handleTimelineChange = (years: number) => {
    setTimelineYears(years);
    onTimelineChange(years);
  };

  return (
    <div className="space-y-8">
      {/* Timeline Controls */}
      <TimelineControls
        timelineYears={timelineYears}
        onTimelineChange={handleTimelineChange}
        useSlider={useSlider}
        onToggleSlider={setUseSlider}
      />

      {/* Scoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          title="Investment Score"
          score={investmentScore}
          icon={<Target className="w-6 h-6" />}
          description="Overall investment potential"
          color="blue"
        />
        <ScoreCard
          title="Appreciation Potential"
          score={appreciationPotential}
          icon={<TrendingUp className="w-6 h-6" />}
          description="Expected price growth"
          color="green"
        />
        <ScoreCard
          title="Risk Assessment"
          score={riskScore}
          icon={<AlertTriangle className="w-6 h-6" />}
          description="Investment risk level"
          color="yellow"
        />
      </div>

      {/* Enhanced Interactive Charts */}
      <EnhancedTimelineChart 
        priceProjections={priceProjections}
        investmentScore={investmentScore}
        appreciationPotential={appreciationPotential}
        riskScore={riskScore}
        timelineYears={timelineYears}
      />

      {/* Traditional Projection Chart for Comparison */}
      <ProjectionChart projections={priceProjections} />

      {/* Summary Insights */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">Investment Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Key Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment Grade:</span>
                  <Badge variant={investmentScore >= 70 ? "default" : investmentScore >= 50 ? "secondary" : "destructive"}>
                    {investmentScore >= 70 ? "Premium" : investmentScore >= 50 ? "Standard" : "High Risk"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Outlook:</span>
                  <Badge variant={appreciationPotential >= 70 ? "default" : appreciationPotential >= 50 ? "secondary" : "outline"}>
                    {appreciationPotential >= 70 ? "Strong" : appreciationPotential >= 50 ? "Moderate" : "Limited"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Level:</span>
                  <Badge variant={riskScore <= 30 ? "default" : riskScore <= 60 ? "secondary" : "destructive"}>
                    {riskScore <= 30 ? "Low" : riskScore <= 60 ? "Moderate" : "High"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Projected Returns</h4>
              <div className="space-y-2 text-sm">
                {priceProjections.slice(0, 3).map((projection) => {
                  const currentPrice = priceProjections[0]?.projectedPrice || projection.projectedPrice;
                  const returnPercent = ((projection.projectedPrice - currentPrice) / currentPrice * 100).toFixed(1);
                  
                  return (
                    <div key={projection.year} className="flex justify-between">
                      <span className="text-gray-600">{projection.year}:</span>
                      <span className="font-medium text-gray-800">+{returnPercent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}