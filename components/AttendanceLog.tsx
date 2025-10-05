import React from 'react';
import { AttendanceRecord, AttendanceMode, AttendanceStatus } from '../types';
import { StudentIcon, TeacherIcon } from './icons';

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

const SyncStatusIcon: React.FC<{ status: AttendanceRecord['syncStatus'] }> = ({ status }) => {
    switch (status) {
        case 'syncing':
            return (
                <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <title>Syncing</title>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
        case 'synced':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <title>Synced</title>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            );
        case 'error':
             return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <title>Error</title>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
             );
        default:
            return null;
    }
};

const AttendanceStatusBadge: React.FC<{ status?: AttendanceStatus }> = ({ status }) => {
    if (!status) return null;

    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    let colorClasses = "";

    switch(status) {
        case 'On Time':
            colorClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            break;
        case 'Late':
            colorClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            break;
        case 'Present':
        default:
             colorClasses = "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
            break;
    }
    
    return (
        <span className={`${baseClasses} ${colorClasses}`}>
            {status}
        </span>
    );
};

const AttendanceLog: React.FC<AttendanceLogProps> = ({ records }) => {
  const parseId = (qrText: string): string => {
    try {
      const data = JSON.parse(qrText);
      return data.id || qrText;
    } catch {
      return qrText;
    }
  }

  return (
    <div className="w-full mt-8 lg:mt-0">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">Attendance Log</h2>
      <div className="bg-white dark:bg-slate-900 shadow-lg rounded-lg overflow-hidden">
        <div className="max-h-[28rem] overflow-y-auto">
          {records.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 p-8">No attendance records yet. Start scanning!</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {records.map((record) => (
                <li key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className={`mr-4 p-2 rounded-full self-start ${record.mode === AttendanceMode.Student ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'}`}>
                      {record.mode === AttendanceMode.Student ? <StudentIcon className="w-5 h-5" /> : <TeacherIcon className="w-5 h-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{record.mode} ID: {parseId(record.decodedText)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {record.timestamp.toLocaleTimeString()}
                        </p>
                        <AttendanceStatusBadge status={record.attendanceStatus} />
                      </div>
                       {record.syncStatus === 'error' && record.syncMessage && (
                          <p className={`text-xs mt-1 text-red-500 dark:text-red-400`}>{record.syncMessage}</p>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                     <SyncStatusIcon status={record.syncStatus} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceLog;
