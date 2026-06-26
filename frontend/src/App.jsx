import { useState } from 'react';
import LandingScreen from './components/LandingScreen';
import IDEWorkspace from './components/IDEWorkspace';
import { useSandbox } from './hooks/useSandbox';
import './App.css';

export default function App() {
  const { sandbox, status, error, createSandbox } = useSandbox();

  const handleStart = async () => {
    await createSandbox();
  };

  if (status === 'ready' && sandbox) {
    return <IDEWorkspace sandbox={sandbox} />;
  }

  return (
    <LandingScreen
      onStart={handleStart}
      isCreating={status === 'creating'}
      error={error}
    />
  );
}
