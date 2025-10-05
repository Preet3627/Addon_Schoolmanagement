import React, { useState } from 'react';
import { DirectoryIcon, DownloadIcon, FileCodeIcon, CopyIcon, CheckIcon } from './components/icons';

// --- Data for Downloadable Files ---
const fileContents = {
  'school-management-integration.php': `<?php
// school-management.php (ADD THIS CODE TO THE END OF THE FILE)

/**
 * =================================================================
 * QR ATTENDANCE SYSTEM INTEGRATION
 * =================================================================
 */

// 1. Define the Shortcode to display the QR Scanner App
add_shortcode('qr_attendance_system', 'wpsm_qr_attendance_shortcode_handler');
function wpsm_qr_attendance_shortcode_handler() {
    // This function will enqueue scripts and print the root div for the React app.
    add_action('wp_footer', 'wpsm_qr_enqueue_react_scripts');

    // Return the HTML element where the React app will mount.
    return '<div id="wpsm-qr-attendance-app" style="min-height: 100vh;"></div>';
}

// 2. Enqueue all necessary JavaScript files for the React application
function wpsm_qr_enqueue_react_scripts() {
    static $scripts_loaded = false;
    if ($scripts_loaded) {
        return;
    }

    // Get the plugin's directory URL
    $plugin_url = plugin_dir_url(__FILE__);

    // Scripts for React, ReactDOM, Babel, and the QR Scanner library
    wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.development.js', [], null, true);
    wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.development.js', ['react'], null, true);
    wp_enqueue_script('babel', 'https://unpkg.com/@babel/standalone/babel.min.js', [], null, true);
    wp_enqueue_script('html5-qrcode', 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js', [], null, true);

    // Pass data from PHP to our JavaScript app (API URL and security nonce)
    wp_localize_script('react', 'qrAttendanceData', [
        'apiUrl' => rest_url('wpschool/v1/mark-attendance'),
        'nonce'  => wp_create_nonce('wp_rest'),
    ]);
    
    // Use a filter to allow easy modification of the main script tag
    $main_script_tag = apply_filters('wpsm_qr_main_script_tag', '<script type="text/babel" data-type="module" src="' . esc_url($plugin_url . 'app/index.tsx') . '"></script>');
    echo $main_script_tag;
    
    $scripts_loaded = true;
}


// 3. Register the REST API endpoint to handle attendance scans
add_action('rest_api_init', function () {
    register_rest_route('wpschool/v1', '/mark-attendance', [
        'methods'  => 'POST',
        'callback' => 'wpsm_handle_attendance_scan',
        'permission_callback' => function () {
            // Secure the endpoint: only logged-in users who can manage options (e.g., admins) can use it.
            return current_user_can('manage_options');
        }
    ]);
});

// 4. The main function to process the QR code data
function wpsm_handle_attendance_scan(WP_REST_Request $request) {
    global $wpdb;

    // --- CONFIGURATION ---
    $school_start_time = '09:00:00'; 
    $grace_period_minutes = 10;
    // --- END CONFIGURATION ---

    $params = $request->get_json_params();
    $qr_data = isset($params['qrData']) ? sanitize_text_field($params['qrData']) : '';
    $mode = isset($params['mode']) ? sanitize_text_field($params['mode']) : '';

    if (empty($qr_data) || empty($mode)) {
        return new WP_REST_Response(['message' => 'Missing QR data or mode.'], 400);
    }

    $decoded_qr = json_decode(stripslashes($qr_data), true);
    if (json_last_error() !== JSON_ERROR_NONE || !isset($decoded_qr['id'])) {
        return new WP_REST_Response(['message' => 'Invalid QR Code format. Expecting JSON with an "id" key.'], 400);
    }
    $id_card_number = sanitize_text_field($decoded_qr['id']);

    $today = current_time('Y-m-d');
    $current_scan_time = new DateTime(current_time('mysql'), new DateTimeZone(wp_timezone_string()));

    if ($mode === 'Student') {
        $id_card_table = $wpdb->prefix . 'wpsm_id_card';
        $students_table = $wpdb->prefix . 'wpsm_student';
        $attendance_table = $wpdb->prefix . 'wpsm_attendance';

        $student_info = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT s.sid, s.s_classid FROM $students_table s
                 JOIN $id_card_table ic ON s.sid = ic.student_id
                 WHERE ic.id_card_no = %s",
                $id_card_number
            )
        );

        if (!$student_info) {
            return new WP_REST_Response(['message' => 'Student ID not found.'], 404);
        }

        $student_id = $student_info->sid;
        $class_id = $student_info->s_classid;

        $existing_attendance = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $attendance_table WHERE student_id = %d AND class_id = %d AND att_date = %s",
                $student_id, $class_id, $today
            )
        );

        if ($existing_attendance) {
            return new WP_REST_Response(['message' => 'Attendance already marked for today.', 'attendanceStatus' => 'Present'], 200);
        }
        
        $school_start = DateTime::createFromFormat('Y-m-d H:i:s', $today . ' ' . $school_start_time, new DateTimeZone(wp_timezone_string()));
        $school_start->add(new DateInterval('PT' . $grace_period_minutes . 'M'));
        $attendance_status = ($current_scan_time <= $school_start) ? 'On Time' : 'Late';

        $result = $wpdb->insert(
            $attendance_table,
            [
                'student_id' => $student_id,
                'class_id'   => $class_id,
                'att_date'   => $today,
                'status'     => 'Present',
                'remark'     => $attendance_status,
            ],
            ['%d', '%d', '%s', '%s', '%s']
        );

        if ($result === false) {
            return new WP_REST_Response(['message' => 'Database error: Failed to save attendance.'], 500);
        }
        
        return new WP_REST_Response(['message' => "Attendance for student {$id_card_number} recorded.", 'attendanceStatus' => $attendance_status], 200);

    } elseif ($mode === 'Teacher') {
        // Placeholder for teacher logic
        return new WP_REST_Response(['message' => "Teacher attendance recorded.", 'attendanceStatus' => 'Present'], 200);
    }

    return new WP_REST_Response(['message' => 'Invalid mode specified.'], 400);
}
?>`,
  'types.ts': `export enum AttendanceMode {
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
}`,
  'icons.tsx': `import React from 'react';

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
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className}>
        <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2c.33.44.85.7 1.4.7h3.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 12.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75c0-.464.184-.91.513-1.237Z"></path>
    </svg>
);
  
export const FileCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className}>
        <path d="M.22 3.22a.75.75 0 0 1 1.06 0L4.5 6.44l3.22-3.22a.75.75 0 0 1 1.06 1.06L5.56 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L4.5 8.56l-3.22 3.22a.75.75 0 0 1-1.06-1.06L3.44 7.5.22 4.28a.75.75 0 0 1 0-1.06Zm12.28 7.28a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06l3.5-3.5a.75.75 0 0 1 1.06 0Zm-3.5-3.5a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06Z"></path>
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className}>
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
    </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" className={className}>
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
    </svg>
);`,
  'QRScanner.tsx': `import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, type QrcodeSuccessCallback, type QrcodeErrorCallback } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (errorMessage: string, error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (typeof Html5QrcodeScanner !== 'undefined') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0]
        },
        false
      );

      const successCallback: QrcodeSuccessCallback = (decodedText, decodedResult) => {
        if (scanner.getState() === 2) { // PAUSED
          return;
        }
        scanner.pause();
        onScanSuccess(decodedText, decodedResult);
        setTimeout(() => {
           if (scanner.getState() === 2) {
             scanner.resume();
           }
        }, 3000);
      };
      
      const errorCallback: QrcodeErrorCallback = (errorMessage, error) => {
        if (onScanError) {
          onScanError(errorMessage, error);
        }
      };

      scanner.render(successCallback, errorCallback);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current && scannerRef.current.getState() !== 0) { // NOT_STARTED
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
      }
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" className="w-full max-w-md mx-auto"></div>;
};

export default QRScanner;`,
  'AttendanceLog.tsx': `import React from 'react';
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
        <span className={\`\${baseClasses} \${colorClasses}\`}>
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
                    <span className={\`mr-4 p-2 rounded-full self-start \${record.mode === AttendanceMode.Student ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'}\`}>
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
                          <p className={\`text-xs mt-1 text-red-500 dark:text-red-400\`}>{record.syncMessage}</p>
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

export default AttendanceLog;`,
  'App-scanner.tsx': `import React, { useState, useCallback } from 'react';
import QRScanner from './components/QRScanner';
import AttendanceLog from './components/AttendanceLog';
import { AttendanceMode, AttendanceRecord, AttendanceStatus } from './types';
import { CameraIcon, StudentIcon, TeacherIcon, CheckCircleIcon } from './components/icons';

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
    const tempId = \`\${decodedText}-\${now.toISOString()}\`;
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
        className={\`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed \${
          isActive
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
        }\`}
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
            <div className="flex items-center justify-center gap-3 mb-2">
                <CameraIcon className="w-10 h-10 text-indigo-500" />
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    QR Attendance
                </h1>
            </div>
          <p className="text-slate-500 dark:text-slate-400">
            Scan QR codes to sync attendance with the school management system.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-1/2 flex flex-col items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl">
                 <div className="w-full max-w-xs mb-6">
                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        <ModeButton targetMode={AttendanceMode.Student}>
                            <StudentIcon className="w-5 h-5 mr-2" /> Student
                        </Mode-Button>
                        <ModeButton targetMode={AttendanceMode.Teacher}>
                            <TeacherIcon className="w-5 h-5 mr-2" /> Teacher
                        </Mode-Button>
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
                        <div className={\`\${lastScan.success ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'} border-l-4 p-4 rounded-lg\`} role="alert">
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
export default App;`,
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
// The main app component is now named App-scanner.tsx to avoid conflicts
import App from './App-scanner';

const rootElement = document.getElementById('wpsm-qr-attendance-app');
if (!rootElement) {
  throw new Error("Could not find root element '#wpsm-qr-attendance-app' to mount to.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
};

// --- Helper Functions and Components ---
const downloadFile = (filename: keyof typeof fileContents) => {
    const content = fileContents[filename];
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('-scanner', ''); // Ensure correct filename for App.tsx
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const useCopyToClipboard = (): [boolean, (text: string) => void] => {
    const [isCopied, setIsCopied] = useState(false);
  
    const copy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    };
  
    return [isCopied, copy];
};
  
const CodeBlock: React.FC<{ language: string; filename: keyof typeof fileContents; children: React.ReactNode }> = ({ language, filename, children }) => {
    const [isCopied, copy] = useCopyToClipboard();
    const content = fileContents[filename];

    return (
      <div className="bg-[#161b22] border border-slate-700 rounded-lg my-4">
        <div className="flex justify-between items-center px-4 py-2 bg-slate-900/50 border-b border-slate-700">
          <span className="text-xs font-mono text-slate-400">{language}</span>
          <button onClick={() => copy(content)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition">
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-sm overflow-x-auto"><code className="font-mono">{children}</code></pre>
      </div>
    );
};

const FileDownloadLink: React.FC<{ filename: keyof typeof fileContents, path: string }> = ({ filename, path }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-transparent hover:border-slate-700 hover:bg-slate-800 rounded-md transition-all">
        <div className="flex items-center gap-3">
            <FileCodeIcon className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-sm text-slate-300">{path}</span>
        </div>
        <button onClick={() => downloadFile(filename)} className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md transition">
            <DownloadIcon className="w-4 h-4" />
            Download
        </button>
    </div>
);

const App: React.FC = () => {
    return (
        <div className="bg-[#0d1117] text-slate-300 min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="border-b border-slate-800 pb-6 mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">QR Attendance Integration Guide</h1>
                    <p className="mt-2 text-slate-400">A step-by-step guide to integrate the React QR Scanner into the <span className="font-semibold text-white">WP School Management System</span> plugin.</p>
                </header>

                <main>
                    {/* Step 1 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white border-b border-slate-800 pb-3 mb-4">
                            <span className="text-slate-500 mr-2">Step 1:</span> Organize Plugin Files
                        </h2>
                        <p className="mb-4 text-slate-400">
                            First, create the necessary directory structure inside your existing <code className="text-xs bg-slate-700/50 px-1 py-0.5 rounded">school-management</code> plugin folder. This will hold the React application files.
                        </p>
                        <div className="bg-[#161b22] border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300">
                            <div className="flex items-center gap-2"><DirectoryIcon className="w-4 h-4 text-blue-400" /><span>school-management/</span></div>
                            <div className="pl-4 border-l border-slate-700 ml-2">
                                <div className="flex items-center gap-2 pt-2"><DirectoryIcon className="w-4 h-4 text-blue-400" /><span>app/</span></div>
                                <div className="pl-4 border-l border-slate-700 ml-2">
                                    <div className="flex items-center gap-2 pt-2"><DirectoryIcon className="w-4 h-4 text-blue-400" /><span>components/</span></div>
                                </div>
                                <div className="pt-2"><span className="text-slate-500 ml-5">... (other plugin files)</span></div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Step 2 */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white border-b border-slate-800 pb-3 mb-4">
                            <span className="text-slate-500 mr-2">Step 2:</span> Add Backend PHP Code
                        </h2>
                        <p className="mb-4 text-slate-400">
                            Copy the entire PHP code block below and paste it at the very end of your main plugin file, <code className="text-xs bg-slate-700/50 px-1 py-0.5 rounded">school-management.php</code>. This code creates the API and handles all server-side attendance logic.
                        </p>
                        <FileDownloadLink filename="school-management-integration.php" path="school-management.php (code to add)" />
                        <CodeBlock language="PHP" filename="school-management-integration.php">
                            {fileContents['school-management-integration.php']}
                        </CodeBlock>
                    </section>

                    {/* Step 3 */}
                    <section>
                        <h2 className="text-2xl font-semibold text-white border-b border-slate-800 pb-3 mb-4">
                             <span className="text-slate-500 mr-2">Step 3:</span> Create React App Files
                        </h2>
                        <p className="mb-4 text-slate-400">
                            Download the following files and place them into the directory structure you created in Step 1. These files create the QR scanner interface.
                        </p>
                        <div className="space-y-2">
                           <FileDownloadLink filename="types.ts" path="app/types.ts" />
                           <FileDownloadLink filename="icons.tsx" path="app/components/icons.tsx" />
                           <FileDownloadLink filename="QRScanner.tsx" path="app/components/QRScanner.tsx" />
                           <FileDownloadLink filename="AttendanceLog.tsx" path="app/components/AttendanceLog.tsx" />
                           <FileDownloadLink filename="App-scanner.tsx" path="app/App.tsx" />
                           <FileDownloadLink filename="index.tsx" path="app/index.tsx" />
                        </div>
                    </section>
                </main>

                <footer className="text-center mt-12 pt-8 border-t border-slate-800">
                     <p className="text-sm text-slate-500">Integration guide complete. You can now add the shortcode <code className="text-xs bg-slate-700/50 px-1 py-0.5 rounded">[qr_attendance_system]</code> to any WordPress page.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
