import React from 'react';
import { QuestionPoolView } from './views/QuestionPoolView';
import { ExamProvider, useExam } from './context/ExamContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardView } from './views/DashboardView';

// Teacher Views
import { OnlineClassesListView } from './views/OnlineClassesListView';
import { OnlineClassAssessmentsView } from './views/OnlineClassAssessmentsView';
import { CreateClassAssessmentView } from './views/CreateClassAssessmentView';
import { CreateOnlineClassView } from './views/CreateOnlineClassView';
import { LiveClassroomView } from './views/LiveClassroomView';

// Parent & Student Views
import { StudentOnlineClassesView } from './views/StudentOnlineClassesView';

import { ShareAssessmentModal } from './components/modals/ShareAssessmentModal';
import { StudentIdentityVerificationModal } from './components/modals/StudentIdentityVerificationModal';
import { LiveAssessmentStudentModal } from './components/modals/LiveAssessmentStudentModal';

const MainContent: React.FC = () => {
  const { activeTab } = useExam();

  return (
    <>
      {activeTab === 'live-classroom' ? (
        <div className="h-full w-full overflow-hidden bg-slate-950 font-sans">
          <LiveClassroomView />
        </div>
      ) : (
        <div className="flex h-full w-full overflow-hidden bg-[var(--bg-main-light)]">
          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg-main-light)]">
            {/* Header Bar */}
            <Header />

            {/* View Container */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {/* Main Dashboard (Teacher & Student) */}
              {activeTab === 'dashboard' && <DashboardView />}

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
        </div>
      )}

      {/* Global Modals for QR/Link Assessment Sharing & Student Identity Verification */}
      <ShareAssessmentModal />
      <StudentIdentityVerificationModal />
      <LiveAssessmentStudentModal />

      {/* Floating Notifications */}
      <ToastContainer />
    </>
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
