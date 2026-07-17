'use client';
import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

export default function PieChartComponent({
    title = 'Pie Chart',
    labels = [],
    series = [],
    colors = ['#f78db5', '#8ac6d1', '#ffc107', '#5cdb95', '#e76f51'],
    tooltipFormatter = (val) => `${val}`,
}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!Array.isArray(series) || !Array.isArray(labels) || series.length === 0 || labels.length === 0) return;

        const options = {
            chart: {
                type: 'pie',
                toolbar: { show: false },
            },
            labels: labels,
            series: series,
            colors: colors,
            tooltip: {
                y: {
                    formatter: tooltipFormatter,
                },
            },
            legend: {
                position: 'bottom',
                fontSize: '13px',
            },
        };

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new ApexCharts(chartRef.current, options);
        chartInstance.current.render();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [series, labels]);

    return (
        <div className="bg-white rounded-xl p-4 shadow rounded" style={{ maxWidth: '400px' }}>
            <h2 className="text-[16px] font-semibold mb-3 text-center">{title}</h2>
            <div ref={chartRef} />
        </div>
    );
}
