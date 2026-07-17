const PieChartSkeletonCard = () => {
    return (
        <div
            className="animate-pulse"
            style={{
                width: '100%',
                maxWidth: '580px',
                height: '300px',
                backgroundColor: '#f3f3f3',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            {/* Circular chart placeholder */}
            <div
                style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #e0e0e0 40%, #f0f0f0 100%)',
                }}
            ></div>
        </div>
    );
};

export default PieChartSkeletonCard;
