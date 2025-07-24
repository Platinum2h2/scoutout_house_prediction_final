import { useState, useEffect } from "react";
import { Home, Sparkles, BarChart3, Upload, TrendingUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import PredictionForm from "@/components/prediction-form";
import PredictionResults from "@/components/prediction-results";
import TimelinePrediction from "@/components/timeline-prediction";
import BatchUpload from "@/components/batch-upload";
import TrendChart from "@/components/charts/trend-chart";
import FeatureChart from "@/components/charts/feature-chart";
import { GeographicMap } from "@/components/geographic-map";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("predict");
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [timelineYears, setTimelineYears] = useState(10);
  const [mapLocation, setMapLocation] = useState({ lat: 40.7128, lon: -74.0060, address: "New York, NY" });

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.observe-animate').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 px-6 py-4 animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center p-1">
              <img 
                src="/attached_assets/image_1753234546114.webp" 
                alt="ScoutOut AI Logo" 
                className="w-full h-full object-contain filter invert"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ScoutOut AI</h1>
              <p className="text-xs text-gray-600">Premium Property Intelligence</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setActiveSection("predict")}
              className={`text-gray-700 hover:text-blue-500 transition-colors duration-300 ${activeSection === "predict" ? "text-blue-500 font-semibold" : ""}`}
            >
              Scout
            </button>
            <button 
              onClick={() => setActiveSection("analytics")}
              className={`text-gray-700 hover:text-blue-500 transition-colors duration-300 ${activeSection === "analytics" ? "text-blue-500 font-semibold" : ""}`}
            >
              Intelligence
            </button>
            <button 
              onClick={() => setActiveSection("batch")}
              className={`text-gray-700 hover:text-blue-500 transition-colors duration-300 ${activeSection === "batch" ? "text-blue-500 font-semibold" : ""}`}
            >
              Batch Analysis
            </button>
            <Button className="apple-button">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Modern luxury home exterior" 
            className="w-full h-full object-cover opacity-20" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Scout Out Your
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}Perfect Property's{" "}
                </span>
                Value
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Advanced AI-powered property intelligence platform that scouts market opportunities 
                with precision analytics and instant accurate valuations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="apple-button">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Scouting
                </Button>
                <Button className="glass-button">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Market Intelligence
                </Button>
              </div>
            </div>
            
            {/* Quick Prediction Card */}
            <GlassCard className="p-8 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Property Scout</h3>
              <PredictionForm 
                onPredictionResult={setPredictionResult}
                compact={true}
              />
              {predictionResult && (
                <PredictionResults 
                  result={predictionResult}
                  compact={true}
                />
              )}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 observe-animate" id="predict">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Advanced Property Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI scouts analyze market patterns and property data to deliver precise valuations and investment insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <GlassCard className="p-8 hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Advanced ML Models</h3>
              <p className="text-gray-600 mb-6">
                Multiple regression algorithms including Random Forest, XGBoost, and Neural Networks working together for maximum accuracy.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Model Accuracy</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">96.7%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Training Data</span>
                  <span className="font-semibold">500K+ Properties</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Real-time Market Data</h3>
              <p className="text-gray-600 mb-6">
                Live market updates, neighborhood trends, and economic indicators integrated into every prediction.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data Sources</span>
                  <span className="font-semibold">15+ APIs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Update Frequency</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Every 5 min</Badge>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Beautiful Visualizations</h3>
              <p className="text-gray-600 mb-6">
                Interactive charts and graphs that help you understand market trends and prediction factors.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Chart Types</span>
                  <span className="font-semibold">12 Interactive</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Export Formats</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">PDF, PNG, SVG</Badge>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Map Section - Always Visible */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50 observe-animate" id="map">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">🗺️ Location Intelligence</h2>
            <p className="text-xl text-gray-600">Explore nearby cities, distances, and market opportunities around any location</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <GeographicMap 
              address={mapLocation.address} 
              lat={mapLocation.lat} 
              lon={mapLocation.lon}
              onAddressLocate={async (address) => {
                try {
                  const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
                  const data = await response.json();
                  if (data.success) {
                    setMapLocation({ lat: data.lat, lon: data.lon, address });
                  }
                } catch (error) {
                  console.error('Error geocoding:', error);
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* Advanced Prediction Dashboard */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50 observe-animate" id="analytics">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Intelligence Dashboard</h2>
            <p className="text-xl text-gray-600">Deep market insights and property analysis from our AI scouts</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Detailed Input Form */}
            <div className="lg:col-span-1">
              <GlassCard className="p-8 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Property Details</h3>
                <PredictionForm 
                  onPredictionResult={setPredictionResult}
                  detailed={true}
                />
              </GlassCard>
            </div>
            
            {/* Results and Visualizations */}
            <div className="lg:col-span-2 space-y-8">
              {predictionResult && (
                <>
                  <PredictionResults result={predictionResult} />
                  <TimelinePrediction
                    investmentScore={predictionResult.investmentScore}
                    appreciationPotential={predictionResult.appreciationPotential}
                    riskScore={predictionResult.riskScore}
                    priceProjections={predictionResult.priceProjections}
                    onTimelineChange={(years) => {
                      setTimelineYears(years);
                      // Trigger new prediction with updated timeline
                      // This would be handled in the form component
                    }}
                  />
                  
                  {/* Location Intelligence - Real Geographic Map */}
                  <GeographicMap 
                    address={predictionResult.address || mapLocation.address} 
                    lat={predictionResult.address ? mapLocation.lat : 40.7128}
                    lon={predictionResult.address ? mapLocation.lon : -74.0060}
                    onAddressLocate={async (address) => {
                      try {
                        const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
                        const data = await response.json();
                        if (data.success) {
                          setMapLocation({ lat: data.lat, lon: data.lon, address });
                        }
                      } catch (error) {
                        console.error('Error geocoding:', error);
                      }
                    }}
                  />
                </>
              )}
              
              {/* Location Intelligence - Always show map */}
              {!predictionResult && (
                <div className="text-center p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Location Intelligence Preview</h3>
                  <p className="text-gray-600 mb-6">Enter property details above to see nearby cities and market analysis</p>
                  <GeographicMap 
                    address={mapLocation.address} 
                    lat={mapLocation.lat} 
                    lon={mapLocation.lon}
                    onAddressLocate={async (address) => {
                      try {
                        const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
                        const data = await response.json();
                        if (data.success) {
                          setMapLocation({ lat: data.lat, lon: data.lon, address });
                        }
                      } catch (error) {
                        console.error('Error geocoding:', error);
                      }
                    }}
                  />
                </div>
              )}
              
              {/* Interactive Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <GlassCard className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Market Trend Analysis</h4>
                  <TrendChart />
                </GlassCard>
                
                <GlassCard className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Feature Impact</h4>
                  <FeatureChart />
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Upload Section */}
      <section className="py-20 px-6 observe-animate" id="batch">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Batch Analysis</h2>
            <p className="text-xl text-gray-600">Upload CSV files for comprehensive property portfolio scouting</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Upload Property Data</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Upload CSV files with property details to get bulk predictions. Supports up to 10,000 properties per upload.
                </p>
              </div>
              
              <BatchUpload />
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center p-1">
                  <img 
                    src="/attached_assets/image_1753234546114.webp" 
                    alt="ScoutOut AI Logo" 
                    className="w-full h-full object-contain filter invert"
                  />
                </div>
                <span className="text-xl font-bold">ScoutOut AI</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced AI platform that scouts property opportunities with precision analytics and market intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Price Prediction</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Market Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Batch Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">API Access</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Model Performance</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Data Sources</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <p className="text-gray-400 text-sm">
                Get updates on new features and model improvements.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ScoutOut AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
