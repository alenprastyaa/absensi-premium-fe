/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { StudentWithClass } from '../types';

interface QRScannerProps {
  students: StudentWithClass[];
  onScanSuccess: (qrCode: string, status: 'hadir' | 'sakit' | 'izin' | 'alfa') => Promise<{ duplicate: boolean; message: string }>;
}

export default function QRScanner({ students, onScanSuccess }: QRScannerProps) {
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'warning' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [attendanceStatus, setAttendanceStatus] = useState<'hadir' | 'sakit' | 'izin' | 'alfa'>('hadir');
  
  // Simulation states
  const [selectedStudentQr, setSelectedStudentQr] = useState<string>('');

  const qrRegionId = "qr-reader";
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingScanRef = useRef(false);
  const recentScansRef = useRef<Map<string, number>>(new Map());
  const statusResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop camera scanning
  const stopCamera = async () => {
    isProcessingScanRef.current = false;
    recentScansRef.current.clear();

    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
      } catch (err) {
        console.error("Gagal menghentikan kamera:", err);
      }
    }
  };

  // Start camera scanning
  const startCamera = async () => {
    setScannerError(null);
    setScanStatus('scanning');
    try {
      // Ensure any existing instance is stopped
      await stopCamera();

      const html5Qrcode = new Html5Qrcode(qrRegionId);
      html5QrcodeRef.current = html5Qrcode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5Qrcode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          const now = Date.now();
          const lastScannedAt = recentScansRef.current.get(decodedText) || 0;

          // The scanner can decode the same QR several times per second. Keep the
          // camera running, but only process one request at a time and briefly
          // ignore a QR that has just been recorded.
          if (isProcessingScanRef.current || now - lastScannedAt < 5000) {
            return;
          }

          isProcessingScanRef.current = true;
          recentScansRef.current.set(decodedText, now);

          for (const [code, scannedAt] of recentScansRef.current) {
            if (now - scannedAt >= 5000) recentScansRef.current.delete(code);
          }

          try {
            await processScannedCode(decodedText);
          } finally {
            isProcessingScanRef.current = false;
          }
        },
        (errorMessage) => {
          // Silent scan errors as it scans continuously
        }
      );
    } catch (err: any) {
      console.error("Gagal mengakses kamera:", err);
      setScannerError("Kamera tidak dapat diakses. Pastikan Anda memberikan izin akses kamera atau jalankan mode Simulasi di bawah.");
      setScanStatus('idle');
      setUseCamera(false);
    }
  };

  const processScannedCode = async (code: string) => {
    setScanStatus('scanning');
    try {
      const result = await onScanSuccess(code, 'hadir');
      
      // Find the scanned student's name if possible
      const scannedStudent = students.find(s => s.qrCode === code);
      const studentName = scannedStudent ? scannedStudent.name : 'Siswa';

      if (result.duplicate) {
        setScanStatus('warning');
        setScanMessage(result.message || `${studentName} sudah absen hari ini.`);
      } else {
        setScanStatus('success');
        setScanMessage(`Berhasil mencatat KEHADIRAN untuk ${studentName} secara otomatis.`);
      }

      // Auto reset message after 3.5 seconds
      if (statusResetTimeoutRef.current) {
        clearTimeout(statusResetTimeoutRef.current);
      }
      statusResetTimeoutRef.current = setTimeout(() => {
        setScanStatus('idle');
        setScanMessage('');
      }, 3500);
    } catch (err: any) {
      setScanStatus('error');
      setScanMessage(err.response?.data?.error || err.message || "Siswa tidak terdaftar atau gagal.");
    }
  };

  // Handle manual trigger from simulation dropdown
  const handleSimulateScan = async () => {
    if (!selectedStudentQr) return;
    await processScannedCode(selectedStudentQr);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (statusResetTimeoutRef.current) {
        clearTimeout(statusResetTimeoutRef.current);
      }
      stopCamera();
    };
  }, []);

  return (
    <div id="qr-scanner-card" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold font-display text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            Scanner QR Absensi (Hadir Otomatis)
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Arahkan kamera ke QR Code siswa untuk mencatat kehadiran "Hadir" secara instan.</p>
        </div>
      </div>

      {/* Main scanner area */}
      <div className="relative flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden p-6 mb-6">
        {useCamera ? (
          <div className="w-full flex flex-col items-center">
            {/* The canvas target for html5-qrcode */}
            <div id={qrRegionId} className="w-full max-w-[320px] rounded-xl overflow-hidden bg-black shadow-lg border-2 border-indigo-500"></div>
            
            <button
              onClick={() => {
                stopCamera();
                setUseCamera(false);
                setScanStatus('idle');
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition"
              id="stop-camera-btn"
            >
              <X className="w-4 h-4" />
              Matikan Kamera
            </button>

            {scanMessage && scanStatus !== 'scanning' && (
              <div
                aria-live="polite"
                className={`mt-3 max-w-[420px] rounded-xl border px-4 py-3 text-center text-sm ${
                  scanStatus === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : scanStatus === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {scanMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 flex flex-col items-center">
            {scanStatus === 'success' ? (
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800">Scan Berhasil!</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-[280px]">{scanMessage}</p>
              </div>
            ) : scanStatus === 'warning' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-semibold text-amber-800">Peringatan Absensi</h4>
                <p className="text-sm text-amber-700 mt-1 max-w-[280px]">{scanMessage}</p>
                <button
                  onClick={() => setScanStatus('idle')}
                  className="mt-4 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition"
                >
                  Tutup
                </button>
              </div>
            ) : scanStatus === 'error' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-semibold text-rose-800">Gagal Memproses QR</h4>
                <p className="text-sm text-rose-600 mt-1 max-w-[280px]">{scanMessage}</p>
                <button
                  onClick={() => setScanStatus('idle')}
                  className="mt-4 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition"
                >
                  Ulangi Lagi
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 pulse-scan">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-medium mb-1">Gunakan Kamera untuk Memindai QR</p>
                <p className="text-xs text-slate-400 max-w-[260px] mb-6">Arahkan kamera HP atau komputer Anda ke kartu QR Code siswa</p>
                
                <button
                  onClick={() => {
                    setUseCamera(true);
                    // Start in next tick to allow DOM rendering
                    setTimeout(startCamera, 100);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm hover:shadow"
                  id="start-camera-btn"
                >
                  <Camera className="w-4 h-4" />
                  Aktifkan Kamera Scanner
                </button>
              </div>
            )}
          </div>
        )}

        {scannerError && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2 max-w-[450px]">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{scannerError}</span>
          </div>
        )}
      </div>

      {/* Fast Simulated Scan Fallback */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 font-display flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-500" />
          Mode Simulasi Scanner (Rekomendasi untuk Demo)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Gunakan simulasi ini untuk memilih siswa secara instan seolah-olah Anda memindai kode mereka dengan sukses.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <select
            value={selectedStudentQr}
            onChange={(e) => setSelectedStudentQr(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
            id="simulation-student-select"
          >
            <option value="">-- Pilih Siswa yang Akan Discan --</option>
            {students.map((std) => (
              <option key={std.id} value={std.qrCode}>
                {std.name} ({std.nisn}) - {std.className}
              </option>
            ))}
          </select>

          <button
            onClick={handleSimulateScan}
            disabled={!selectedStudentQr || scanStatus === 'scanning'}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition"
            id="simulate-scan-btn"
          >
            Simulasikan Scan QR
          </button>
        </div>
      </div>
    </div>
  );
}
