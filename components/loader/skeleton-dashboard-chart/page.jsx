const ChartSkeletonCard = () => {
  const barStyle = (width, height = '14px', color = '#ddd') => ({
    width,
    height,
    backgroundColor: color,
    borderRadius: '4px',
  });

  return (
    <div className="animate-pulse mt-3" style={{ marginLeft: '22px', width: '100%', maxWidth: '580px' }}>
      {/* Chart Skeleton Container */}
      <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#f3f3f3', borderRadius: '8px' }}>
        {/* Tabs Placeholder */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '280px',
            right: '10px',
            zIndex: 10,
          }}
        >
          <div style={{ marginLeft: '50px', display: 'flex', gap: '20px' }}>
            <div style={barStyle('40px', '16px', '#ccc')} />
            <div style={barStyle('40px', '16px', '#ccc')} />
            <div style={barStyle('50px', '16px', '#ccc')} />
          </div>
        </div>

        {/* Chart Graph Placeholder */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '20px',
            right: '20px',
            bottom: '20px',
            background: 'linear-gradient(180deg, #e0e0e0 10%, #f0f0f0 90%)',
            borderRadius: '6px',
          }}
        />
      </div>
    </div>
  );
};

export default ChartSkeletonCard;
