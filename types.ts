
export enum AttendanceMode {
  Student = 'Student',
  Teacher = 'Teacher',
}

export interface AttendanceRecord {
  id: string;
  decodedText: string;
  mode: AttendanceMode;
  timestamp: Date;
}
