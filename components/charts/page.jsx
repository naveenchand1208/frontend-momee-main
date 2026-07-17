'use client';
import { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
//chart component for area,line,bar
export default function ChartComponent({
    type = 'area',
    title = 'Statistics',
    xAxisData = [],
    yAxisData = [],
    yAxisLabel = '',
    xAxisTitle = 'xAxis title',
    yAxisTitle = 'yAxis title',
    tooltipPointerName = 'point',
    tooltipFormat = '',
    colors = ['#f78db5']
}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const options = {
            chart: {
                type: type,
                height: 350,
                toolbar: { show: false },
            },
            series: [{
                name: tooltipPointerName,
                data: yAxisData
            }],
            xaxis: {
                categories: xAxisData,
                title: { text: xAxisTitle },
            },
            yaxis: {
                // min: 0,
                // max: 14,
                // tickAmount: 14,
                fontSize: '12px',
                labels: {
                    style: {
                        fontSize: '12px'
                    },
                    ...yAxisLabel
                },
                title: { text: yAxisTitle }
            },
            tooltip: {
                y: {
                    formatter: tooltipFormat || undefined
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            colors: colors
        };

        chartInstance.current = new ApexCharts(chartRef.current, options);
        chartInstance.current.render();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.updateOptions({
                xaxis: {
                    categories: xAxisData,
                    title: { text: xAxisTitle }
                },
                series: [{
                    name: tooltipPointerName,
                    data: yAxisData
                }],
                colors: colors,
            });
        }
    }, [xAxisData, yAxisData]);

    return (
        <div className="bg-white rounded-xl p-4 shadow rounded">
            <h2 className="text-[16px] font-semibold mb-3">{title}</h2>
            <div ref={chartRef} />
        </div>
    );
}