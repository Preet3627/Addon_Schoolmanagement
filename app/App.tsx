import React, { useState, useCallback } from 'react';
import QRScanner from './components/QRScanner';
import AttendanceLog from './components/AttendanceLog';
import { AttendanceMode, AttendanceRecord, AttendanceStatus } from './types';
import { StudentIcon, TeacherIcon, CheckCircleIcon, PmShriLogo } from './components/icons';

declare global {
  interface Window {
    qrAttendanceData: {
      apiUrl: string;
      nonce: string;
    };
  }
}
const { apiUrl, nonce } = window.qrAttendanceData || { apiUrl: '', nonce: '' };

const App: React.FC = () => {
  const [mode, setMode] = useState<AttendanceMode>(AttendanceMode.Student);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<{ text: string; mode: AttendanceMode; success: boolean, message: string } | null>(null);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLastScan(null);

    const now = new Date();
    const tempId = `${decodedText}-${now.toISOString()}`;
    let attendanceMode = mode;
    
    try {
        const qrData = JSON.parse(decodedText);
        if (qrData.mode && Object.values(AttendanceMode).includes(qrData.mode)) {
            attendanceMode = qrData.mode;
        }
    } catch (e) {
        // Not JSON, use selected mode
    }

    const newRecord: AttendanceRecord = {
      id: tempId,
      decodedText,
      mode: attendanceMode,
      timestamp: now,
      syncStatus: 'syncing',
    };
    setRecords(prevRecords => [newRecord, ...prevRecords]);

    try {
      if (!apiUrl) {
        throw new Error("API configuration is missing.");
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          qrData: decodedText,
          mode: attendanceMode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An unknown error occurred.');
      }
      
      const attendanceStatus: AttendanceStatus | undefined = result.attendanceStatus;

      setRecords(prev => prev.map(r => r.id === tempId ? { 
          ...r, 
          syncStatus: 'synced', 
          syncMessage: result.message,
          attendanceStatus: attendanceStatus,
        } : r));
      setLastScan({ text: decodedText, mode: attendanceMode, success: true, message: result.message || "Success!" });

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect to server.';
      setRecords(prev => prev.map(r => r.id === tempId ? { ...r, syncStatus: 'error', syncMessage: errorMessage } : r));
      setLastScan({ text: decodedText, mode: attendanceMode, success: false, message: errorMessage });
    } finally {
        setIsSyncing(false);
        setTimeout(() => setLastScan(null), 4000);
    }

  }, [mode, isSyncing]);

  const handleScanError = useCallback((errorMessage: string) => {
    if (!errorMessage.toLowerCase().includes('qr code not found')) {
      console.warn("Scanner Error:", errorMessage);
    }
  }, []);

  const ModeButton: React.FC<{
    targetMode: AttendanceMode;
    children: React.ReactNode;
  }> = ({ targetMode, children }) => {
    const isActive = mode === targetMode;
    return (
      <button
        onClick={() => setMode(targetMode)}
        className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
        }`}
        disabled={isSyncing}
      >
        <div className="flex items-center justify-center">
            {children}
        </div>
      </button>
    );
  };
    
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
                <PmShriLogo className="h-12 w-auto" />
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    QR Attendance
                </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
                For PM SHRI Schools, integrated with WP School Management.
            </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-1/2 flex flex-col items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl">
                 <div className="w-full max-w-xs mb-6">
                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        <ModeButton targetMode={AttendanceMode.Student}>
                            <StudentIcon className="w-5 h-5 mr-2" /> Student
                        </ModeButton>
                        <ModeButton targetMode={AttendanceMode.Teacher}>
                            <TeacherIcon className="w-5 h-5 mr-2" /> Teacher
                        </ModeButton>
                    </div>
                </div>

                <div className="w-full max-w-sm aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner relative flex items-center justify-center">
                   <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                   {isSyncing && (
                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 rounded-xl">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="mt-3 text-lg font-semibold">Syncing...</span>
                     </div>
                   )}
                </div>
                
                <div className="h-20 mt-4 w-full">
                    {lastScan && (
                        <div className={`${lastScan.success ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'} border-l-4 p-4 rounded-lg`} role="alert">
                            <div className="flex items-start">
                                <CheckCircleIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <p className="font-bold">{lastScan.success ? 'Success' : 'Error'}</p>
                                    <p className="text-sm">{lastScan.message}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full lg:w-1/2">
                <AttendanceLog records={records} />
            </div>
        </main>
      </div>
    </div>
  );
};
export default App;