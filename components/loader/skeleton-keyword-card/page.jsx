const KeywordSkeletonCard = ({ count = 5 }) => {
    const barStyle = (width, height = '14px', color = '#ddd') => ({
        width,
        height,
        backgroundColor: color,
        borderRadius: '4px',
    });
    return (
        <div className="animate-pulse" style={{ padding: '16px', width: '100%' }}>
            {/* Title Placeholder */}
            <div style={{ ...barStyle('200px', '20px', '#ccc'), marginBottom: '12px' }} />

            {/* Data Rows */}
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={barStyle('80%')} />
                    <div style={barStyle('10%')} />
                </div>
            ))}

            {/* View All Placeholder */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <div style={barStyle('60px', '16px', '#ccc')} />
            </div>
        </div>
    );
};
export default KeywordSkeletonCard;
