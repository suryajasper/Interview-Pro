import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

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

  useEffect(() => {
    if (!chartRef.current) {
      const ctx = document.getElementById('starfish-chart') as HTMLCanvasElement;
      chartRef.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: attributes,
          datasets: [
            {
              label: 'Overall',
              data: values.overall,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Last',
              data: values.last,
              backgroundColor: 'rgba(162, 54, 235, 0.2)',
              borderColor: 'rgba(162, 54, 235, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: false,
          maintainAspectRatio: true,
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
                font: {
                  size: 13
                }
              }
            }
          },
          layout: {
            padding: {
              top: 20
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