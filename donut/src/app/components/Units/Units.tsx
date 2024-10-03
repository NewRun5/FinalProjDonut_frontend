import './units.css';

export default function Units() {
  //export default function Units({ unitData = [] }: { unitData: string[] }) {
  const dummyData = ["1", "2", "3", "4", "5"];  // 5개의 단원 더미 데이터

  return (
    <div className="units-list">
      {dummyData.map((unit, index) => (
        <div key={index} className="unit">
          {unit} 단원
        </div>
      ))}
    </div>
  );
}

