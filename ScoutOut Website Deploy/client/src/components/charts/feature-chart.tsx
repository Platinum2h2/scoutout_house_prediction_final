import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export default function FeatureChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const { data: trendData } = useQuery({
    queryKey: ['/api/market-trends'],
  }) as { data?: { 
    priceHistory: Array<{ month: string; price: number; date: string }>;
    featureCorrelations: Array<{ feature: string; correlation: number }>;
  } };

  useEffect(() => {
    if (!trendData || !chartRef.current) return;

    // Dynamically import Plotly to avoid SSR issues
    import('plotly.js-dist-min').then((Plotly) => {
      const trace = {
        type: 'scatterpolar',
        r: trendData.featureCorrelations.map((item: any) => Math.abs(item.correlation * 100)),
        theta: trendData.featureCorrelations.map((item: any) => item.feature),
        fill: 'toself',
        line: { color: '#3B82F6' },
        fillcolor: 'rgba(59, 130, 246, 0.1)'
      };

      const layout = {
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 50]
          }
        },
        showlegend: false,
        margin: { t: 20, b: 20, l: 20, r: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, sans-serif' }
      };

      const config = {
        responsive: true,
        displayModeBar: false
      };

      Plotly.newPlot(chartRef.current!, [trace], layout, config);
    }).catch(console.error);
  }, [trendData]);

  if (!trendData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  return <div ref={chartRef} className="h-64" />;
}
