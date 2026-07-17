const SkeletonTinyBar = ({ width, height }) => (
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

const SkeletonTinyAgeRangeInput = () => (
  <div
    className="animate-pulse"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      width: 'fit-content',
    }}
  >
    {/* Left small input skeleton */}
    <SkeletonTinyBar width="40px" height="20px" />
    <span style={{ color: '#ccc' }}>–</span>
    {/* Right small input skeleton */}
    <SkeletonTinyBar width="40px" height="20px" />
  </div>
);

export default SkeletonTinyAgeRangeInput;
