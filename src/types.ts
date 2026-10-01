/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubscriptionPlan = 'bulanan' | 'tahunan' | 'selamanya';
export type SubscriptionStatus = 'aktif' | 'nonaktif';
// 'parent' = Orang Tua/Siswa: login memakai kredensial siswa, hanya bisa melihat.
export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'parent';
export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alfa';
export type AttendanceMethod = 'qr' | 'manual';

export interface School {
  id: string;
  name: string;
  address: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string | null; // null for Super Admin
  username?: string | null;
  role: UserRole;
  name: string;
  initialPassword?: string | null;
  studentId?: string | null; // diisi untuk role 'parent'
  createdAt: string;
  // Password is excluded in client-facing types but present in DB
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  name: string;
  nisn: string;
  username: string;
  initialPassword?: string | null;
  qrCode: string; // Unique token used for scanning
  createdAt: string;
}

export interface Attendance {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: AttendanceStatus;
  method: AttendanceMethod;
  scannedByUserId: string;
  createdAt: string;
}

// Relational DTOs for the UI
export interface StudentWithClass extends Student {
  className: string;
}

export interface AttendanceWithDetails extends Attendance {
  studentName: string;
  nisn: string;
  className: string;
  scannedByName: string;
}

export interface SchoolWithStats extends School {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  teacherName: string;
  classId: string;
  isActive: boolean;
  createdAt: string;
}

export interface SubjectWithClass extends Subject {
  className: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AssessmentWeight {
  id: string;
  schoolId: string;
  subjectId?: string | null;
  name: string;
  code: 'nh' | 'pas';
  weight: number;
}

export interface Assessment {
  id: string;
  schoolId: string;
  academicYearId: string;
  semester: 'ganjil' | 'genap';
  classId: string;
  subjectId: string;
  categoryCode: 'nh' | 'pas';
  name: string;
  date: string;
  createdAt: string;
}

export interface StudentGrade {
  id: string;
  schoolId: string;
  studentId: string;
  assessmentId: string;
  value: number;
  createdAt: string;
}

export interface AssessmentWithDetails extends Assessment {
  academicYearName: string;
  className: string;
  subjectName: string;
}

export interface ParentGradeEntry {
  assessmentId: string;
  name: string;
  date: string;
  value: number | null;
}

export interface ParentSubjectGrade {
  academicYearId: string;
  academicYearName: string;
  semester: 'ganjil' | 'genap';
  subjectId: string;
  subjectName: string;
  teacherName: string;
  nhWeight: number;
  pasWeight: number;
  nh: ParentGradeEntry[];
  pas: ParentGradeEntry | null;
  avgNh: number;
  finalScore: number;
}

export type AttendanceCounts = Record<AttendanceStatus, number> & { total: number; attendanceRate: number };

export interface ParentOverview {
  student: { id: string; name: string; nisn: string; className: string; schoolName: string };
  attendance: {
    summary: AttendanceCounts;
    records: Array<{ id: string; date: string; time: string; status: AttendanceStatus; method: AttendanceMethod; className: string }>;
  };
  grades: ParentSubjectGrade[];
  progress: {
    attendanceByMonth: Array<{ month: string } & AttendanceCounts>;
    gradesBySemester: Array<{ academicYearName: string; semester: 'ganjil' | 'genap'; averageScore: number; subjectCount: number }>;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}
