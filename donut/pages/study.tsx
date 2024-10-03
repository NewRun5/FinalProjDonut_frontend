import LeftContent from '../src/app/components/LeftPanel/LeftPanel';
import Chat from '../src/app/components/chat/Chat';
import Units from '../src/app/components/Units/Units';
import '../src/app/styles/study-page.css';
import Layout from '../src/app/layout';  // Layout 컴포넌트를 임포트

export default function StudyPage({ markdownData, unitData }: { markdownData: string, unitData: string[] }) {
  return (
    <Layout>
      <div className="study-page">
        <div className="left-panel">
          <LeftContent markdownData={markdownData} />
        </div>
        <div className="right-panel">
          <Chat onMessageSent={() => {}} />
          <Units unitData={unitData} />
        </div>
      </div>
    </Layout>
  );
}
