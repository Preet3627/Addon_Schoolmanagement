
import React from 'react';
import { AttendanceRecord, AttendanceMode } from '../types';
import { StudentIcon, TeacherIcon } from './icons';

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

const AttendanceLog: React.FC<AttendanceLogProps> = ({ records }) => {
  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">Attendance Log</h2>
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {records.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 p-8">No attendance records yet. Start scanning!</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {records.map((record) => (
                <li key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                  <div className="flex items-center">
                    <span className={`mr-4 p-2 rounded-full ${record.mode === AttendanceMode.Student ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'}`}>
                      {record.mode === AttendanceMode.Student ? <StudentIcon className="w-5 h-5" /> : <TeacherIcon className="w-5 h-5" />}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{record.mode} ID: {record.decodedText}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {record.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                    {record.timestamp.toLocaleDateString()}
                  </span>
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
