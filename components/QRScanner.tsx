import React, { useEffect, useRef } from 'react';
// FIX: Import `Html5QrcodeScanner` as a value so it can be instantiated.
// FIX: Corrected typo in `QrcodeSuccessCallback` and `QrcodeErrorCallback` type names.
import { Html5QrcodeScanner, type QrcodeSuccessCallback, type QrcodeErrorCallback } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (errorMessage: string, error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // FIX: Check for the imported class directly, not on the window object.
    if (Html5QrcodeScanner) {
      // FIX: Instantiate the scanner using the imported class.
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
        scanner.pause();
        onScanSuccess(decodedText, decodedResult);
        setTimeout(() => {
           if (scanner.getState() === 2) { // 2 is PAUSED state
             scanner.resume();
           }
        }, 2000); // Pause for 2 seconds after a successful scan
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
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" className="w-full max-w-md mx-auto"></div>;
};

export default QRScanner;