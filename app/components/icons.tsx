import React from 'react';

export const PmShriLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg" aria-label="PM SHRI Logo">
      <style>
        {`.pm-text { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 32px; letter-spacing: -1px; }`}
      </style>
      <text x="0" y="30" className="pm-text" fill="#00509E">PM</text>
      <text x="52" y="30" className="pm-text" fill="#FF9933">SHRI</text>
    </svg>
  );

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