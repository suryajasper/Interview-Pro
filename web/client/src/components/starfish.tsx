import React, { useEffect, useRef } from 'react';
import Chart, { FontSpec } from 'chart.js/auto';

interface StarfishProps {
  attributes: string[];
  values: IStarfish;
}

export interface IStarfish {
  overall: number[];
  last: number[];
}

export const StarfishDiagram: React.FC<StarfishProps> = ({ attributes, values }) => {
  const chartRef = useRef<Chart>();

  const chartFont : Partial<FontSpec> = {
    size: 15,
    family: "Satoshi",
    weight: 'normal',
  }

  useEffect(() => {
    if (!chartRef.current) {
      Chart.defaults.color = '#fff';

      const ctx = document.getElementById('starfish-chart') as HTMLCanvasElement;
      chartRef.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: attributes,
          datasets: [
            {
              label: 'Overall',
              data: values.overall,
              backgroundColor: 'rgba(120, 0, 0, 0.2)',
              borderColor: 'rgba(120, 0, 0, 1)',
              borderWidth: 2
            },
            {
              label: 'Last Response',
              data: values.last,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          // responsive: false,
          maintainAspectRatio: false,
          // aspectRatio: 0.5,
          scales: {
            r: {
              max: 5,
              min: 0,
              ticks: {
                stepSize: 1,
                backdropColor: "#00000000",
                textStrokeColor: "#fff",
              },
              pointLabels: {
                font: chartFont,
              }
            },
          },
          layout: {
            padding: {
              top: 20
            }
          },
          plugins: {
            legend: {
              position: 'left',
              labels: {
                font: chartFont,
              }
            }
          },
        }
      });
    } else {
      chartRef.current.data.labels = attributes;
      chartRef.current.data.datasets[0].data = values.overall;
      chartRef.current.data.datasets[1].data = values.last;
      chartRef.current.update();
    }
  }, [attributes, values]);

  return (
    <div className="flex-center">
      <canvas id="starfish-chart" width="400" height="400"></canvas>
    </div>
  );
};