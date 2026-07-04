/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  School, 
  User, 
  Class, 
  Student, 
  Attendance,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
  Subject,
  AcademicYear,
  AssessmentWeight,
  Assessment,
  StudentGrade
} from '../types';

// Extend User in the database layer to include password
export interface DBUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  schools: School[];
  users: DBUser[];
  classes: Class[];
  students: Student[];
  attendances: Attendance[];
  subjects?: Subject[];
  academicYears?: AcademicYear[];
  assessmentWeights?: AssessmentWeight[];
  assessments?: Assessment[];
  studentGrades?: StudentGrade[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const createEmptyDatabase = (): DatabaseSchema => ({
  schools: [],
  users: [],
  classes: [],
  students: [],
  attendances: [],
  subjects: [],
  academicYears: [],
  assessmentWeights: [],
  assessments: [],
  studentGrades: []
});

class DatabaseManager {
  private data: DatabaseSchema = createEmptyDatabase();

  constructor() {
    this.init();
  }

  // Initialize the database file
  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        if (!fileContent.trim()) {
          console.warn('Database file is empty. Re-seeding database.');
          this.seed();
          return;
        }

        try {
          this.data = JSON.parse(fileContent);
        } catch (error) {
          const backupFile = `${DB_FILE}.invalid-${Date.now()}`;
          fs.copyFileSync(DB_FILE, backupFile);
          console.error(`Database file is invalid JSON. Backed it up to ${backupFile}.`, error);
          this.seed();
          return;
        }
        
        // Ensure new collections exist
        if (!this.data.subjects) this.data.subjects = [];
        if (!this.data.academicYears) this.data.academicYears = [];
        if (!this.data.assessmentWeights) this.data.assessmentWeights = [];
        if (!this.data.assessments) this.data.assessments = [];
        if (!this.data.studentGrades) this.data.studentGrades = [];
        
        // Ensure default weights exist if none are found in the db
        if (this.data.assessmentWeights.length === 0) {
          this.data.assessmentWeights = [
            { id: 'wt-nh-sch-sma1', schoolId: 'sch-sma1', name: 'NH (Nilai Harian)', code: 'nh', weight: 70 },
            { id: 'wt-pas-sch-sma1', schoolId: 'sch-sma1', name: 'PAS', code: 'pas', weight: 30 }
          ];
          this.save();
        }
      } else {
        this.seed();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      this.seed(); // Fallback to memory
    }
  }

  // Save data to disk
  private save() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (error) {
      console.error('Failed to save database to disk:', error);
    }
  }

  // Seed initial data
  private seed() {
    console.log('Seeding initial relational database...');
    
    // Hash default passwords
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('admin123', salt);

    // 1. Create a sample school
    const sampleSchool: School = {
      id: 'sch-sma1',
      name: 'SMA Negeri 1 Jakarta',
      address: 'Jl. Budi Utomo No.7, Jakarta Pusat',
      subscriptionPlan: 'tahunan',
      subscriptionStatus: 'aktif',
      createdAt: new Date().toISOString()
    };

    // 2. Create users (Super Admin, School Admin, Teacher)
    const superAdmin: DBUser = {
      id: 'usr-super',
      schoolId: null,
      username: 'superadmin',
      name: 'Budi Santoso (Super Admin)',
      role: 'super_admin',
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString()
    };

    const schoolAdmin: DBUser = {
      id: 'usr-admin1',
      schoolId: 'sch-sma1',
      username: 'adminsma1',
      name: 'Siti Rahma (Admin Sekolah)',
      role: 'admin',
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString()
    };

    const teacher: DBUser = {
      id: 'usr-teacher1',
      schoolId: 'sch-sma1',
      username: 'gurusma1',
      name: 'Eko Prasetyo, S.Pd. (Guru Kelas)',
      role: 'teacher',
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString()
    };

    // 3. Create sample Classes
    const classes: Class[] = [
      { id: 'cls-10a', schoolId: 'sch-sma1', name: 'Kelas X-A', createdAt: new Date().toISOString() },
      { id: 'cls-11a', schoolId: 'sch-sma1', name: 'Kelas XI-A', createdAt: new Date().toISOString() },
      { id: 'cls-12a', schoolId: 'sch-sma1', name: 'Kelas XII-A', createdAt: new Date().toISOString() }
    ];

    // 4. Create sample Students
    const students: Student[] = [
      { id: 'std-1', schoolId: 'sch-sma1', classId: 'cls-10a', name: 'Aditya Pratama', nisn: '0012345678', qrCode: 'QR-0012345678-ADITYA', createdAt: new Date().toISOString() },
      { id: 'std-2', schoolId: 'sch-sma1', classId: 'cls-10a', name: 'Anisa Lestari', nisn: '0012345679', qrCode: 'QR-0012345679-ANISA', createdAt: new Date().toISOString() },
      { id: 'std-3', schoolId: 'sch-sma1', classId: 'cls-11a', name: 'Bagas Wibowo', nisn: '0012345680', qrCode: 'QR-0012345680-BAGAS', createdAt: new Date().toISOString() },
      { id: 'std-4', schoolId: 'sch-sma1', classId: 'cls-11a', name: 'Citra Kirana', nisn: '0012345681', qrCode: 'QR-0012345681-CITRA', createdAt: new Date().toISOString() },
      { id: 'std-5', schoolId: 'sch-sma1', classId: 'cls-12a', name: 'Dimas Saputra', nisn: '0012345682', qrCode: 'QR-0012345682-DIMAS', createdAt: new Date().toISOString() }
    ];

    // 5. Create some sample Attendances for today and yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const attendances: Attendance[] = [
      {
        id: 'att-1',
        schoolId: 'sch-sma1',
        studentId: 'std-1',
        classId: 'cls-10a',
        date: yesterday,
        time: '07:15:30',
        status: 'hadir',
        method: 'qr',
        scannedByUserId: 'usr-teacher1',
        createdAt: new Date(yesterday + 'T07:15:30Z').toISOString()
      },
      {
        id: 'att-2',
        schoolId: 'sch-sma1',
        studentId: 'std-2',
        classId: 'cls-10a',
        date: yesterday,
        time: '07:22:15',
        status: 'hadir',
        method: 'qr',
        scannedByUserId: 'usr-teacher1',
        createdAt: new Date(yesterday + 'T07:22:15Z').toISOString()
      },
      {
        id: 'att-3',
        schoolId: 'sch-sma1',
        studentId: 'std-3',
        classId: 'cls-11a',
        date: yesterday,
        time: '07:10:00',
        status: 'hadir',
        method: 'qr',
        scannedByUserId: 'usr-teacher1',
        createdAt: new Date(yesterday + 'T07:10:00Z').toISOString()
      },
      {
        id: 'att-4',
        schoolId: 'sch-sma1',
        studentId: 'std-4',
        classId: 'cls-11a',
        date: yesterday,
        time: '08:00:00',
        status: 'izin',
        method: 'manual',
        scannedByUserId: 'usr-teacher1',
        createdAt: new Date(yesterday + 'T08:00:00Z').toISOString()
      },
      {
        id: 'att-5',
        schoolId: 'sch-sma1',
        studentId: 'std-1',
        classId: 'cls-10a',
        date: today,
        time: '07:12:44',
        status: 'hadir',
        method: 'qr',
        scannedByUserId: 'usr-teacher1',
        createdAt: new Date().toISOString()
      }
    ];

    const subjects: Subject[] = [
      { id: 'sub-mat-10a', schoolId: 'sch-sma1', code: 'MAT-10A', name: 'Matematika', teacherName: 'Eko Prasetyo, S.Pd.', classId: 'cls-10a', isActive: true, createdAt: new Date().toISOString() },
      { id: 'sub-ipa-10a', schoolId: 'sch-sma1', code: 'IPA-10A', name: 'Fisika', teacherName: 'Eko Prasetyo, S.Pd.', classId: 'cls-10a', isActive: true, createdAt: new Date().toISOString() }
    ];

    const academicYears: AcademicYear[] = [
      { id: 'ay-2026-2027', schoolId: 'sch-sma1', name: '2026/2027', isActive: true, createdAt: new Date().toISOString() }
    ];

    const assessmentWeights: AssessmentWeight[] = [
      { id: 'wt-nh-sch-sma1', schoolId: 'sch-sma1', name: 'NH (Nilai Harian)', code: 'nh', weight: 70 },
      { id: 'wt-pas-sch-sma1', schoolId: 'sch-sma1', name: 'PAS', code: 'pas', weight: 30 }
    ];

    this.data = {
      schools: [sampleSchool],
      users: [superAdmin, schoolAdmin, teacher],
      classes,
      students,
      attendances,
      subjects,
      academicYears,
      assessmentWeights,
      assessments: [],
      studentGrades: []
    };

    this.save();
  }

  // Helper helper helpers!
  generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // --- SCHOOLS CRUD ---
  getSchools(): School[] {
    return this.data.schools;
  }

  getSchool(id: string): School | undefined {
    return this.data.schools.find(s => s.id === id);
  }

  createSchool(name: string, address: string, plan: SubscriptionPlan): School {
    const school: School = {
      id: this.generateId('sch'),
      name,
      address,
      subscriptionPlan: plan,
      subscriptionStatus: 'aktif',
      createdAt: new Date().toISOString()
    };
    this.data.schools.push(school);
    this.save();
    return school;
  }

  updateSchool(id: string, updates: Partial<Omit<School, 'id' | 'createdAt'>>): School | null {
    const idx = this.data.schools.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.schools[idx] = { ...this.data.schools[idx], ...updates };
    this.save();
    return this.data.schools[idx];
  }

  deleteSchool(id: string) {
    this.data.schools = this.data.schools.filter(s => s.id !== id);
    // Cascade delete classes, students, attendances, users of that school!
    this.data.users = this.data.users.filter(u => u.schoolId !== id);
    this.data.classes = this.data.classes.filter(c => c.schoolId !== id);
    this.data.students = this.data.students.filter(s => s.schoolId !== id);
    this.data.attendances = this.data.attendances.filter(a => a.schoolId !== id);
    this.save();
  }

  // --- USERS CRUD ---
  getUsers(schoolId: string | null): DBUser[] {
    return this.data.users.filter(u => u.schoolId === schoolId);
  }

  getUser(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): DBUser | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  createUser(schoolId: string | null, username: string, passwordPlain: string, role: UserRole, name: string): DBUser | null {
    // Check if username already exists globally
    if (this.getUserByUsername(username)) {
      return null;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordPlain, salt);

    const user: DBUser = {
      id: this.generateId('usr'),
      schoolId,
      username,
      name,
      role,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, schoolId: string | null, updates: { name?: string; passwordPlain?: string }): DBUser | null {
    const idx = this.data.users.findIndex(u => u.id === id && (schoolId === null || u.schoolId === schoolId));
    if (idx === -1) return null;

    const user = this.data.users[idx];
    if (updates.name) {
      user.name = updates.name;
    }
    if (updates.passwordPlain) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(updates.passwordPlain, salt);
    }

    this.data.users[idx] = user;
    this.save();
    return user;
  }

  deleteUser(id: string, schoolId: string | null) {
    this.data.users = this.data.users.filter(u => !(u.id === id && (schoolId === null || u.schoolId === schoolId)));
    this.save();
  }

  // --- CLASSES CRUD ---
  getClasses(schoolId: string): Class[] {
    return this.data.classes.filter(c => c.schoolId === schoolId);
  }

  getClass(id: string, schoolId: string): Class | undefined {
    return this.data.classes.find(c => c.id === id && c.schoolId === schoolId);
  }

  createClass(schoolId: string, name: string): Class {
    const cls: Class = {
      id: this.generateId('cls'),
      schoolId,
      name,
      createdAt: new Date().toISOString()
    };
    this.data.classes.push(cls);
    this.save();
    return cls;
  }

  updateClass(id: string, schoolId: string, name: string): Class | null {
    const idx = this.data.classes.findIndex(c => c.id === id && c.schoolId === schoolId);
    if (idx === -1) return null;
    this.data.classes[idx].name = name;
    this.save();
    return this.data.classes[idx];
  }

  deleteClass(id: string, schoolId: string) {
    this.data.classes = this.data.classes.filter(c => !(c.id === id && c.schoolId === schoolId));
    // Cascade delete students or attendances in that class
    this.data.students = this.data.students.filter(s => !(s.classId === id && s.schoolId === schoolId));
    this.data.attendances = this.data.attendances.filter(a => !(a.classId === id && a.schoolId === schoolId));
    this.save();
  }

  // --- STUDENTS CRUD ---
  getStudents(schoolId: string): Student[] {
    return this.data.students.filter(s => s.schoolId === schoolId);
  }

  getStudent(id: string, schoolId: string): Student | undefined {
    return this.data.students.find(s => s.id === id && s.schoolId === schoolId);
  }

  getStudentByQrCode(qrCode: string): Student | undefined {
    return this.data.students.find(s => s.qrCode === qrCode);
  }

  createStudent(schoolId: string, classId: string, name: string, nisn: string): Student | null {
    // Class check
    const cls = this.getClass(classId, schoolId);
    if (!cls) return null;

    // QR Code must be unique
    const cleanNisn = nisn.trim();
    const qrCode = `QR-${cleanNisn}-${name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10)}`;

    const student: Student = {
      id: this.generateId('std'),
      schoolId,
      classId,
      name,
      nisn: cleanNisn,
      qrCode,
      createdAt: new Date().toISOString()
    };

    this.data.students.push(student);
    this.save();
    return student;
  }

  updateStudent(id: string, schoolId: string, classId: string, name: string, nisn: string): Student | null {
    const idx = this.data.students.findIndex(s => s.id === id && s.schoolId === schoolId);
    if (idx === -1) return null;

    const cls = this.getClass(classId, schoolId);
    if (!cls) return null;

    const cleanNisn = nisn.trim();
    const student = this.data.students[idx];
    
    // If name or NISN changed, let's update QR
    if (student.name !== name || student.nisn !== cleanNisn) {
      student.qrCode = `QR-${cleanNisn}-${name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10)}`;
    }

    student.name = name;
    student.nisn = cleanNisn;
    student.classId = classId;

    this.data.students[idx] = student;
    this.save();
    return student;
  }

  deleteStudent(id: string, schoolId: string) {
    this.data.students = this.data.students.filter(s => !(s.id === id && s.schoolId === schoolId));
    // Cascade delete attendances of that student
    this.data.attendances = this.data.attendances.filter(a => !(a.studentId === id && a.schoolId === schoolId));
    this.save();
  }

  // --- ATTENDANCE CRUD ---
  getAttendances(schoolId: string): Attendance[] {
    return this.data.attendances.filter(a => a.schoolId === schoolId);
  }

  recordAttendance(
    schoolId: string, 
    studentId: string, 
    classId: string, 
    status: 'hadir' | 'sakit' | 'izin' | 'alfa', 
    method: 'qr' | 'manual', 
    scannedByUserId: string,
    customDate?: string // optional date for manual input/retroactive edit
  ): Attendance | null {
    // Verify student and class belong to school
    const student = this.getStudent(studentId, schoolId);
    if (!student) return null;

    const todayDate = customDate || new Date().toISOString().split('T')[0];
    const todayTime = new Date().toTimeString().split(' ')[0];

    // Check if attendance already exists for this student today
    const existingIdx = this.data.attendances.findIndex(
      a => a.studentId === studentId && a.date === todayDate && a.schoolId === schoolId
    );

    if (existingIdx !== -1) {
      // Update existing attendance
      this.data.attendances[existingIdx].status = status;
      this.data.attendances[existingIdx].method = method;
      this.data.attendances[existingIdx].scannedByUserId = scannedByUserId;
      this.data.attendances[existingIdx].time = todayTime;
      this.save();
      return this.data.attendances[existingIdx];
    } else {
      // Create new attendance record
      const attendance: Attendance = {
        id: this.generateId('att'),
        schoolId,
        studentId,
        classId,
        date: todayDate,
        time: todayTime,
        status,
        method,
        scannedByUserId,
        createdAt: new Date().toISOString()
      };
      this.data.attendances.push(attendance);
      this.save();
      return attendance;
    }
  }

  deleteAttendance(id: string, schoolId: string) {
    this.data.attendances = this.data.attendances.filter(a => !(a.id === id && a.schoolId === schoolId));
    this.save();
  }

  // --- SUBJECTS (MATA PELAJARAN) ---
  getSubjects(schoolId: string): Subject[] {
    this.data.subjects = this.data.subjects || [];
    return this.data.subjects.filter(s => s.schoolId === schoolId);
  }

  getSubject(id: string, schoolId: string): Subject | undefined {
    this.data.subjects = this.data.subjects || [];
    return this.data.subjects.find(s => s.id === id && s.schoolId === schoolId);
  }

  getSubjectByCode(code: string, schoolId: string): Subject | undefined {
    this.data.subjects = this.data.subjects || [];
    return this.data.subjects.find(s => s.code.toLowerCase() === code.trim().toLowerCase() && s.schoolId === schoolId);
  }

  createSubject(
    schoolId: string, 
    code: string, 
    name: string, 
    teacherName: string, 
    classId: string, 
    isActive: boolean
  ): Subject | null {
    this.data.subjects = this.data.subjects || [];
    
    // Check if code already exists in this school
    if (this.getSubjectByCode(code, schoolId)) {
      return null;
    }

    const subject: Subject = {
      id: this.generateId('sub'),
      schoolId,
      code: code.trim(),
      name: name.trim(),
      teacherName: teacherName.trim(),
      classId,
      isActive,
      createdAt: new Date().toISOString()
    };

    this.data.subjects.push(subject);
    this.save();
    return subject;
  }

  updateSubject(
    id: string, 
    schoolId: string, 
    code: string, 
    name: string, 
    teacherName: string, 
    classId: string, 
    isActive: boolean
  ): Subject | null {
    this.data.subjects = this.data.subjects || [];
    const idx = this.data.subjects.findIndex(s => s.id === id && s.schoolId === schoolId);
    if (idx === -1) return null;

    // Check code duplicate (excluding self)
    const existing = this.getSubjectByCode(code, schoolId);
    if (existing && existing.id !== id) {
      return null;
    }

    this.data.subjects[idx] = {
      ...this.data.subjects[idx],
      code: code.trim(),
      name: name.trim(),
      teacherName: teacherName.trim(),
      classId,
      isActive
    };

    this.save();
    return this.data.subjects[idx];
  }

  deleteSubject(id: string, schoolId: string): boolean {
    this.data.subjects = this.data.subjects || [];
    const initialLen = this.data.subjects.length;
    this.data.subjects = this.data.subjects.filter(s => !(s.id === id && s.schoolId === schoolId));
    
    // Cascade delete assessments and grades for this subject
    this.data.assessments = this.data.assessments || [];
    const subAssessments = this.data.assessments.filter(a => a.subjectId === id && a.schoolId === schoolId);
    const subAssIds = subAssessments.map(a => a.id);
    
    this.data.assessments = this.data.assessments.filter(a => !(a.subjectId === id && a.schoolId === schoolId));
    
    this.data.studentGrades = this.data.studentGrades || [];
    this.data.studentGrades = this.data.studentGrades.filter(g => !subAssIds.includes(g.assessmentId));

    this.save();
    return this.data.subjects.length < initialLen;
  }

  // --- ACADEMIC YEARS (TAHUN AJARAN) ---
  getAcademicYears(schoolId: string): AcademicYear[] {
    this.data.academicYears = this.data.academicYears || [];
    return this.data.academicYears.filter(ay => ay.schoolId === schoolId);
  }

  getAcademicYear(id: string, schoolId: string): AcademicYear | undefined {
    this.data.academicYears = this.data.academicYears || [];
    return this.data.academicYears.find(ay => ay.id === id && ay.schoolId === schoolId);
  }

  private handleAcademicYearActiveStatus(schoolId: string, activeId: string) {
    this.data.academicYears = this.data.academicYears || [];
    this.data.academicYears.forEach(ay => {
      if (ay.schoolId === schoolId) {
        ay.isActive = (ay.id === activeId);
      }
    });
  }

  createAcademicYear(schoolId: string, name: string, isActive: boolean): AcademicYear {
    this.data.academicYears = this.data.academicYears || [];
    const id = this.generateId('ay');
    
    const academicYear: AcademicYear = {
      id,
      schoolId,
      name: name.trim(),
      isActive,
      createdAt: new Date().toISOString()
    };

    this.data.academicYears.push(academicYear);
    
    if (isActive) {
      this.handleAcademicYearActiveStatus(schoolId, id);
    } else {
      // Ensure at least one active year if this is the only one
      const schoolYears = this.data.academicYears.filter(ay => ay.schoolId === schoolId);
      if (schoolYears.length === 1) {
        academicYear.isActive = true;
      }
    }

    this.save();
    return academicYear;
  }

  updateAcademicYear(id: string, schoolId: string, name: string, isActive: boolean): AcademicYear | null {
    this.data.academicYears = this.data.academicYears || [];
    const idx = this.data.academicYears.findIndex(ay => ay.id === id && ay.schoolId === schoolId);
    if (idx === -1) return null;

    this.data.academicYears[idx].name = name.trim();
    this.data.academicYears[idx].isActive = isActive;

    if (isActive) {
      this.handleAcademicYearActiveStatus(schoolId, id);
    } else {
      // Ensure at least one is active
      const schoolActiveYears = this.data.academicYears.filter(ay => ay.schoolId === schoolId && ay.isActive);
      if (schoolActiveYears.length === 0) {
        // Fallback: keep this active
        this.data.academicYears[idx].isActive = true;
      }
    }

    this.save();
    return this.data.academicYears[idx];
  }

  deleteAcademicYear(id: string, schoolId: string): boolean {
    this.data.academicYears = this.data.academicYears || [];
    const initialLen = this.data.academicYears.length;
    const deletedYear = this.getAcademicYear(id, schoolId);
    if (!deletedYear) return false;

    this.data.academicYears = this.data.academicYears.filter(ay => !(ay.id === id && ay.schoolId === schoolId));

    // Cascade delete assessments and grades for this academic year
    this.data.assessments = this.data.assessments || [];
    const ayAssessments = this.data.assessments.filter(a => a.academicYearId === id && a.schoolId === schoolId);
    const ayAssIds = ayAssessments.map(a => a.id);
    
    this.data.assessments = this.data.assessments.filter(a => !(a.academicYearId === id && a.schoolId === schoolId));
    
    this.data.studentGrades = this.data.studentGrades || [];
    this.data.studentGrades = this.data.studentGrades.filter(g => !ayAssIds.includes(g.assessmentId));

    // If we deleted the active year, make another one active (if exists)
    if (deletedYear.isActive) {
      const schoolYears = this.data.academicYears.filter(ay => ay.schoolId === schoolId);
      if (schoolYears.length > 0) {
        schoolYears[0].isActive = true;
      }
    }

    this.save();
    return this.data.academicYears.length < initialLen;
  }

  // --- ASSESSMENT WEIGHTS (JENIS PENILAIAN) ---
  getAssessmentWeights(schoolId: string): AssessmentWeight[] {
    this.data.assessmentWeights = this.data.assessmentWeights || [];
    const schoolWeights = this.data.assessmentWeights.filter(w => w.schoolId === schoolId);
    
    if (schoolWeights.length === 0) {
      // Initialize if empty
      const defaultWeights: AssessmentWeight[] = [
        { id: `wt-nh-${schoolId}`, schoolId, name: 'NH (Nilai Harian)', code: 'nh', weight: 70 },
        { id: `wt-pas-${schoolId}`, schoolId, name: 'PAS', code: 'pas', weight: 30 }
      ];
      this.data.assessmentWeights.push(...defaultWeights);
      this.save();
      return defaultWeights;
    }
    return schoolWeights;
  }

  updateAssessmentWeights(schoolId: string, weights: { code: 'nh' | 'pas'; weight: number }[]): boolean {
    this.data.assessmentWeights = this.data.assessmentWeights || [];
    
    // Check total weight is exactly 100%
    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    if (total !== 100) return false;

    // Load weights or create
    const schoolWeights = this.getAssessmentWeights(schoolId);
    
    weights.forEach(item => {
      const existing = schoolWeights.find(w => w.code === item.code);
      if (existing) {
        existing.weight = item.weight;
      }
    });

    // Save back to master data
    this.data.assessmentWeights = this.data.assessmentWeights.filter(w => w.schoolId !== schoolId);
    this.data.assessmentWeights.push(...schoolWeights);
    
    this.save();
    return true;
  }

  // --- ASSESSMENTS (PENILAIAN) ---
  getAssessments(schoolId: string): Assessment[] {
    this.data.assessments = this.data.assessments || [];
    return this.data.assessments.filter(a => a.schoolId === schoolId);
  }

  createAssessment(
    schoolId: string,
    academicYearId: string,
    semester: 'ganjil' | 'genap',
    classId: string,
    subjectId: string,
    categoryCode: 'nh' | 'pas',
    name: string,
    date: string
  ): Assessment {
    this.data.assessments = this.data.assessments || [];
    
    const assessment: Assessment = {
      id: this.generateId('ass'),
      schoolId,
      academicYearId,
      semester,
      classId,
      subjectId,
      categoryCode,
      name: name.trim(),
      date,
      createdAt: new Date().toISOString()
    };

    this.data.assessments.push(assessment);
    this.save();
    return assessment;
  }

  deleteAssessment(id: string, schoolId: string): boolean {
    this.data.assessments = this.data.assessments || [];
    const initialLen = this.data.assessments.length;
    this.data.assessments = this.data.assessments.filter(a => !(a.id === id && a.schoolId === schoolId));
    
    // Cascade delete student grades for this assessment
    this.data.studentGrades = this.data.studentGrades || [];
    this.data.studentGrades = this.data.studentGrades.filter(g => !(g.assessmentId === id && g.schoolId === schoolId));
    
    this.save();
    return this.data.assessments.length < initialLen;
  }

  // --- STUDENT GRADES (NILAI SISWA) ---
  getStudentGrades(schoolId: string): StudentGrade[] {
    this.data.studentGrades = this.data.studentGrades || [];
    return this.data.studentGrades.filter(g => g.schoolId === schoolId);
  }

  saveGrades(schoolId: string, assessmentId: string, grades: { studentId: string; value: number }[]): boolean {
    this.data.studentGrades = this.data.studentGrades || [];
    
    grades.forEach(item => {
      const val = Math.min(100, Math.max(0, item.value)); // Clamp 0 to 100
      const existingIdx = this.data.studentGrades!.findIndex(
        g => g.studentId === item.studentId && g.assessmentId === assessmentId && g.schoolId === schoolId
      );

      if (existingIdx !== -1) {
        // Update
        this.data.studentGrades![existingIdx].value = val;
      } else {
        // Insert
        this.data.studentGrades!.push({
          id: this.generateId('grd'),
          schoolId,
          studentId: item.studentId,
          assessmentId,
          value: val,
          createdAt: new Date().toISOString()
        });
      }
    });

    this.save();
    return true;
  }
}

export const db = new DatabaseManager();
