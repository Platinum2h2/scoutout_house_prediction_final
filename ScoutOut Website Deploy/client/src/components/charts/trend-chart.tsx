import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export default function TrendChart() {
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
        x: trendData.priceHistory.map((item: any) => item.month),
        y: trendData.priceHistory.map((item: any) => item.price),
        type: 'scatter',
        mode: 'lines+markers',
        line: {
          color: '#3B82F6',
          width: 3
        },
        marker: {
          size: 8,
          color: '#3B82F6'
        }
      };

      const layout = {
        title: '',
        showlegend: false,
        margin: { t: 20, b: 40, l: 60, r: 20 },
        xaxis: { title: 'Month' },
        yaxis: { title: 'Price ($)' },
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
