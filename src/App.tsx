import React from 'react';
import { QuestionPoolView } from './views/QuestionPoolView';
import { ExamProvider, useExam } from './context/ExamContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Teacher Views
import { OnlineClassesListView } from './views/OnlineClassesListView';
import { OnlineClassAssessmentsView } from './views/OnlineClassAssessmentsView';
import { CreateClassAssessmentView } from './views/CreateClassAssessmentView';
import { CreateOnlineClassView } from './views/CreateOnlineClassView';
import { LiveClassroomView } from './views/LiveClassroomView';

// Parent & Student Views
import { StudentOnlineClassesView } from './views/StudentOnlineClassesView';

const MainContent: React.FC = () => {
  const { activeTab } = useExam();

  // When teacher/student is in live video classroom studio, render full screen WebRTC broadcast environment
  if (activeTab === 'live-classroom') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-950 font-sans">
        <LiveClassroomView />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/70 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header />

        {/* View Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70">
          {/* Teacher Views */}
          {activeTab === 'online-classes' && <OnlineClassesListView />}
          {activeTab === 'online-class-assessments' && <OnlineClassAssessmentsView />}
          {activeTab === 'question-pool' && <QuestionPoolView />}
          {activeTab === 'create-class-assessment' && <CreateClassAssessmentView />}
          {activeTab === 'create-online-class' && <CreateOnlineClassView />}

          {/* Parent & Student Views */}
          {activeTab === 'student-online-classes' && <StudentOnlineClassesView />}
        </main>
      </div>

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ExamProvider>
      <MainContent />
    </ExamProvider>
  );
}

export default App;
