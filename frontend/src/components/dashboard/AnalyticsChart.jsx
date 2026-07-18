import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const RevenueLineChart = ({ dataPoints = [3000, 7500, 5200, 9800, 14000, 11500] }) => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: dataPoints,
        borderColor: '#FF5A5F',
        backgroundColor: 'rgba(255, 90, 95, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#FF5A5F',
        pointHoverRadius: 8,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};

export const OccupancyDoughnutChart = ({ bookedNights = 18, totalNights = 30 }) => {
  const vacantNights = Math.max(0, totalNights - bookedNights);
  const data = {
    labels: ['Booked Days', 'Vacant Days'],
    datasets: [
      {
        data: [bookedNights, vacantNights],
        backgroundColor: ['#00C9A7', 'rgba(156, 163, 175, 0.15)'],
        borderColor: ['#00C9A7', 'transparent'],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9CA3AF',
          font: { size: 10, weight: 'bold' },
          padding: 15,
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="h-48 w-full flex items-center justify-center relative">
      <Doughnut data={data} options={options} />
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-text-main">
          {Math.round((bookedNights / totalNights) * 100)}%
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
          Occupancy
        </span>
      </div>
    </div>
  );
};
