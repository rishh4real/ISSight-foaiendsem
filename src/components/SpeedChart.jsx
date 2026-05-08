import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function SpeedChart({ speedHistory }) {
  const labels = speedHistory.map((point) =>
    new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(point.timestamp)),
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'ISS speed (km/h)',
        data: speedHistory.map((point) => Number(point.speed.toFixed(2))),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.16)',
        pointBackgroundColor: '#f97316',
        pointBorderWidth: 0,
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
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} km/h`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          callback: (value) => `${Number(value).toLocaleString()}`,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
        },
      },
    },
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-soft-dark">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">ISS Speed Trend</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last 30 tracked updates</p>
        </div>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200">
          {speedHistory.length} points
        </span>
      </div>
      <div className="h-72">
        {speedHistory.length > 1 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-slate-300 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Waiting for two ISS positions to calculate speed.
          </div>
        )}
      </div>
    </section>
  );
}
