export enum AttendanceMode {
  Student = 'Student',
  Teacher = 'Teacher',
}

export type SyncStatus = 'syncing' | 'synced' | 'error';
export type AttendanceStatus = 'On Time' | 'Late' | 'Present';

export interface AttendanceRecord {
  id: string;
  decodedText: string;
  mode: AttendanceMode;
  timestamp: Date;
  syncStatus: SyncStatus;
  syncMessage?: string; // Message from the sync process (e.g., error details)
  attendanceStatus?: AttendanceStatus; // Status from the server (e.g., 'Late')
}
