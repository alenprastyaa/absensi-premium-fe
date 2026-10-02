import React, { useMemo, useState } from 'react';
import { Award, Calendar, CheckCircle, Eye, GraduationCap, TrendingUp, BookOpen } from 'lucide-react';
import { AttendanceStatus, ParentOverview, ParentSubjectGrade } from '../types';

// Portal Orang Tua/Siswa: semua tampilan di sini HANYA BACA.
// Tidak ada tombol tambah/ubah/hapus; backend juga menolak semua perubahan.

export type ParentView = 'dashboard' | 'grades' | 'attendance' | 'progress';

const STATUS_META: Record<AttendanceStatus, { label: string; pill: string }> = {
  hadir: { label: 'Hadir', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  sakit: { label: 'Sakit', pill: 'bg-amber-50 text-amber-700 border-amber-100' },
  izin: { label: 'Izin', pill: 'bg-blue-50 text-blue-700 border-blue-100' },
  alfa: { label: 'Alpa', pill: 'bg-rose-50 text-rose-700 border-rose-100' },
};
const STATUS_ORDER: AttendanceStatus[] = ['hadir', 'sakit', 'izin', 'alfa'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const formatMonth = (ym: string) => {
  const [y, m] = ym.split('-');
  return `${MONTHS[Number(m) - 1] || m} ${y}`;
};
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const semesterLabel = (s: 'ganjil' | 'genap') => (s === 'ganjil' ? 'Ganjil' : 'Genap');

// Predikat nilai akhir per mapel (permintaan sekolah):
// SB >= 90, B 70-89, C 50-69, KB 10-49. Nilai < 10 ikut KB.
type Predicate = { code: 'SB' | 'B' | 'C' | 'KB'; label: string; note: (subject: string) => string; pill: string };
const PREDICATES: Predicate[] = [
  { code: 'SB', label: 'Sangat Baik', note: (s) => `Sangat baik dalam menguasai materi ${s}. Pertahankan prestasinya.`, pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { code: 'B', label: 'Baik', note: (s) => `Baik dalam menguasai materi ${s}. Terus tingkatkan.`, pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { code: 'C', label: 'Cukup Baik', note: (s) => `Cukup baik dalam materi ${s}. Perlu lebih banyak latihan.`, pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  { code: 'KB', label: 'Kurang Baik', note: (s) => `Kurang baik dalam materi ${s}. Perlu bimbingan dan pendampingan belajar.`, pill: 'bg-rose-50 text-rose-700 border-rose-200' },
];
export const getPredicate = (score: number): Predicate =>
  score >= 90 ? PREDICATES[0] : score >= 70 ? PREDICATES[1] : score >= 50 ? PREDICATES[2] : PREDICATES[3];
const PREDICATE_RANGES: Record<Predicate['code'], string> = { SB: '90 ke atas', B: '70–89', C: '50–69', KB: '10–49' };

const hasAnyGrade = (g: ParentSubjectGrade) => g.nh.some((n) => n.value !== null) || g.pas?.value != null;

const scoreTone = (score: number) =>
  score >= 85 ? 'text-emerald-700' : score >= 70 ? 'text-slate-800' : 'text-rose-600';

const ReadOnlyBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
    <Eye className="w-3.5 h-3.5" /> Hanya lihat
  </span>
);

const Card: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; right?: React.ReactNode }> = ({ title, icon: Icon, children, right }) => (
  <section className="bg-white rounded-lg border border-slate-200 shadow-sm">
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
      <h3 className="font-bold font-display text-slate-800 flex items-center gap-2">
        <Icon className="w-4 h-4 text-indigo-600" /> {title}
      </h3>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Empty = ({ text }: { text: string }) => <p className="text-sm text-slate-400 text-center py-8">{text}</p>;

// Grafik batang satu seri (satu warna, tanpa legenda). Label nilai di atas batang,
// tooltip saat hover, dan data yang sama tersedia sebagai tabel di bawahnya.
const BarChart: React.FC<{ items: Array<{ key: string; label: string; value: number; tooltip: string }>; max: number; unit: string }> = ({ items, max, unit }) => (
  <div className="flex items-end gap-3 h-48 pt-6 border-b border-slate-200 overflow-x-auto">
    {items.map((item) => (
      <div key={item.key} className="group relative flex-1 min-w-[44px] h-full flex flex-col items-center justify-end">
        <span className="text-xs font-semibold text-slate-700 mb-1">{item.value}{unit}</span>
        <div
          className="w-full max-w-[40px] bg-indigo-500 group-hover:bg-indigo-600 rounded-t-[4px] transition-colors"
          style={{ height: `${Math.max(2, (item.value / max) * 100)}%` }}
        />
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-xs px-2 py-1 rounded-md shadow z-10">
          {item.tooltip}
        </span>
      </div>
    ))}
  </div>
);
const BarLabels: React.FC<{ labels: Array<{ key: string; label: string }> }> = ({ labels }) => (
  <div className="flex gap-3 mt-2 overflow-x-auto">
    {labels.map((l) => (
      <span key={l.key} className="flex-1 min-w-[44px] text-center text-[11px] text-slate-500 leading-tight">{l.label}</span>
    ))}
  </div>
);

const SubjectGradeCard: React.FC<{ grade: ParentSubjectGrade }> = ({ grade }) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden">
    <div className="px-4 py-3 bg-slate-50 flex items-start justify-between gap-3">
      <div>
        <div className="font-bold text-slate-800">{grade.subjectName}</div>
        <div className="text-xs text-slate-500">{grade.teacherName} • Bobot NH {grade.nhWeight}% / PAS {grade.pasWeight}%</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Nilai Akhir</div>
        <div className={`text-2xl font-extrabold font-display ${scoreTone(grade.finalScore)}`}>{grade.finalScore}</div>
      </div>
    </div>
    <table className="w-full text-sm">
      <tbody className="divide-y divide-slate-100">
        {grade.nh.map((n) => (
          <tr key={n.assessmentId}>
            <td className="px-4 py-2 text-slate-600">{n.name} <span className="text-xs text-slate-400">• {n.date}</span></td>
            <td className="px-4 py-2 text-right font-semibold text-slate-800">{n.value ?? <span className="text-slate-300 font-normal">-</span>}</td>
          </tr>
        ))}
        <tr className="bg-indigo-50/40">
          <td className="px-4 py-2 font-semibold text-indigo-700">Rata-rata Nilai Harian</td>
          <td className="px-4 py-2 text-right font-bold text-indigo-700">{grade.nh.length ? grade.avgNh : '-'}</td>
        </tr>
        <tr>
          <td className="px-4 py-2 text-slate-600">{grade.pas?.name || 'PAS'}</td>
          <td className="px-4 py-2 text-right font-semibold text-slate-800">{grade.pas?.value ?? <span className="text-slate-300 font-normal">-</span>}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

interface Props {
  view: ParentView;
  data: ParentOverview | null;
  loading: boolean;
}

export default function ParentPortal({ view, data, loading }: Props) {
  const periods = useMemo(() => {
    const seen = new Map<string, string>();
    data?.grades.forEach((g) => seen.set(`${g.academicYearId}|${g.semester}`, `${g.academicYearName} • ${semesterLabel(g.semester)}`));
    return [...seen.entries()];
  }, [data]);
  const [periodKey, setPeriodKey] = useState<string>('');
  const activePeriod = periodKey || periods[0]?.[0] || '';
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');

  if (!data) {
    return <Empty text={loading ? 'Memuat data siswa...' : 'Data siswa belum tersedia.'} />;
  }

  const { student, attendance, grades, progress } = data;
  const s = attendance.summary;
  const periodGrades = grades.filter((g) => `${g.academicYearId}|${g.semester}` === activePeriod);
  const latestSemester = progress.gradesBySemester[progress.gradesBySemester.length - 1];

  const header = (
    <section className="bg-slate-950 rounded-lg border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Portal Orang Tua / Siswa</div>
        <h2 className="mt-1 text-2xl font-extrabold font-display text-white">{student.name}</h2>
        <p className="text-sm text-slate-300 mt-1">{student.className} • NISN {student.nisn} • {student.schoolName}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-slate-200 bg-white/10 border border-white/10 px-3 py-1.5 rounded-md">
        <Eye className="w-4 h-4" /> Akses hanya lihat — data diisi oleh guru
      </span>
    </section>
  );

  const statusTiles = (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div className="bg-white rounded-lg border border-slate-200 p-4 col-span-2 lg:col-span-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kehadiran</div>
        <div className="text-3xl font-extrabold font-display text-slate-900 mt-1">{s.attendanceRate}%</div>
        <div className="text-xs text-slate-500">{s.hadir} dari {s.total} catatan</div>
      </div>
      {STATUS_ORDER.map((st) => (
        <div key={st} className="bg-white rounded-lg border border-slate-200 p-4">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${STATUS_META[st].pill}`}>{STATUS_META[st].label}</span>
          <div className="text-2xl font-extrabold font-display text-slate-900 mt-2">{s[st]}</div>
        </div>
      ))}
    </div>
  );

  if (view === 'grades') {
    return (
      <div className="space-y-6">
        {header}
        <Card title="Nilai per Mata Pelajaran" icon={Award} right={<ReadOnlyBadge />}>
          {periods.length === 0 ? (
            <Empty text="Belum ada nilai yang diinput guru." />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <label className="text-xs font-semibold text-slate-500" htmlFor="parent-period">Periode</label>
                <select
                  id="parent-period"
                  value={activePeriod}
                  onChange={(e) => setPeriodKey(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                >
                  {periods.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {periodGrades.map((g) => <SubjectGradeCard key={g.subjectId} grade={g} />)}
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Nilai akhir = rata-rata nilai harian × bobot NH + nilai PAS × bobot PAS. Nilai yang belum diinput dihitung 0.
              </p>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (view === 'attendance') {
    const rows = attendance.records.filter((r) => statusFilter === 'all' || r.status === statusFilter);
    return (
      <div className="space-y-6">
        {header}
        {statusTiles}
        <Card title="Riwayat Absensi" icon={Calendar} right={<ReadOnlyBadge />}>
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', ...STATUS_ORDER] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${statusFilter === st ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {st === 'all' ? 'Semua' : STATUS_META[st].label}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <Empty text="Belum ada catatan absensi." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr><th className="text-left p-3">Tanggal</th><th className="text-left p-3">Jam</th><th className="text-left p-3">Status</th><th className="text-left p-3">Kelas</th><th className="text-left p-3">Metode</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-semibold text-slate-800">{formatDate(r.date)}</td>
                      <td className="p-3 font-mono text-xs">{r.time}</td>
                      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_META[r.status].pill}`}>{STATUS_META[r.status].label}</span></td>
                      <td className="p-3">{r.className}</td>
                      <td className="p-3 text-xs">{r.method === 'qr' ? 'Scan QR' : 'Manual'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (view === 'progress') {
    const months = progress.attendanceByMonth.slice(-12);
    // Catatan per mapel, dikelompokkan per periode (terbaru dulu, urutan dari backend).
    const notePeriods: Array<{ key: string; label: string; items: ParentSubjectGrade[] }> = [];
    for (const g of grades.filter(hasAnyGrade)) {
      const key = `${g.academicYearId}|${g.semester}`;
      let period = notePeriods.find((p) => p.key === key);
      if (!period) {
        period = { key, label: `${g.academicYearName} • Semester ${semesterLabel(g.semester)}`, items: [] };
        notePeriods.push(period);
      }
      period.items.push(g);
    }
    return (
      <div className="space-y-6">
        {header}
        <Card title="Catatan Perkembangan per Mata Pelajaran" icon={BookOpen} right={<ReadOnlyBadge />}>
          {notePeriods.length === 0 ? <Empty text="Belum ada nilai yang diinput guru." /> : (
            <div className="space-y-6">
              {notePeriods.map((period) => (
                <div key={period.key}>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{period.label}</div>
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left p-3">Mata Pelajaran</th>
                          <th className="text-right p-3">Nilai Akhir</th>
                          <th className="text-center p-3">Predikat</th>
                          <th className="text-left p-3">Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {period.items.map((g) => {
                          const p = getPredicate(g.finalScore);
                          return (
                            <tr key={g.subjectId}>
                              <td className="p-3 font-semibold text-slate-800">{g.subjectName}</td>
                              <td className="p-3 text-right font-bold text-slate-800">{g.finalScore}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${p.pill}`} title={p.label}>
                                  {p.code} <span className="font-semibold">({p.label})</span>
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 min-w-[240px]">{p.note(g.subjectName)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="font-semibold">Keterangan:</span>
                {PREDICATES.map((p) => (
                  <span key={p.code} className={`px-2 py-0.5 rounded border ${p.pill}`}>{p.code} = {p.label} ({PREDICATE_RANGES[p.code]})</span>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card title="Perkembangan Kehadiran per Bulan" icon={TrendingUp} right={<ReadOnlyBadge />}>
          {months.length === 0 ? <Empty text="Belum ada data absensi." /> : (
            <>
              <p className="text-xs text-slate-500 mb-2">Persentase hadir dari seluruh catatan absensi di bulan tersebut.</p>
              <BarChart
                unit="%"
                max={100}
                items={months.map((m) => ({ key: m.month, label: formatMonth(m.month), value: m.attendanceRate, tooltip: `${formatMonth(m.month)}: ${m.attendanceRate}% hadir (${m.hadir}/${m.total})` }))}
              />
              <BarLabels labels={months.map((m) => ({ key: m.month, label: formatMonth(m.month) }))} />
              <div className="overflow-x-auto mt-5">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <tr><th className="text-left p-2">Bulan</th>{STATUS_ORDER.map((st) => <th key={st} className="text-right p-2">{STATUS_META[st].label}</th>)}<th className="text-right p-2">Kehadiran</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {[...months].reverse().map((m) => (
                      <tr key={m.month}>
                        <td className="p-2 font-semibold text-slate-800">{formatMonth(m.month)}</td>
                        {STATUS_ORDER.map((st) => <td key={st} className="p-2 text-right">{m[st]}</td>)}
                        <td className="p-2 text-right font-bold text-slate-800">{m.attendanceRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
        <Card title="Perkembangan Nilai per Semester" icon={GraduationCap} right={<ReadOnlyBadge />}>
          {progress.gradesBySemester.length === 0 ? <Empty text="Belum ada nilai yang diinput guru." /> : (
            <>
              <p className="text-xs text-slate-500 mb-2">Rata-rata nilai akhir dari mata pelajaran yang sudah dinilai.</p>
              <BarChart
                unit=""
                max={100}
                items={progress.gradesBySemester.map((g) => {
                  const label = `${g.academicYearName} ${semesterLabel(g.semester)}`;
                  return { key: label, label, value: g.averageScore, tooltip: `${label}: rata-rata ${g.averageScore} (${g.subjectCount} mapel)` };
                })}
              />
              <BarLabels labels={progress.gradesBySemester.map((g) => ({ key: `${g.academicYearName}${g.semester}`, label: `${g.academicYearName} ${semesterLabel(g.semester)}` }))} />
            </>
          )}
        </Card>
      </div>
    );
  }

  // Ringkasan
  const recent = attendance.records.slice(0, 5);
  return (
    <div className="space-y-6">
      {header}
      {statusTiles}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Absensi Terbaru" icon={CheckCircle}>
          {recent.length === 0 ? <Empty text="Belum ada catatan absensi." /> : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{formatDate(r.date)} <span className="text-xs text-slate-400 font-mono">{r.time}</span></span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${STATUS_META[r.status].pill}`}>{STATUS_META[r.status].label}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Nilai Semester Terakhir" icon={BookOpen}>
          {!latestSemester ? <Empty text="Belum ada nilai yang diinput guru." /> : (
            <>
              <div className="flex items-end justify-between mb-3">
                <div className="text-sm text-slate-500">{latestSemester.academicYearName} • {semesterLabel(latestSemester.semester)}</div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Rata-rata</div>
                  <div className={`text-3xl font-extrabold font-display ${scoreTone(latestSemester.averageScore)}`}>{latestSemester.averageScore}</div>
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {grades
                  .filter((g) => g.academicYearName === latestSemester.academicYearName && g.semester === latestSemester.semester)
                  .map((g) => (
                    <li key={g.subjectId} className="py-2 flex justify-between text-sm">
                      <span className="text-slate-700">{g.subjectName}</span>
                      <span className={`font-bold ${scoreTone(g.finalScore)}`}>{g.finalScore}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
