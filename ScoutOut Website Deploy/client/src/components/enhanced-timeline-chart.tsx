import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Download, TrendingUp, BarChart3, LineChart, PieChart } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import html2canvas from "html2canvas";

interface PriceProjection {
  year: number;
  projectedPrice: number;
  confidenceLevel: number;
  marketFactors: string;
}

interface EnhancedTimelineChartProps {
  priceProjections: PriceProjection[];
  investmentScore: number;
  appreciationPotential: number;
  riskScore: number;
  timelineYears: number;
}

export default function EnhancedTimelineChart({
  priceProjections = [],
  investmentScore,
  appreciationPotential,
  riskScore,
  timelineYears
}: EnhancedTimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'growth' | 'confidence'>('timeline');

  // Ensure we have data for all requested years
  const completeProjections: PriceProjection[] = [];
  const currentYear = new Date().getFullYear();
  const basePrice = priceProjections[0]?.projectedPrice || 1000000;
  
  for (let i = 1; i <= timelineYears; i++) {
    const existing = priceProjections.find(p => p.year === currentYear + i);
    if (existing) {
      completeProjections.push(existing);
    } else {
      // Generate missing years with interpolation
      const growthRate = 0.03 + (investmentScore - 50) / 2000;
      const projectedPrice = basePrice * Math.pow(1 + growthRate, i);
      const confidence = Math.max(0.5, 0.95 - (i * 0.04));
      
      completeProjections.push({
        year: currentYear + i,
        projectedPrice: Math.round(projectedPrice),
        confidenceLevel: confidence,
        marketFactors: JSON.stringify({
          base_rate: (growthRate * 100).toFixed(2),
          interpolated: true
        })
      });
    }
  }

  const maxPrice = Math.max(...completeProjections.map(p => p.projectedPrice));
  const minPrice = Math.min(...completeProjections.map(p => p.projectedPrice));
  const priceRange = maxPrice - minPrice;

  const exportVisuals = async () => {
    if (!chartRef.current) return;

    try {
      // Capture the main chart area
      const mainCanvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        width: chartRef.current.scrollWidth,
        height: chartRef.current.scrollHeight
      });

      // Export main analysis image
      const mainLink = document.createElement('a');
      mainLink.download = `scoutout-analysis-${Date.now()}.png`;
      mainLink.href = mainCanvas.toDataURL('image/png');
      mainLink.click();

      // Wait a bit before next export
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture individual chart sections if they exist
      const chartSections = chartRef.current.querySelectorAll('[data-chart-section]');
      for (let i = 0; i < chartSections.length; i++) {
        const section = chartSections[i] as HTMLElement;
        const sectionCanvas = await html2canvas(section, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
          width: section.scrollWidth,
          height: section.scrollHeight
        });

        const sectionLink = document.createElement('a');
        sectionLink.download = `scoutout-chart-${i + 1}-${Date.now()}.png`;
        sectionLink.href = sectionCanvas.toDataURL('image/png');
        sectionLink.click();

        // Wait between exports
        await new Promise(resolve => setTimeout(resolve, 300));
      }

    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderTimelineView = () => (
    <div className="space-y-6">
      {/* Price Timeline Chart */}
      <div data-chart-section="timeline" className="relative h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 overflow-x-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Price Evolution Timeline</h4>
          <div className="flex items-end h-48 space-x-2" style={{ minWidth: `${Math.max(completeProjections.length * 60, 600)}px` }}>
            {completeProjections.map((projection, index) => {
              const heightPercent = priceRange > 0 ? ((projection.projectedPrice - minPrice) / priceRange) * 100 : 50;
              const currentPrice = basePrice;
              const growthPercent = ((projection.projectedPrice - currentPrice) / currentPrice * 100).toFixed(1);
              
              return (
                <div key={projection.year} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-1000 hover:from-blue-600 hover:to-purple-600 cursor-pointer"
                      style={{ 
                        height: `${Math.max(heightPercent * 1.9, 20)}px`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg rounded-lg p-2 text-xs whitespace-nowrap border">
                      <div className="font-semibold">${projection.projectedPrice.toLocaleString()}</div>
                      <div className="text-green-600">+{growthPercent}%</div>
                      <div className="text-gray-500">{Math.round(projection.confidenceLevel * 100)}% confidence</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className="font-medium">{projection.year}</div>
                    <div className="text-green-600">+{growthPercent}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All Years Grid */}
      <div data-chart-section="timeline-grid" className="overflow-x-auto">
        <div 
          className="grid gap-4" 
          style={{ 
            gridTemplateColumns: `repeat(${Math.max(completeProjections.length, 5)}, minmax(200px, 1fr))`,
            minWidth: `${Math.max(completeProjections.length * 220, 1100)}px` 
          }}
        >
        {completeProjections.map((projection, index) => {
          const currentPrice = basePrice;
          const totalReturn = ((projection.projectedPrice - currentPrice) / currentPrice * 100).toFixed(1);
          const annualReturn = (Math.pow(projection.projectedPrice / currentPrice, 1 / (index + 1)) - 1) * 100;
          
          return (
            <GlassCard key={projection.year} className="p-4 hover:scale-105 transition-transform duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">{projection.year}</span>
                  <Badge 
                    variant="secondary"
                    className={`text-xs ${
                      projection.confidenceLevel > 0.8 ? 'bg-green-100 text-green-700' :
                      projection.confidenceLevel > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {Math.round(projection.confidenceLevel * 100)}%
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${Math.round(projection.projectedPrice / 1000)}K
                  </div>
                  <div className="text-xs text-gray-500">
                    ${projection.projectedPrice.toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Return:</span>
                    <span className="font-semibold text-green-600">+{totalReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual:</span>
                    <span className="font-semibold text-blue-600">{annualReturn.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(annualReturn * 2, 100)}%`,
                      animationDelay: `${index * 50}ms`
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
        </div>
      </div>
    </div>
  );

  const renderGrowthView = () => (
    <div className="space-y-6">
      <div data-chart-section="growth" className="h-64 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 overflow-x-auto">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Growth Rate Analysis</h4>
        <div className="flex items-end h-40 space-x-1" style={{ minWidth: `${Math.max(completeProjections.length * 40, 400)}px` }}>
          {completeProjections.map((projection, index) => {
            const currentPrice = basePrice;
            const annualReturn = (Math.pow(projection.projectedPrice / currentPrice, 1 / (index + 1)) - 1) * 100;
            const height = Math.min(Math.max(annualReturn * 3, 10), 140);
            
            return (
              <div key={projection.year} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-teal-500 rounded-t transition-all duration-1000"
                  style={{ height: `${height}px`, animationDelay: `${index * 100}ms` }}
                />
                <div className="text-xs mt-1 text-center">
                  <div>{projection.year}</div>
                  <div className="font-semibold text-green-600">{annualReturn.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderConfidenceView = () => (
    <div className="space-y-6">
      <div data-chart-section="confidence" className="h-96 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-6">Confidence Level Over Time</h4>
        <div className="relative h-72">
          <svg viewBox="0 0 600 240" className="w-full h-full">
            <defs>
              <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(percent => (
              <g key={percent}>
                <line
                  x1="80"
                  y1={200 - (percent * 1.5)}
                  x2="520"
                  y2={200 - (percent * 1.5)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x="70"
                  y={205 - (percent * 1.5)}
                  textAnchor="end"
                  className="text-sm fill-gray-600"
                >
                  {percent}%
                </text>
              </g>
            ))}
            
            {/* Y-axis label */}
            <text
              x="30"
              y="120"
              textAnchor="middle"
              className="text-sm fill-gray-700 font-medium"
              transform="rotate(-90, 30, 120)"
            >
              Confidence Level (%)
            </text>
            
            {/* X-axis */}
            <line x1="80" y1="200" x2="520" y2="200" stroke="#6b7280" strokeWidth="2"/>
            
            {/* X-axis labels - show every 2nd or 3rd year for long timelines */}
            {completeProjections.map((p, i) => {
              const x = 80 + (i * (440 / (completeProjections.length - 1)));
              const showLabel = completeProjections.length <= 10 || i % Math.ceil(completeProjections.length / 6) === 0 || i === completeProjections.length - 1;
              
              return (
                <g key={p.year}>
                  <line
                    x1={x}
                    y1="200"
                    x2={x}
                    y2="205"
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                  {showLabel && (
                    <text
                      x={x}
                      y="220"
                      textAnchor="middle"
                      className="text-sm fill-gray-600"
                    >
                      {p.year}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* X-axis label */}
            <text
              x="300"
              y="235"
              textAnchor="middle"
              className="text-sm fill-gray-700 font-medium"
            >
              Year
            </text>
            
            {/* Confidence line */}
            <path
              d={`M 80,${200 - (completeProjections[0]?.confidenceLevel || 0.9) * 150} ${completeProjections
                .slice(1)
                .map((p, i) => {
                  const x = 80 + ((i + 1) * (440 / (completeProjections.length - 1)));
                  const y = 200 - (p.confidenceLevel * 150);
                  return `L ${x},${y}`;
                })
                .join(' ')}`}
              stroke="url(#confidenceGradient)"
              strokeWidth="3"
              fill="none"
            />
            
            {/* Data points with selective value labels */}
            {completeProjections.map((p, i) => {
              const x = 80 + (i * (440 / (completeProjections.length - 1)));
              const y = 200 - (p.confidenceLevel * 150);
              const confidencePercent = Math.round(p.confidenceLevel * 100);
              
              // Show labels only for key points to avoid clutter
              const showLabel = completeProjections.length <= 8 || 
                              i === 0 || 
                              i === completeProjections.length - 1 || 
                              i % Math.ceil(completeProjections.length / 5) === 0;
              
              return (
                <g key={p.year}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#ea580c"
                    className="hover:r-7 transition-all cursor-pointer"
                  />
                  {showLabel && (
                    <rect
                      x={x - 15}
                      y={y - 22}
                      width="30"
                      height="16"
                      fill="white"
                      fillOpacity="0.9"
                      stroke="#ea580c"
                      strokeWidth="1"
                      rx="3"
                    />
                  )}
                  {showLabel && (
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-xs fill-gray-800 font-medium"
                    >
                      {confidencePercent}%
                    </text>
                  )}
                  
                  {/* Tooltip on hover for all points */}
                  <title>{p.year}: {confidencePercent}% confidence</title>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );

  if (completeProjections.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-gray-500">No projection data available</div>
      </GlassCard>
    );
  }

  return (
    <div ref={chartRef} className="space-y-6">
      {/* Header with Export and View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800">Timeline Analysis</h3>
          <Badge variant="outline" className="text-xs">
            {timelineYears} Year Projection
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white/50 rounded-lg p-1">
            <Button
              variant={activeView === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('timeline')}
              className="text-xs"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Timeline
            </Button>
            <Button
              variant={activeView === 'growth' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('growth')}
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Growth
            </Button>
            <Button
              variant={activeView === 'confidence' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('confidence')}
              className="text-xs"
            >
              <LineChart className="w-3 h-3 mr-1" />
              Confidence
            </Button>
          </div>
          
          <Button 
            onClick={exportVisuals}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            size="sm"
            title="Export all charts as PNG images"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Images
          </Button>
        </div>
      </div>

      {/* Dynamic Content Based on View */}
      <GlassCard className="p-6">
        {activeView === 'timeline' && renderTimelineView()}
        {activeView === 'growth' && renderGrowthView()}
        {activeView === 'confidence' && renderConfidenceView()}
      </GlassCard>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">
            ${Math.round((completeProjections[completeProjections.length - 1]?.projectedPrice || 0) / 1000)}K
          </div>
          <div className="text-xs opacity-90">Final Value</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">
            +{(((completeProjections[completeProjections.length - 1]?.projectedPrice || basePrice) - basePrice) / basePrice * 100).toFixed(0)}%
          </div>
          <div className="text-xs opacity-90">Total Return</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">
            {Math.round((completeProjections[completeProjections.length - 1]?.confidenceLevel || 0) * 100)}%
          </div>
          <div className="text-xs opacity-90">Final Confidence</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">
            {((Math.pow((completeProjections[completeProjections.length - 1]?.projectedPrice || basePrice) / basePrice, 1 / timelineYears) - 1) * 100).toFixed(1)}%
          </div>
          <div className="text-xs opacity-90">Avg Annual</div>
        </div>
      </div>
    </div>
  );
}