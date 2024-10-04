"use client";

import LeftContent from '../../components/LeftPanel/LeftPanel';
import Chat from '../../components/chat/Chat';
import Units from '../../components/Units/Units';
import '../../styles/study-page.css';
import Layout from '../layout';  // Layout 컴포넌트를 임포트

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
