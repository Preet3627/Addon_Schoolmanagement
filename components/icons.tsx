import React from 'react';

// Main App Icons
export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

export const StudentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"></path>
    <path d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5"></path>
    <path d="M16 14a4 4 0 1 1-8 0"></path>
  </svg>
);

export const TeacherIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M20 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1"></path>
        <path d="M12 12v3m0 3v-3m-4-3h8"></path>
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

// Guide UI Icons
export const DirectoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className} fill="currentColor">
        <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2c.33.44.85.7 1.4.7h3.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 12.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75c0-.464.184-.91.513-1.237Z"></path>
    </svg>
);
  
export const FileCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className} fill="currentColor">
        <path d="M.22 3.22a.75.75 0 0 1 1.06 0L4.5 6.44l3.22-3.22a.75.75 0 0 1 1.06 1.06L5.56 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L4.5 8.56l-3.22 3.22a.75.75 0 0 1-1.06-1.06L3.44 7.5.22 4.28a.75.75 0 0 1 0-1.06Zm12.28 7.28a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Zm-3.5-3.5a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className} fill="currentColor">
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
    </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className} fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
    </svg>
);
