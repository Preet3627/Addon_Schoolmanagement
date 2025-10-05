import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, type QrcodeSuccessCallback, type QrcodeErrorCallback } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (errorMessage: string, error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // This check is important for WordPress integration where libraries are loaded globally.
    if (typeof Html5QrcodeScanner !== 'undefined') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 for camera
        },
        false // verbose
      );

      const successCallback: QrcodeSuccessCallback = (decodedText, decodedResult) => {
        // Prevent multiple scans by checking scanner state
        if (scanner.getState() === 2) { // 2 is PAUSED state
          return;
        }
        scanner.pause();
        onScanSuccess(decodedText, decodedResult);
        
        // Resume scanning after a delay
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
        // Don't log common "QR code not found" errors to console
      };

      scanner.render(successCallback, errorCallback);
      scannerRef.current = scanner;
    }

    return () => {
      // Cleanup scanner on component unmount
      if (scannerRef.current && scannerRef.current.getState() !== 0) { // 0 is NOT_STARTED
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
      }
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" className="w-full max-w-md mx-auto"></div>;
};

export default QRScanner;
