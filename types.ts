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
  syncMessage?: string;
  attendanceStatus?: AttendanceStatus;
}
