/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, BadgeInfo, School2, IdCard } from 'lucide-react';
import { StudentWithClass } from '../types';

interface StudentQRCardProps {
  student: StudentWithClass;
  schoolName: string;
}

export default function StudentQRCard({ student, schoolName }: StudentQRCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(
      student.qrCode,
      {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e1b4b', // Deep indigo
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (err) {
          console.error('Gagal generate QR Code:', err);
          return;
        }
        setQrDataUrl(url);
      }
    );
  }, [student]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Kartu QR - ${student.name}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 12mm;
            }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #f8fafc;
            }
            .card {
              width: 92mm;
              height: 54mm;
              border-radius: 12px;
              overflow: hidden;
              background: white;
              box-shadow: 0 8px 25px rgba(15, 23, 42, 0.12);
              border: 1px solid #dbe4f0;
              position: relative;
              break-inside: avoid;
            }
            .accent {
              height: 5px;
              background: linear-gradient(90deg, #4f46e5 0%, #0ea5e9 50%, #10b981 100%);
            }
            .inner {
              display: flex;
              gap: 10px;
              padding: 10px 12px 12px;
              height: calc(54mm - 5px);
              box-sizing: border-box;
            }
            .left {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-width: 0;
            }
            .right {
              width: 24mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 4px;
              flex-shrink: 0;
            }
            .school {
              font-size: 10px;
              font-weight: 700;
              color: #4f46e5;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .title {
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }
            .qr-image {
              width: 22mm;
              height: 22mm;
              display: block;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              padding: 2px;
              background: white;
            }
            .name {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              line-height: 1.15;
              margin-top: 6px;
              word-break: break-word;
            }
            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              margin-top: 6px;
            }
            .pill {
              font-size: 9px;
              padding: 3px 6px;
              border-radius: 999px;
              background: #f1f5f9;
              color: #334155;
              white-space: nowrap;
            }
            .pill.blue {
              background: #eff6ff;
              color: #1d4ed8;
            }
            .footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 8px;
              font-size: 8px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="accent"></div>
            <div class="inner">
              <div class="left">
                <div>
                  <div class="school">${schoolName}</div>
                  <div class="title">Kartu Nama QR Siswa</div>
                </div>
                <div>
                  <div class="name">${student.name}</div>
                  <div class="meta">
                    <span class="pill">NISN ${student.nisn}</span>
                    <span class="pill blue">${student.className}</span>
                  </div>
                </div>
                <div class="footer">
                  <span>Absensi Digital</span>
                  <span>Kartu berlaku selama siswa terdaftar</span>
                </div>
              </div>
              <div class="right">
                <img class="qr-image" src="${qrDataUrl}" alt="QR Code" />
                <div style="font-size:8px;color:#94a3b8;text-align:center;">SCAN</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id={`qr-card-${student.id}`} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-center">
      <div className="w-full max-w-[360px] bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500" />
        <div className="p-4 flex gap-4 items-stretch">
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                <School2 className="w-3.5 h-3.5" />
                {schoolName || 'Absensi Premium'}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Kartu Nama QR Siswa
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">Nama</div>
              <div className="text-[17px] font-black text-slate-900 leading-tight break-words">
                {student.name}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  <IdCard className="w-3 h-3 text-slate-500" />
                  {student.nisn}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                  <BadgeInfo className="w-3 h-3" />
                  {student.className}
                </span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 uppercase tracking-wider">
              Scan untuk absensi masuk
            </div>
          </div>

          <div className="w-[118px] shrink-0 flex flex-col items-center justify-center border-l border-slate-100 pl-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR Code ${student.name}`} className="w-[104px] h-[104px] rounded-xl border border-slate-100 bg-white p-1" />
            ) : (
              <div className="w-[104px] h-[104px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-300" />
              </div>
            )}
            <div className="mt-2 text-[9px] font-bold tracking-[0.18em] text-slate-400 uppercase">
              QR Card
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 mt-4 w-full max-w-[360px]">
        <button
          onClick={handlePrint}
          disabled={!qrDataUrl}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition disabled:bg-slate-300 cursor-pointer"
          id={`print-btn-${student.id}`}
        >
          <Printer className="w-3.5 h-3.5" />
          Cetak Kartu
        </button>

        <a
          href={qrDataUrl}
          download={`QR_${student.nisn}_${student.name.replace(/\s+/g, '_')}.png`}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-xs transition ${!qrDataUrl ? 'pointer-events-none opacity-50' : ''}`}
          id={`download-link-${student.id}`}
        >
          <Download className="w-3.5 h-3.5" />
          Unduh QR
        </a>
      </div>
    </div>
  );
}
