'use client';
import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const DirectApexChart = ({
  series = [],
  categories = [],
  chartId = 'chart',
  height = 350,
  chartType = 'bar',
  title = 'User Trends'
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const options = {
      chart: {
        id: chartId,
        type: chartType,
        height: height,
        zoom: { enabled: false },
        toolbar: {
          show: false,
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        width: [3, 3, 3],
        curve: 'straight',
        dashArray: [1, 2, 3]
      },
      title: {
        text: title,
        align: 'left'
      },
      xaxis: {
        categories: categories
      },
      tooltip: {
        y: {
          formatter: (val) => val
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      },
      grid: {
        borderColor: '#f1f1f1'
      },
      series
    };

    // Clean up the previous chart instance if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new ApexCharts(chartRef.current, options);
    chartInstanceRef.current.render();

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [series, categories, chartId]);

  return <div ref={chartRef} id={chartId} />;
};

export default DirectApexChart;
