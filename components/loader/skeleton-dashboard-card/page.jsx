const SkeletonBar = ({ width, height }) => (
    <div
        style={{
            width,
            height,
            backgroundColor: '#ccc',
            borderRadius: '4px',
            marginBottom: '6px',
        }}
    />
);
const SkeletonCard = () => (
    <div className="dashboard-card animate-pulse">
        <div className="icon-container" style={{ backgroundColor: '#e0e0e0' }}>
            <div
                style={{
                    width: '42px',
                    height: '42px',
                    backgroundColor: '#ccc',
                    borderRadius: '9px',
                    marginTop: '-2px',
                }}
            />
        </div>
        <div className="text-container">
            <SkeletonBar width="60px" height="12px" />
            <SkeletonBar width="40px" height="18px" />
        </div>
    </div>
);

export default SkeletonCard;
