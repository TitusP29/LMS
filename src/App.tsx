import React, { useEffect } from 'react';
import { LMSProvider, useLMS } from './store/LMSContext';
import { LandingPage } from './components/LandingPage';
import { AuthFlow } from './components/AuthFlow';
import { TopSearchHeader } from './components/TopSearchHeader';
import { LearnerHome } from './components/LearnerHome';
import { CatalogGrid } from './components/CatalogGrid';
import { MyLearningView } from './components/MyLearningView';
import { ModuleStudyPlayer } from './components/ModuleStudyPlayer';
import { PrivateNotesIndex } from './components/ChapterNotesEditor';
import { CertificatesGallery } from './components/CertificateModal';
import { LearnerProfile } from './components/LearnerProfile';
import { AdminDashboard } from './components/AdminDashboard';

const AppRouter: React.FC = () => {
  const { route, currentUser, navigate } = useLMS();

  const cleanPath = route.split('?')[0] || '/';

  useEffect(() => {
    const protectedLearnerRoutes = [
      '/dashboard',
      '/catalog',
      '/my-learning',
      '/notes',
      '/certificates',
      '/profile',
    ];
    const isProtectedLearner =
      protectedLearnerRoutes.includes(cleanPath) || cleanPath.startsWith('/module/');
    if (isProtectedLearner && !currentUser) {
      navigate('/signin');
    } else if (cleanPath === '/admin' && (!currentUser || currentUser.role !== 'admin')) {
      navigate(currentUser ? '/dashboard' : '/signin');
    }
  }, [cleanPath, currentUser, navigate]);

  if (cleanPath === '/') {
    return <LandingPage />;
  }

  if (cleanPath === '/signup') {
    return <AuthFlow mode="signup" />;
  }

  if (cleanPath === '/signin') {
    return <AuthFlow mode="signin" />;
  }

  if (cleanPath === '/admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      return <AuthFlow mode="signin" />;
    }
    return <AdminDashboard />;
  }

  if (!currentUser) {
    return <AuthFlow mode="signin" />;
  }

  const isModuleRoute = cleanPath.startsWith('/module/');
  const moduleId = isModuleRoute ? cleanPath.replace('/module/', '') : '';

  const renderCentralView = () => {
    if (isModuleRoute) {
      return <ModuleStudyPlayer moduleId={moduleId} />;
    }
    switch (cleanPath) {
      case '/catalog':
        return <CatalogGrid />;
      case '/my-learning':
        return <MyLearningView />;
      case '/notes':
        return <PrivateNotesIndex />;
      case '/certificates':
        return <CertificatesGallery />;
      case '/profile':
        return <LearnerProfile />;
      case '/dashboard':
      default:
        return <LearnerHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col overflow-x-hidden">
      <TopSearchHeader />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 lg:py-8">
        <div className="w-full max-w-[1680px] mx-auto">{renderCentralView()}</div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <LMSProvider>
      <AppRouter />
    </LMSProvider>
  );
}
