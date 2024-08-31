import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title } from 'chart.js';
import { DataSource, NumberPairFormat } from './dataSource';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title);

interface LineChartProps {
    dataSources: DataSource<NumberPairFormat>[];
}

const LineChart: React.FC<LineChartProps> = ({ dataSources }) => {
    const labels = dataSources[0]?.content?.map(point => point.x) || [];
    const datasets = dataSources.map(dataSource => ({
        label: dataSource.name,
        data: dataSource.content?.map(point => ({ x: point.x, y: point.y })) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1,
    }));

    const data = {
        labels,
        datasets
    };

    return (
        <div style={{width: "100%"}}>
            <Line data={data} options={{"responsive": true, "maintainAspectRatio": false}} style={{width: "90%", "height": "300px"}}/>
        </div>
    );
};

export default LineChart;