import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORY_LABELS, NEWS_CATEGORIES } from '../utils/news';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#db2777', '#7c3aed'];

export default function NewsChart({ articleCounts, onSelectCategory }) {
  const data = {
    labels: NEWS_CATEGORIES.map((category) => CATEGORY_LABELS[category]),
    datasets: [
      {
        data: NEWS_CATEGORIES.map((category) => articleCounts[category] || 0),
        backgroundColor: COLORS,
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    onClick: (_event, elements) => {
      if (!elements.length) return;
      onSelectCategory(NEWS_CATEGORIES[elements[0].index]);
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          color: '#94a3b8',
          padding: 18,
        },
      },
    },
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-soft-dark">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">News Distribution</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Click a slice to switch categories</p>
      </div>
      <div className="h-72">
        <Doughnut data={data} options={options} />
      </div>
    </section>
  );
}
