/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  School, 
  Users, 
  GraduationCap, 
  Calendar, 
  Settings, 
  LogOut, 
  Check, 
  X, 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Key, 
  Search, 
  FileText, 
  QrCode, 
  SlidersHorizontal, 
  BookOpen, 
  UserCheck, 
  AlertTriangle,
  Menu,
  CheckCircle,
  Building,
  HelpCircle,
  Info,
  CalendarDays,
  Printer,
  Download,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  TimerReset,
  FileSpreadsheet,
  MessageCircle,
  Banknote,
  Star,
  Tags
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

import { 
  School as SchoolType, 
  User as UserType, 
  Class as ClassType, 
  Student as StudentType, 
  Attendance as AttendanceType,
  StudentWithClass,
  AttendanceWithDetails,
  SchoolWithStats,
  SubscriptionPlan,
  SubscriptionStatus,
  AttendanceStatus,
  PricingPlan,
  SiteSettings
} from './types';

import QRScanner from './components/QRScanner';
import StudentQRCard from './components/StudentQRCard';
import AcademicModule from './components/AcademicModule';
import SchoolAddressPicker from './components/SchoolAddressPicker';
import { apiFetch } from './lib/api';

const NATIONAL_CALENDAR_DAYS: Record<string, { name: string; type: 'holiday' | 'joint_leave' }> = {
  '2024-01-01': { name: 'Tahun Baru Masehi', type: 'holiday' },
  '2024-02-08': { name: 'Isra Mikraj Nabi Muhammad SAW', type: 'holiday' },
  '2024-02-09': { name: 'Cuti Bersama Tahun Baru Imlek', type: 'joint_leave' },
  '2024-02-10': { name: 'Tahun Baru Imlek', type: 'holiday' },
  '2024-03-11': { name: 'Hari Suci Nyepi', type: 'holiday' },
  '2024-03-12': { name: 'Cuti Bersama Hari Suci Nyepi', type: 'joint_leave' },
  '2024-03-29': { name: 'Wafat Isa Almasih', type: 'holiday' },
  '2024-03-31': { name: 'Hari Paskah', type: 'holiday' },
  '2024-04-08': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2024-04-09': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2024-04-10': { name: 'Idul Fitri', type: 'holiday' },
  '2024-04-11': { name: 'Idul Fitri', type: 'holiday' },
  '2024-04-12': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2024-04-15': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2024-05-01': { name: 'Hari Buruh Internasional', type: 'holiday' },
  '2024-05-09': { name: 'Kenaikan Isa Almasih', type: 'holiday' },
  '2024-05-10': { name: 'Cuti Bersama Kenaikan Isa Almasih', type: 'joint_leave' },
  '2024-05-23': { name: 'Hari Raya Waisak', type: 'holiday' },
  '2024-05-24': { name: 'Cuti Bersama Hari Raya Waisak', type: 'joint_leave' },
  '2024-06-01': { name: 'Hari Lahir Pancasila', type: 'holiday' },
  '2024-06-17': { name: 'Idul Adha', type: 'holiday' },
  '2024-06-18': { name: 'Cuti Bersama Idul Adha', type: 'joint_leave' },
  '2024-07-07': { name: 'Tahun Baru Islam', type: 'holiday' },
  '2024-08-17': { name: 'Hari Kemerdekaan Republik Indonesia', type: 'holiday' },
  '2024-09-16': { name: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
  '2024-12-25': { name: 'Hari Raya Natal', type: 'holiday' },
  '2024-12-26': { name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },
  '2025-01-01': { name: 'Tahun Baru Masehi', type: 'holiday' },
  '2025-01-27': { name: 'Isra Mikraj Nabi Muhammad SAW', type: 'holiday' },
  '2025-01-28': { name: 'Cuti Bersama Tahun Baru Imlek', type: 'joint_leave' },
  '2025-01-29': { name: 'Tahun Baru Imlek', type: 'holiday' },
  '2025-03-28': { name: 'Cuti Bersama Hari Suci Nyepi', type: 'joint_leave' },
  '2025-03-29': { name: 'Hari Suci Nyepi', type: 'holiday' },
  '2025-03-31': { name: 'Idul Fitri', type: 'holiday' },
  '2025-04-01': { name: 'Idul Fitri', type: 'holiday' },
  '2025-04-02': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2025-04-03': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2025-04-04': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2025-04-07': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2025-04-18': { name: 'Wafat Isa Almasih', type: 'holiday' },
  '2025-04-20': { name: 'Hari Paskah', type: 'holiday' },
  '2025-05-01': { name: 'Hari Buruh Internasional', type: 'holiday' },
  '2025-05-12': { name: 'Hari Raya Waisak', type: 'holiday' },
  '2025-05-13': { name: 'Cuti Bersama Hari Raya Waisak', type: 'joint_leave' },
  '2025-05-29': { name: 'Kenaikan Isa Almasih', type: 'holiday' },
  '2025-05-30': { name: 'Cuti Bersama Kenaikan Isa Almasih', type: 'joint_leave' },
  '2025-06-01': { name: 'Hari Lahir Pancasila', type: 'holiday' },
  '2025-06-06': { name: 'Idul Adha', type: 'holiday' },
  '2025-06-09': { name: 'Cuti Bersama Idul Adha', type: 'joint_leave' },
  '2025-06-27': { name: 'Tahun Baru Islam', type: 'holiday' },
  '2025-08-17': { name: 'Hari Kemerdekaan Republik Indonesia', type: 'holiday' },
  '2025-09-05': { name: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
  '2025-12-25': { name: 'Hari Raya Natal', type: 'holiday' },
  '2025-12-26': { name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },
  '2026-01-01': { name: 'Tahun Baru Masehi', type: 'holiday' },
  '2026-01-16': { name: 'Isra Mikraj Nabi Muhammad SAW', type: 'holiday' },
  '2026-02-16': { name: 'Cuti Bersama Tahun Baru Imlek', type: 'joint_leave' },
  '2026-02-17': { name: 'Tahun Baru Imlek', type: 'holiday' },
  '2026-03-18': { name: 'Cuti Bersama Hari Suci Nyepi', type: 'joint_leave' },
  '2026-03-19': { name: 'Hari Suci Nyepi', type: 'holiday' },
  '2026-03-20': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2026-03-21': { name: 'Idul Fitri', type: 'holiday' },
  '2026-03-22': { name: 'Idul Fitri', type: 'holiday' },
  '2026-03-23': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2026-03-24': { name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' },
  '2026-04-03': { name: 'Wafat Isa Almasih', type: 'holiday' },
  '2026-04-05': { name: 'Hari Paskah', type: 'holiday' },
  '2026-05-01': { name: 'Hari Buruh Internasional', type: 'holiday' },
  '2026-05-14': { name: 'Kenaikan Isa Almasih', type: 'holiday' },
  '2026-05-15': { name: 'Cuti Bersama Kenaikan Isa Almasih', type: 'joint_leave' },
  '2026-05-27': { name: 'Idul Adha', type: 'holiday' },
  '2026-05-28': { name: 'Cuti Bersama Idul Adha', type: 'joint_leave' },
  '2026-05-31': { name: 'Hari Raya Waisak', type: 'holiday' },
  '2026-06-01': { name: 'Hari Lahir Pancasila', type: 'holiday' },
  '2026-06-16': { name: 'Tahun Baru Islam', type: 'holiday' },
  '2026-08-17': { name: 'Hari Kemerdekaan Republik Indonesia', type: 'holiday' },
  '2026-08-25': { name: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
  '2026-12-24': { name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },
  '2026-12-25': { name: 'Hari Raya Natal', type: 'holiday' },
};

export default function App() {
  const fetch = apiFetch;
  const location = useLocation();
  const navigate = useNavigate();
  const routeSegment = location.pathname.split('/')[1] || '';
  const routeTab = routeSegment || 'dashboard';
  const activeTab = useMemo(() => {
    const validTabs = new Set(['dashboard', 'schools', 'pricing', 'teachers', 'attendance', 'classes', 'students', 'scan', 'academic', 'password']);
    return validTabs.has(routeTab) ? routeTab : 'dashboard';
  }, [routeTab]);

  // --- AUTH STATES ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('absensi_token'));
  const [user, setUser] = useState<UserType | null>(null);
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // --- LOGIN STATES ---
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // --- NAVIGATION / VIEW STATE ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // --- GLOBAL APP STATES (CRUD DATA) ---
  const [schools, setSchools] = useState<SchoolWithStats[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [students, setStudents] = useState<StudentWithClass[]>([]);
  const [attendances, setAttendances] = useState<AttendanceWithDetails[]>([]);
  const [historyToday, setHistoryToday] = useState<AttendanceWithDetails[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ whatsappNumber: '', whatsappMessageTemplate: '' });

  // --- GLOBAL LOADING STATES ---
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // --- FILTER & SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterPeriod, setFilterPeriod] = useState<string>('harian'); // 'harian' | 'ganjil' | 'genap'
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [recapViewType, setRecapViewType] = useState<'summary' | 'detailed'>('summary');
  const [isIframe, setIsIframe] = useState<boolean>(false);
  const [attendancePeriodMode, setAttendancePeriodMode] = useState<'month' | 'range'>('month');
  const [adminAttendanceMonth, setAdminAttendanceMonth] = useState<number>(new Date().getMonth());
  const [adminAttendanceYear, setAdminAttendanceYear] = useState<string>(new Date().getFullYear().toString());
  const [adminAttendanceClassId, setAdminAttendanceClassId] = useState<string>('all');
  const [attendanceRangeStartDate, setAttendanceRangeStartDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [attendanceRangeEndDate, setAttendanceRangeEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportLogoUrl, setReportLogoUrl] = useState<string>('');
  const [reportLogoUploadLoading, setReportLogoUploadLoading] = useState<boolean>(false);
  const reportLogoInputRef = useRef<HTMLInputElement | null>(null);

  const getReportLogoStorageKey = () => `absensi_report_logo_${school?.id || user?.schoolId || 'default'}`;

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  // Public pricing & contact data used by the landing page (no auth required)
  useEffect(() => {
    const loadPublicLandingData = async () => {
      try {
        const [plansRes, settingsRes] = await Promise.all([
          fetch('/api/public/pricing-plans'),
          fetch('/api/public/settings'),
        ]);
        if (plansRes.ok) setPricingPlans(await plansRes.json());
        if (settingsRes.ok) setSiteSettings(await settingsRes.json());
      } catch (err) {
        console.error('Failed to load public pricing/settings:', err);
      }
    };
    loadPublicLandingData();
  }, []);

  // --- FEEDBACK TOAST / IN-APP ALERTS ---
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // --- MODAL & FORM ACTIVE STATES ---
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState<boolean>(false);
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState<boolean>(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithStats | null>(null);

  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState<boolean>(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState<boolean>(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState<boolean>(false);
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<UserType | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<UserType | null>(null);
  const [teacherImportLoading, setTeacherImportLoading] = useState<boolean>(false);
  const teacherFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithClass | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentWithClass | null>(null);
  const [viewingQRStudent, setViewingQRStudent] = useState<StudentWithClass | null>(null);
  const [studentImportLoading, setStudentImportLoading] = useState<boolean>(false);
  const studentFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPromoteStudentsModalOpen, setIsPromoteStudentsModalOpen] = useState<boolean>(false);
  const [promoteFromClassId, setPromoteFromClassId] = useState<string>('');
  const [promoteTargetClassId, setPromoteTargetClassId] = useState<string>('');
  const [selectedPromoteStudentIds, setSelectedPromoteStudentIds] = useState<string[]>([]);

  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState<boolean>(false);

  // --- DYNAMIC FORM INPUT STATES ---
  // Schools form
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolAddress, setSchoolAddress] = useState<string>('');
  const [schoolPlan, setSchoolPlan] = useState<SubscriptionPlan>('bulanan');
  const [schoolStatus, setSchoolStatus] = useState<SubscriptionStatus>('aktif');
  const [schoolAdminName, setSchoolAdminName] = useState<string>('');
  const [createdSchoolAdmin, setCreatedSchoolAdmin] = useState<{ schoolName: string; adminName: string; username: string; password: string } | null>(null);
  const [schoolPasswordReset, setSchoolPasswordReset] = useState<{ schoolName: string; adminName: string; username: string; password: string } | null>(null);

  // Pricing plan form (CMS)
  const [planName, setPlanName] = useState<string>('');
  const [planPrice, setPlanPrice] = useState<string>('');
  const [planPeriod, setPlanPeriod] = useState<string>('');
  const [planDescription, setPlanDescription] = useState<string>('');
  const [planFeaturesText, setPlanFeaturesText] = useState<string>('');
  const [planIsHighlighted, setPlanIsHighlighted] = useState<boolean>(false);
  const [planIsActive, setPlanIsActive] = useState<boolean>(true);
  const [planSortOrder, setPlanSortOrder] = useState<string>('0');

  // Site settings form (CMS)
  const [waNumberInput, setWaNumberInput] = useState<string>('');
  const [waMessageInput, setWaMessageInput] = useState<string>('');
  const [settingsSaveLoading, setSettingsSaveLoading] = useState<boolean>(false);

  // Classes form
  const [classNameInput, setClassNameInput] = useState<string>('');

  // Teachers form
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherUsername, setTeacherUsername] = useState<string>('');
  const [teacherPassword, setTeacherPassword] = useState<string>('');
  const [showTeacherPassword, setShowTeacherPassword] = useState<boolean>(false);

  // Students form
  const [studentName, setStudentName] = useState<string>('');
  const [studentNisn, setStudentNisn] = useState<string>('');
  const [studentClassId, setStudentClassId] = useState<string>('');

  // Manual Attendance form
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualStudentSearch, setManualStudentSearch] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('hadir');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Scan Page Manual Attendance
  const [scanManualStudentId, setScanManualStudentId] = useState<string>('');
  const [scanManualStudentSearch, setScanManualStudentSearch] = useState<string>('');
  const [scanManualStatus, setScanManualStatus] = useState<AttendanceStatus>('sakit');

  // --- CHANGE PASSWORD STATES ---
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState<boolean>(false);

  // --- INIT SESSION LOAD ---
  useEffect(() => {
    checkCurrentSession();
  }, [token]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      if (location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/', { replace: true });
      }
      return;
    }

    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!routeTab || routeTab === 'login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthLoading, user, location.pathname, navigate, routeTab]);

  // Load contextual data whenever user role or active tabs change
  useEffect(() => {
    if (user) {
      loadContextData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    setReportLogoUrl(localStorage.getItem(getReportLogoStorageKey()) || '');
  }, [school?.id, user?.schoolId]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }

    if (adminAttendanceClassId === 'all' && classes.length > 0) {
      setAdminAttendanceClassId(classes[0].id);
    }
  }, [user?.role, classes, adminAttendanceClassId]);

  useEffect(() => {
    if (!isPromoteStudentsModalOpen) return;

    const candidateIds = students
      .filter((student) => student.classId === promoteFromClassId)
      .map((student) => student.id);

    setSelectedPromoteStudentIds((current) => {
      const retained = current.filter((id) => candidateIds.includes(id));
      return retained.length > 0 ? retained : candidateIds;
    });

    if (promoteTargetClassId === promoteFromClassId) {
      setPromoteTargetClassId(classes.find((item) => item.id !== promoteFromClassId)?.id || '');
    }
  }, [isPromoteStudentsModalOpen, promoteFromClassId, promoteTargetClassId, students, classes]);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  const handleUploadReportLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('File logo harus berupa gambar.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setReportLogoUploadLoading(true);

    try {
      const response = await globalThis.fetch('https://upload-file.applicationservice.id/api/upload-file', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json() as { status?: number; message?: string; data?: { url?: string } };

      if (!response.ok || data.status !== 200 || !data.data?.url) {
        showToast(data.message || 'Gagal mengunggah logo laporan.', 'error');
        return;
      }

      localStorage.setItem(getReportLogoStorageKey(), data.data.url);
      setReportLogoUrl(data.data.url);
      showToast('Logo laporan berhasil diunggah.');
    } catch {
      showToast('Gagal menghubungi server upload logo.', 'error');
    } finally {
      setReportLogoUploadLoading(false);
    }
  };

  const handleRemoveReportLogo = () => {
    localStorage.removeItem(getReportLogoStorageKey());
    setReportLogoUrl('');
    showToast('Logo laporan dihapus.');
  };

  const getImageDataUrl = async (url: string) => {
    const response = await globalThis.fetch(url);
    if (!response.ok) throw new Error('Failed to load image');
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  };

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // --- REST CLIENT ACTIONS ---

  // Verify current session
  const checkCurrentSession = async () => {
    if (!token) {
      setIsAuthLoading(false);
      setUser(null);
      setSchool(null);
      return;
    }

    try {
      setIsAuthLoading(true);
      const res = await fetch('/api/auth/current', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSchool(data.school);
      } else {
        // Token stale
        localStorage.removeItem('absensi_token');
        setToken(null);
        setUser(null);
        setSchool(null);
      }
    } catch (err) {
      console.error("Session verification error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Log In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('absensi_token', data.token);
        setToken(data.token);
        setUser(data.user);
        // Load target dashboard based on role
        navigate('/dashboard', { replace: true });
        showToast(`Selamat datang kembali, ${data.user.name}!`);
      } else {
        setLoginError(data.error || 'Terjadi kesalahan saat masuk.');
      }
    } catch (err) {
      setLoginError('Koneksi ke server gagal. Pastikan backend aktif.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Log Out
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {
      // Ignored
    }
    localStorage.removeItem('absensi_token');
    setToken(null);
    setUser(null);
    setSchool(null);
    navigate('/login', { replace: true });
    showToast('Anda berhasil keluar dari sistem.', 'success');
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password baru tidak cocok.', 'error');
      return;
    }
    if (newPassword.trim().length < 4) {
      showToast('Password baru minimal harus 4 karakter.', 'error');
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          oldPassword,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Password berhasil diperbarui!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        navigate('/dashboard');
      } else {
        showToast(data.error || 'Gagal mengubah password.', 'error');
      }
    } catch (err) {
      showToast('Koneksi ke server gagal.', 'error');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Context-aware lazy loaded data fetching based on role & screen view
  const loadContextData = async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      // 1. Super Admin View Loading
      if (user.role === 'super_admin') {
        const res = await fetch('/api/superadmin/schools', { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setSchools(data);
        }

        const plansRes = await fetch('/api/superadmin/pricing-plans', { headers: getHeaders() });
        if (plansRes.ok) {
          setPricingPlans(await plansRes.json());
        }

        const settingsRes = await fetch('/api/superadmin/settings', { headers: getHeaders() });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSiteSettings(settingsData);
          setWaNumberInput(settingsData.whatsappNumber || '');
          setWaMessageInput(settingsData.whatsappMessageTemplate || '');
        }
      }

      // 2. School Admin & Teacher View Loading
      if (user.role === 'admin' || user.role === 'teacher') {
        // Fetch Classes
        const classesRes = await fetch('/api/admin/classes', { headers: getHeaders() });
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
        }

        // Fetch Students
        const studentsRes = await fetch('/api/admin/students', { headers: getHeaders() });
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        // Fetch Attendances
        const attendancesRes = await fetch('/api/admin/attendances', { headers: getHeaders() });
        if (attendancesRes.ok) {
          const attendancesData = await attendancesRes.json();
          setAttendances(attendancesData);
        }
      }

      // 3. School Admin specific
      if (user.role === 'admin') {
        const teachersRes = await fetch('/api/admin/teachers', { headers: getHeaders() });
        if (teachersRes.ok) {
          const teachersData = await teachersRes.json();
          setTeachers(teachersData);
        }
      }

      // 4. Guru specific history
      if (user.role === 'teacher') {
        const historyRes = await fetch('/api/teacher/history', { headers: getHeaders() });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistoryToday(historyData);
        }
      }
    } catch (err) {
      console.error("Failed to load context data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // --- CRUD SCHOOLS (Super Admin) ---
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/superadmin/schools', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: schoolName,
          address: schoolAddress,
          subscriptionPlan: schoolPlan,
          adminName: schoolAdminName
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedSchoolAdmin({
          schoolName: data.school?.name || schoolName,
          adminName: data.admin?.name || schoolAdminName,
          username: data.admin?.username || '-',
          password: data.admin?.password || '-'
        });
        setSchoolName('');
        setSchoolAddress('');
        setSchoolAdminName('');
        showToast(`Sekolah ${schoolName} berhasil dibuat. Akun admin digenerate otomatis.`);
        loadContextData();
      } else {
        showToast(data.error || 'Gagal menambahkan sekolah.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/superadmin/schools/${selectedSchool.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: schoolName,
          address: schoolAddress,
          subscriptionPlan: schoolPlan,
          subscriptionStatus: schoolStatus
        })
      });

      if (res.ok) {
        showToast(`Sekolah ${schoolName} berhasil diperbarui!`);
        setIsEditSchoolModalOpen(false);
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal memperbarui sekolah.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetSchoolPassword = async () => {
    if (!selectedSchool) return;
    if (!window.confirm(`Reset password untuk akun admin sekolah ${selectedSchool.name}? Password lama akan langsung diganti.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/superadmin/schools/${selectedSchool.id}/reset-password`, {
        method: 'POST',
        headers: getHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        setSchoolPasswordReset({
          schoolName: data.schoolName || selectedSchool.name,
          adminName: data.admin?.name || '-',
          username: data.admin?.username || '-',
          password: data.admin?.password || '-'
        });
        showToast(`Password admin sekolah ${selectedSchool.name} berhasil direset.`);
      } else {
        showToast(data.error || 'Gagal mereset password sekolah.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!window.confirm('PERINGATAN: Menghapus sekolah ini akan menghapus SELURUH data kelas, guru, siswa, dan riwayat absensi di dalamnya secara permanen. Apakah Anda yakin?')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/superadmin/schools/${schoolId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        showToast('Sekolah berhasil dihapus beserta seluruh datanya.');
        loadContextData();
      } else {
        showToast('Gagal menghapus sekolah.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- CRUD PRICING PLANS & SETTINGS (Super Admin CMS) ---
  const parseFeaturesText = (text: string): string[] =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const openAddPlanModal = () => {
    setPlanName('');
    setPlanPrice('');
    setPlanPeriod('');
    setPlanDescription('');
    setPlanFeaturesText('');
    setPlanIsHighlighted(false);
    setPlanIsActive(true);
    setPlanSortOrder(String(pricingPlans.length + 1));
    setIsAddPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanPeriod(plan.period);
    setPlanDescription(plan.description);
    setPlanFeaturesText(plan.features.join('\n'));
    setPlanIsHighlighted(plan.isHighlighted);
    setPlanIsActive(plan.isActive);
    setPlanSortOrder(String(plan.sortOrder));
    setIsEditPlanModalOpen(true);
  };

  const handleAddPricingPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/superadmin/pricing-plans', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: planName,
          price: planPrice,
          period: planPeriod,
          description: planDescription,
          features: parseFeaturesText(planFeaturesText),
          isHighlighted: planIsHighlighted,
          isActive: planIsActive,
          sortOrder: Number(planSortOrder) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Paket ${planName} berhasil ditambahkan.`);
        setIsAddPlanModalOpen(false);
        loadContextData();
      } else {
        showToast(data.error || 'Gagal menambahkan paket.', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPricingPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/superadmin/pricing-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: planName,
          price: planPrice,
          period: planPeriod,
          description: planDescription,
          features: parseFeaturesText(planFeaturesText),
          isHighlighted: planIsHighlighted,
          isActive: planIsActive,
          sortOrder: Number(planSortOrder) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Paket ${planName} berhasil diperbarui.`);
        setIsEditPlanModalOpen(false);
        loadContextData();
      } else {
        showToast(data.error || 'Gagal memperbarui paket.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePricingPlan = async (planId: string, planName: string) => {
    if (!window.confirm(`Hapus paket "${planName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/superadmin/pricing-plans/${planId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (res.ok) {
        showToast('Paket berhasil dihapus.');
        loadContextData();
      } else {
        showToast('Gagal menghapus paket.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaveLoading(true);
    try {
      const res = await fetch('/api/superadmin/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          whatsappNumber: waNumberInput,
          whatsappMessageTemplate: waMessageInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSiteSettings(data);
        showToast('Kontak WhatsApp berhasil diperbarui.');
      } else {
        showToast(data.error || 'Gagal menyimpan pengaturan.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setSettingsSaveLoading(false);
    }
  };

  // --- CRUD CLASSES (School Admin) ---
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: classNameInput })
      });

      if (res.ok) {
        showToast(`Kelas ${classNameInput} berhasil ditambahkan!`);
        setIsAddClassModalOpen(false);
        setClassNameInput('');
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menambahkan kelas.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: classNameInput })
      });

      if (res.ok) {
        showToast(`Kelas berhasil diperbarui menjadi ${classNameInput}!`);
        setIsEditClassModalOpen(false);
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal memperbarui kelas.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('Menghapus kelas akan menghapus semua siswa di kelas tersebut. Lanjutkan?')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        showToast('Kelas dan siswa di dalamnya berhasil dihapus.');
        loadContextData();
      } else {
        showToast('Gagal menghapus kelas.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- CRUD TEACHERS (School Admin) ---
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: teacherName
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Akun Guru ${teacherName} berhasil dibuat!`);
        if (data) {
          setViewingTeacher(data);
        }
        setIsAddTeacherModalOpen(false);
        setTeacherName('');
        setTeacherUsername('');
        setTeacherPassword('');
        loadContextData();
      } else {
        showToast(data.error || 'Gagal menambahkan guru.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportTeacherExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setTeacherImportLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        showToast('File Excel tidak memiliki sheet.', 'error');
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const matrix = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
      if (matrix.length === 0) {
        showToast('File Excel kosong.', 'error');
        return;
      }

      const header = (matrix[0] || []).map((cell) => String(cell).trim().toLowerCase());
      const nameColumn = header.findIndex((cell) => ['nama', 'name', 'nama guru', 'guru', 'teacher'].includes(cell));
      const rows = nameColumn >= 0 ? matrix.slice(1) : matrix;
      const names = rows
        .map((row) => String(row[nameColumn >= 0 ? nameColumn : 0] ?? '').trim())
        .filter((name) => name.length > 0);

      if (names.length === 0) {
        showToast('Tidak ada nama guru yang bisa dibaca dari Excel.', 'error');
        return;
      }

      const res = await fetch('/api/admin/teachers/import', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ names })
      });
      const data = await res.json();
      if (res.ok) {
        const totalCreated = data.totalCreated ?? 0;
        showToast(`${totalCreated} guru berhasil diimpor dari Excel.`, totalCreated > 0 ? 'success' : 'warning');
        await loadContextData();
      } else {
        showToast(data.error || 'Gagal impor data guru.', 'error');
      }
    } catch (error) {
      showToast('Gagal membaca file Excel.', 'error');
    } finally {
      setTeacherImportLoading(false);
    }
  };

  const handleDownloadTeacherTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const rows = [
      ['Nama Guru'],
      ['Contoh: Dra. Herlina Siregar'],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Template Guru');
    XLSX.writeFile(workbook, 'template_import_guru.xlsx');
  };

  const handleDownloadTeachersPdf = async () => {
    if (teachers.length === 0) {
      showToast('Belum ada data guru untuk diunduh.', 'error');
      return;
    }

    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const dateLabel = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(`Daftar Kredensial Guru - ${school?.name || 'Sekolah'}`, 14, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Tanggal cetak: ${dateLabel}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['No', 'Nama Guru', 'Username', 'Password Awal']],
      body: teachers.map((teacher, index) => [
        String(index + 1),
        teacher.name,
        teacher.username,
        teacher.initialPassword || '-',
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [79, 70, 229],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save(`kredensial_guru_${school?.name?.replace(/\s+/g, '_') || 'sekolah'}.pdf`);
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/teachers/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: teacherName,
          password: teacherPassword || undefined // Only reset if entered
        })
      });

      if (res.ok) {
        showToast(`Data Guru ${teacherName} berhasil diperbarui!`);
        setIsEditTeacherModalOpen(false);
        setTeacherPassword('');
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal memperbarui guru.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm('Hapus akun guru ini?')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        showToast('Akun guru berhasil dihapus.');
        loadContextData();
      } else {
        showToast('Gagal menghapus guru.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- CRUD STUDENTS (School Admin) ---
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: studentName,
          nisn: studentNisn,
          classId: studentClassId
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Siswa ${studentName} berhasil ditambahkan! QR Code dibuat secara otomatis.`);
        if (data) {
          setViewingStudent(data);
        }
        setIsAddStudentModalOpen(false);
        setStudentName('');
        setStudentNisn('');
        setStudentClassId('');
        loadContextData();
      } else {
        showToast(data.error || 'Gagal menambahkan siswa.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: studentName,
          nisn: studentNisn,
          classId: studentClassId
        })
      });

      if (res.ok) {
        showToast(`Data siswa ${studentName} berhasil diperbarui!`);
        setIsEditStudentModalOpen(false);
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal memperbarui siswa.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Hapus siswa ini? Seluruh riwayat absensi siswa akan ikut terhapus.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        showToast('Siswa berhasil dihapus.');
        loadContextData();
      } else {
        showToast('Gagal menghapus siswa.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadStudentTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const rows = [
      ['Nama Siswa', 'Kelas', 'NISN'],
      ['Contoh: Aditya Pratama', 'Kelas X-A', '0012345678'],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'template_import_siswa.xlsx');
  };

  const getExcelValue = (row: Record<string, unknown>, aliases: string[]) => {
    const normalizedAliases = aliases.map((alias) => alias.toLowerCase().replace(/\s+/g, ''));
    const match = Object.entries(row).find(([key]) => normalizedAliases.includes(key.toLowerCase().replace(/\s+/g, '')));
    return match ? String(match[1] ?? '').trim() : '';
  };

  const handleImportStudentExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setStudentImportLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        showToast('File Excel tidak memiliki sheet.', 'error');
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      if (rows.length === 0) {
        showToast('File Excel kosong.', 'error');
        return;
      }

      const payload = rows.map((row) => ({
        name: getExcelValue(row, ['Nama Siswa', 'Nama', 'Name']),
        className: getExcelValue(row, ['Kelas', 'Nama Kelas', 'Class Name', 'Class', 'Rombel']),
        nisn: getExcelValue(row, ['NISN', 'Nisn', 'Nomor NISN', 'No NISN']),
      })).filter((row) => row.name && row.className && row.nisn);

      if (payload.length === 0) {
        showToast('Data siswa tidak terbaca. Pastikan kolom Nama Siswa, Kelas, dan NISN terisi.', 'error');
        return;
      }

      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ students: payload })
      });
      const data = await res.json();
      if (res.ok) {
        const totalCreated = data.totalCreated ?? 0;
        const totalSkipped = data.totalSkipped ?? 0;
        const firstSkippedReason = Array.isArray(data.skipped) && data.skipped.length > 0 ? ` Contoh gagal: ${data.skipped[0].reason}.` : '';
        showToast(`${totalCreated} siswa berhasil diimpor. ${totalSkipped} dilewati.${firstSkippedReason}`, totalCreated > 0 ? 'success' : 'warning');
        await loadContextData();
      } else {
        showToast(data.error || 'Gagal impor data siswa.', 'error');
      }
    } catch (error) {
      showToast('Gagal membaca file Excel.', 'error');
    } finally {
      setStudentImportLoading(false);
    }
  };

  const handlePrintStudentQRCards = async (list: StudentWithClass[]) => {
    if (list.length === 0) {
      showToast('Tidak ada siswa untuk dicetak.', 'error');
      return;
    }

    const cards = await Promise.all(
      list.map(async (student) => {
        const qrDataUrl = await QRCode.toDataURL(student.qrCode, {
          width: 220,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#ffffff',
          },
        });
        return { student, qrDataUrl };
      })
    );

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardHtml = cards.map(({ student, qrDataUrl }) => `
      <div class="card">
        <div class="accent"></div>
        <div class="inner">
          <div class="left">
            <div>
              <div class="school">${school?.name || 'ABSENSI PREMIUM'}</div>
              <div class="title">Kartu Nama QR Siswa</div>
            </div>
            <div class="content">
              <div class="name">${student.name}</div>
              <div class="meta">
                <span class="pill">NISN ${student.nisn}</span>
                <span class="pill blue">${student.className}</span>
              </div>
            </div>
            <div class="footer">
              <span>Absensi Digital</span>
              <span>Scan saat masuk sekolah</span>
            </div>
          </div>
          <div class="right">
            <img class="qr-image" src="${qrDataUrl}" alt="QR Code ${student.name}" />
            <div class="scan-label">SCAN</div>
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak QR Siswa</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f8fafc;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .card {
              width: 92mm;
              height: 54mm;
              border-radius: 12px;
              overflow: hidden;
              background: white;
              box-shadow: 0 8px 25px rgba(15, 23, 42, 0.12);
              border: 1px solid #dbe4f0;
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
            .content {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .right {
              width: 24mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 4px;
              flex-shrink: 0;
              border-left: 1px solid #e2e8f0;
              padding-left: 10px;
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
              word-break: break-word;
            }
            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
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
              justify-content: space-between;
              gap: 6px;
              margin-top: 2px;
              font-size: 8px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 5px;
            }
            .scan-label {
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 0.18em;
              color: #94a3b8;
            }
            @media print {
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="grid">${cardHtml}</div>
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

  const getPromoteStudentCandidates = () =>
    students.filter((student) => student.classId === promoteFromClassId);

  const openPromoteStudentsModal = () => {
    const defaultFromClassId = filterClass !== 'all' ? filterClass : classes[0]?.id || '';
    const defaultTargetClassId = classes.find((item) => item.id !== defaultFromClassId)?.id || '';
    setPromoteFromClassId(defaultFromClassId);
    setPromoteTargetClassId(defaultTargetClassId);
    setSelectedPromoteStudentIds(students.filter((student) => student.classId === defaultFromClassId).map((student) => student.id));
    setIsPromoteStudentsModalOpen(true);
  };

  const handlePromoteStudents = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promoteFromClassId || !promoteTargetClassId) {
      showToast('Pilih kelas asal dan kelas tujuan.', 'error');
      return;
    }

    if (promoteFromClassId === promoteTargetClassId) {
      showToast('Kelas tujuan harus berbeda dari kelas asal.', 'error');
      return;
    }

    if (selectedPromoteStudentIds.length === 0) {
      showToast('Pilih minimal satu siswa untuk dinaikkan kelas.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/students/promote', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fromClassId: promoteFromClassId,
          targetClassId: promoteTargetClassId,
          studentIds: selectedPromoteStudentIds,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(`${data.totalPromoted || selectedPromoteStudentIds.length} siswa dipindahkan dari ${data.fromClassName} ke ${data.targetClassName}.`);
        setIsPromoteStudentsModalOpen(false);
        setSelectedPromoteStudentIds([]);
        await loadContextData();
      } else {
        showToast(data.error || 'Gagal memproses kenaikan kelas.', 'error');
      }
    } catch {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- MANUAL ATTENDANCE & SCAN HANDLING ---
  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/attendances', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: manualStudentId,
          status: manualStatus,
          date: manualDate
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.duplicate) {
          showToast(data.message || 'Siswa ini sudah absen hari ini.', 'warning');
        } else {
          showToast(data.message || 'Absensi manual berhasil dicatat!');
        }
        setIsManualAttendanceModalOpen(false);
        setManualStudentId('');
        setManualStudentSearch('');
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan absensi.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Recording absent students (Sakit / Izin / Alfa) manually from Scan view
  const handleScanManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanManualStudentId) {
      showToast('Pilih siswa terlebih dahulu.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/admin/attendances', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: scanManualStudentId,
          status: scanManualStatus,
          date: todayStr
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.duplicate) {
          showToast(data.message || 'Siswa ini sudah absen hari ini.', 'warning');
        } else {
          showToast(data.message || 'Ketidakhadiran siswa berhasil dicatat!');
        }
        setScanManualStudentId('');
        setScanManualStudentSearch('');
        loadContextData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Gagal menyimpan absensi.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!window.confirm('Hapus catatan absensi ini?')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/attendances/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (res.ok) {
        showToast('Catatan absensi berhasil dihapus.');
        loadContextData();
      } else {
        showToast('Gagal menghapus absensi.', 'error');
      }
    } catch (e) {
      showToast('Koneksi terputus.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Called when QR Scanner successfully reads a code
  const handleQRScanSuccess = async (qrCode: string, status: 'hadir' | 'sakit' | 'izin' | 'alfa') => {
    const res = await fetch('/api/teacher/scan', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ qrCode, status })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Scan gagal.');
    }

    if (data.duplicate) {
      return {
        duplicate: true,
        message: data.message || 'Siswa ini sudah absen hari ini.',
      };
    }

    // Refresh today's scan list
    loadContextData();
    return {
      duplicate: false,
      message: data.message || 'Absensi berhasil dicatat.',
    };
  };

  // --- RENDERING HELPERS & DATA GETTERS ---

  // Get current attendance statistics
  const getAttendanceStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(`${todayStr}T00:00:00`);
    const isTodayNonAttendanceDay = today.getDay() === 0 || today.getDay() === 6 || !!getNationalCalendarDay(todayStr);
    const todayLogs = attendances.filter(a => a.date === todayStr);
    const totalSiswa = students.length;

    const hadir = todayLogs.filter(l => l.status === 'hadir').length;
    const sakit = todayLogs.filter(l => l.status === 'sakit').length;
    const izin = todayLogs.filter(l => l.status === 'izin').length;
    const alfa = isTodayNonAttendanceDay ? 0 : totalSiswa - hadir - sakit - izin; // Non-attendance days are not counted as Alfa.

    const presentPercentage = totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 0;

    return {
      total: totalSiswa,
      hadir,
      sakit,
      izin,
      alfa: Math.max(0, alfa),
      persen: presentPercentage
    };
  };

  // Filter students based on Class and Search Text
  const getFilteredStudents = () => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
      const matchClass = filterClass === 'all' || s.classId === filterClass;
      return matchSearch && matchClass;
    });
  };

  // Filter attendance logs based on Class, Status, Date/Semester, and Search
  const getFilteredAttendances = () => {
    return attendances.filter(a => {
      const matchSearch = a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || a.nisn.includes(searchTerm);
      const matchClass = filterClass === 'all' || a.classId === filterClass;
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      
      let matchTime = true;
      if (filterPeriod === 'harian') {
        matchTime = !filterDate || a.date === filterDate;
      } else {
        const parts = a.date.split('-');
        if (parts.length === 3) {
          const logYear = parts[0];
          const logMonth = parseInt(parts[1], 10);
          const matchYear = filterYear === 'all' || logYear === filterYear;
          
          let matchMonth = true;
          if (filterPeriod === 'ganjil') {
            matchMonth = logMonth >= 7 && logMonth <= 12; // July to December
          } else if (filterPeriod === 'genap') {
            matchMonth = logMonth >= 1 && logMonth <= 6; // January to June
          }
          
          matchTime = matchYear && matchMonth;
        } else {
          matchTime = false;
        }
      }
      return matchSearch && matchClass && matchStatus && matchTime;
    });
  };

  // Generate aggregated summary per student (counts of Hadir, Sakit, Izin, Alfa)
  const getRecapByStudent = () => {
    // Get matching students based on class & search
    const filteredStudents = getFilteredStudents();

    // Get matching logs for the chosen time range (excluding individual status filter to count all statuses)
    const logsForPeriod = attendances.filter(a => {
      let matchTime = true;
      if (filterPeriod === 'harian') {
        matchTime = !filterDate || a.date === filterDate;
      } else {
        const parts = a.date.split('-');
        if (parts.length === 3) {
          const logYear = parts[0];
          const logMonth = parseInt(parts[1], 10);
          const matchYear = filterYear === 'all' || logYear === filterYear;

          let matchMonth = true;
          if (filterPeriod === 'ganjil') {
            matchMonth = logMonth >= 7 && logMonth <= 12; // July to December
          } else if (filterPeriod === 'genap') {
            matchMonth = logMonth >= 1 && logMonth <= 6; // January to June
          }

          matchTime = matchYear && matchMonth;
        } else {
          matchTime = false;
        }
      }
      return matchTime;
    });

    return filteredStudents.map(student => {
      const studentLogs = logsForPeriod.filter(l => l.studentId === student.id);
      const hadir = studentLogs.filter(l => l.status === 'hadir').length;
      const sakit = studentLogs.filter(l => l.status === 'sakit').length;
      const izin = studentLogs.filter(l => l.status === 'izin').length;
      const alfa = studentLogs.filter(l => l.status === 'alfa').length;

      const total = hadir + sakit + izin + alfa;
      const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        nisn: student.nisn,
        className: student.className,
        hadir,
        sakit,
        izin,
        alfa,
        total,
        persentase
      };
    }).filter(item => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'hadir') return item.hadir > 0;
        if (filterStatus === 'sakit') return item.sakit > 0;
        if (filterStatus === 'izin') return item.izin > 0;
        if (filterStatus === 'alfa') return item.alfa > 0;
      }
      return true;
    });
  };

  const pad2 = (value: number) => String(value).padStart(2, '0');

  const getMonthLabel = (year: number, monthIndex: number) =>
    new Date(year, monthIndex, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const getDateLabel = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (!date || Number.isNaN(parsedDate.getTime())) return '-';
    return parsedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getNationalCalendarDay = (date: string) => NATIONAL_CALENDAR_DAYS[date] || null;

  const getAttendanceDay = (year: number, monthIndex: number, day: number) => {
    const date = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
    const parsedDate = new Date(year, monthIndex, day);
    const weekday = parsedDate.getDay();
    const nationalDay = getNationalCalendarDay(date);
    const isWeekend = weekday === 0 || weekday === 6;

    return {
      day,
      date,
      weekday,
      weekdayLabel: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][weekday],
      monthShort: parsedDate.toLocaleDateString('id-ID', { month: 'short' }),
      isWeekend,
      nationalDay,
      isNationalHoliday: !!nationalDay,
      isNonAttendanceDay: isWeekend || !!nationalDay,
      nonAttendanceReason: nationalDay?.name || (isWeekend ? 'Akhir pekan' : ''),
    };
  };

  const getMonthDays = (year: number, monthIndex: number) => {
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      return getAttendanceDay(year, monthIndex, day);
    });
  };

  const getDateRangeDays = (startDate: string, endDate: string) => {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return [];
    }

    const from = start <= end ? start : end;
    const to = start <= end ? end : start;
    const days = [];

    for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
      const year = cursor.getFullYear();
      const monthIndex = cursor.getMonth();
      const day = cursor.getDate();
      days.push(getAttendanceDay(year, monthIndex, day));
    }

    return days;
  };

  const getAttendancePeriodDays = () => {
    if (attendancePeriodMode === 'range') {
      return getDateRangeDays(attendanceRangeStartDate, attendanceRangeEndDate);
    }

    return getMonthDays(Number(adminAttendanceYear), Number(adminAttendanceMonth));
  };

  const getAttendancePeriodLabel = () => {
    if (attendancePeriodMode === 'range') {
      return `${getDateLabel(attendanceRangeStartDate)} - ${getDateLabel(attendanceRangeEndDate)}`;
    }

    return getMonthLabel(Number(adminAttendanceYear), Number(adminAttendanceMonth));
  };

  const getMonthlyAttendanceStatus = (studentId: string, date: string) => {
    const log = attendances.find((item) => item.studentId === studentId && item.date === date);
    return log?.status || null;
  };

  const getMonthlyAttendanceStudents = () => {
    return students.filter((student) => {
      const matchClass = adminAttendanceClassId === 'all' || student.classId === adminAttendanceClassId;
      return matchClass;
    });
  };

  const getMonthlyAttendanceRows = () => {
    const days = getAttendancePeriodDays();
    const studentsInScope = getMonthlyAttendanceStudents();

    return studentsInScope.map((student, index) => {
      const dayStatuses = days.map((day) => getMonthlyAttendanceStatus(student.id, day.date));
      const attendanceDayStatuses = dayStatuses.filter((_, dayIndex) => !days[dayIndex].isNonAttendanceDay);
      const hadir = attendanceDayStatuses.filter((status) => status === 'hadir').length;
      const sakit = attendanceDayStatuses.filter((status) => status === 'sakit').length;
      const izin = attendanceDayStatuses.filter((status) => status === 'izin').length;
      const alfa = attendanceDayStatuses.filter((status) => status === 'alfa').length;

      return {
        index: index + 1,
        student,
        dayStatuses,
        hadir,
        sakit,
        izin,
        alfa,
        total: hadir,
      };
    });
  };

  const handleDownloadAttendancePdf = async () => {
    const rows = getMonthlyAttendanceRows();
    if (rows.length === 0) {
      showToast('Tidak ada data absensi untuk diunduh.', 'error');
      return;
    }

    const days = getAttendancePeriodDays();
    if (days.length === 0) {
      showToast('Periode tanggal tidak valid.', 'error');
      return;
    }

    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 12;
    const periodLabel = getAttendancePeriodLabel();
    const selectedClassName = adminAttendanceClassId === 'all'
      ? 'Semua Kelas'
      : classes.find((item) => item.id === adminAttendanceClassId)?.name || 'Semua Kelas';
    const printedAt = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const effectiveDays = days.filter((day) => !day.isNonAttendanceDay).length;
    const nonAttendanceDays = days.length - effectiveDays;
    const filePeriod = periodLabel.replace(/\s+/g, '_').replace(/[^\w-]/g, '').toLowerCase();
    const statusCode = (status: AttendanceStatus | null) => {
      if (status === 'hadir') return 'H';
      if (status === 'sakit') return 'S';
      if (status === 'izin') return 'I';
      if (status === 'alfa') return 'A';
      return '-';
    };
    const totals = rows.reduce(
      (acc, row) => {
        acc.hadir += row.hadir;
        acc.sakit += row.sakit;
        acc.izin += row.izin;
        acc.alfa += row.alfa;
        return acc;
      },
      { hadir: 0, sakit: 0, izin: 0, alfa: 0 }
    );

    const waliKelasName = user?.role === 'teacher' ? user.name : '-';
    const printedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const cityLabel = (school?.address || '').split(',').map((item) => item.trim()).filter(Boolean).slice(-2, -1)[0] || 'Sekolah';
    let reportLogoDataUrl: string | null = null;

    if (reportLogoUrl) {
      try {
        reportLogoDataUrl = await getImageDataUrl(reportLogoUrl);
      } catch {
        reportLogoDataUrl = null;
      }
    }

    const drawSchoolLetterhead = () => {
      doc.setTextColor(15, 23, 42);
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      if (reportLogoDataUrl) {
        const imageType = reportLogoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(reportLogoDataUrl, imageType, 14, 7, 23, 23);
      } else {
        doc.circle(25, 18, 10, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('SP', 25, 21, { align: 'center' });
      }
      doc.setFontSize(18);
      doc.text((school?.name || 'NAMA SEKOLAH').toUpperCase(), 42, 14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(school?.address || 'Alamat sekolah belum tersedia', 42, 20);
      doc.text('Sistem Absensi Digital | Administrasi Guru Premium', 42, 25);
      doc.setLineWidth(0.7);
      doc.line(marginX, 32, pageWidth - marginX, 32);
      doc.setLineWidth(0.25);
      doc.line(marginX, 34, pageWidth - marginX, 34);
    };

    const drawReportTitle = (title: string, subtitle: string) => {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });
      doc.setFontSize(12);
      doc.text(subtitle.toUpperCase(), pageWidth / 2, 52, { align: 'center' });
    };

    const drawPdfPageNumbers = () => {
      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(`Halaman ${page} dari ${pageCount}`, pageWidth - marginX, pageHeight - 6, { align: 'right' });
      }
    };

    const drawReportInfo = (startY: number, periodCaption: string, periodValue: string) => {
      const infoRows = [
        ['Kelas', selectedClassName],
        ['Wali Kelas', waliKelasName],
        ['Jumlah Siswa', `${rows.length} Siswa`],
        [periodCaption, periodValue],
      ];

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      infoRows.forEach((item, index) => {
        const y = startY + index * 6;
        doc.setFont('helvetica', 'normal');
        doc.text(item[0], marginX, y);
        doc.text(':', marginX + 33, y);
        doc.setFont('helvetica', 'bold');
        doc.text(item[1], marginX + 38, y);
      });
    };

    const drawLegendAndSignatures = (startY: number, includeLibur = true) => {
      if (startY > pageHeight - 48) {
        doc.addPage();
        drawSchoolLetterhead();
        startY = 44;
      }

      const safeY = startY;
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.2);
      doc.rect(marginX, safeY, 74, 34);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Keterangan:', marginX + 3, safeY + 6);
      const legends = [
        ['H', 'Hadir', [22, 101, 52]],
        ['A', 'Alfa', [185, 28, 28]],
        ['S', 'Sakit', [217, 119, 6]],
        ['I', 'Izin', [37, 99, 235]],
        ...(includeLibur
          ? [
              ['L', 'Libur / Cuti Bersama', [185, 28, 28]],
              ['-', 'Tidak Ada Data', [100, 116, 139]],
            ] as const
          : []),
      ] as Array<readonly [string, string, readonly [number, number, number]]>;

      legends.forEach((item, index) => {
        const y = safeY + 12 + index * 4.2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(item[2][0], item[2][1], item[2][2]);
        doc.text(item[0], marginX + 3, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        doc.text(`: ${item[1]}`, marginX + 10, y);
      });

      const leftX = pageWidth - 150;
      const rightX = pageWidth - 75;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Mengetahui,', leftX, safeY + 8, { align: 'center' });
      doc.text('Kepala Sekolah', leftX, safeY + 14, { align: 'center' });
      doc.text(`${cityLabel}, ${printedDate}`, rightX, safeY + 8, { align: 'center' });
      doc.text('Wali Kelas', rightX, safeY + 14, { align: 'center' });
      doc.setDrawColor(148, 163, 184);
      doc.line(leftX - 22, safeY + 27, leftX + 22, safeY + 27);
      doc.line(rightX - 22, safeY + 27, rightX + 22, safeY + 27);
      doc.setFont('helvetica', 'bold');
      doc.text('Kepala Sekolah', leftX, safeY + 32, { align: 'center' });
      doc.text(waliKelasName === '-' ? 'Wali Kelas' : waliKelasName, rightX, safeY + 32, { align: 'center' });
    };

    const getAttendanceQuality = (percentage: number) => {
      if (percentage >= 90) return 'Baik Sekali';
      if (percentage >= 80) return 'Baik';
      if (percentage >= 70) return 'Cukup';
      return 'Perlu Pembinaan';
    };

    const getSummaryBody = () => rows.map((row) => {
        const recordedTotal = row.hadir + row.sakit + row.izin + row.alfa;
        const percentage = recordedTotal > 0 ? Math.round((row.hadir / recordedTotal) * 100) : 0;
        return [
          String(row.index),
          row.student.name,
          row.student.nisn,
          row.student.className,
          String(row.hadir),
          String(row.sakit),
          String(row.izin),
          String(row.alfa),
          `${percentage}%`,
        ];
      });

    if (attendancePeriodMode === 'month') {
      drawSchoolLetterhead();
      drawReportTitle('REKAP ABSENSI SISWA (HARIAN)', periodLabel);
      drawReportInfo(62, 'Bulan / Tahun', periodLabel);

      autoTable(doc, {
        startY: 86,
        margin: { left: marginX, right: marginX },
        head: [
          [
            { content: 'No', rowSpan: 2, styles: { valign: 'middle' } },
            { content: 'Nama Siswa', rowSpan: 2, styles: { valign: 'middle' } },
            { content: 'Tanggal', colSpan: days.length, styles: { halign: 'center' } },
            { content: 'Total\nHadir', rowSpan: 2, styles: { valign: 'middle' } },
          ],
          days.map((day) => `${day.day}\n${day.weekdayLabel}`),
        ],
        body: rows.map((row) => [
          String(row.index),
          row.student.name,
          ...days.map((day, dayIndex) => day.isNonAttendanceDay ? 'L' : statusCode(row.dayStatuses[dayIndex])),
          String(row.hadir),
        ]),
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 1.2,
          lineColor: [71, 85, 105],
          lineWidth: 0.15,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [252, 252, 253],
        },
        columnStyles: {
          0: { cellWidth: 9, halign: 'center' },
          1: { cellWidth: 45 },
          [days.length + 2]: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
        },
        didParseCell: (data) => {
          if (data.section === 'head' && data.row.index === 1) {
            const day = days[data.column.index];
            if (day?.isNonAttendanceDay) {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
            }
          }

          if (data.section !== 'body' || data.column.index < 2 || data.column.index > days.length + 1) return;
          const value = String(data.cell.raw || '');
          data.cell.styles.halign = 'center';
          data.cell.styles.fontStyle = 'bold';
          if (value === 'H') data.cell.styles.textColor = [22, 101, 52];
          if (value === 'S') data.cell.styles.textColor = [217, 119, 6];
          if (value === 'I') data.cell.styles.textColor = [37, 99, 235];
          if (value === 'A') data.cell.styles.textColor = [185, 28, 28];
          if (value === 'L') {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fillColor = [254, 242, 242];
          }
          if (value === '-') data.cell.styles.textColor = [100, 116, 139];
        },
      });

      drawLegendAndSignatures((doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 155);
      drawPdfPageNumbers();
      doc.save(`rekap_absensi_bulanan_${filePeriod}.pdf`);
      return;
    }

    const rangeStartLabel = days[0] ? getDateLabel(days[0].date) : '-';
    const rangeEndLabel = days[days.length - 1] ? getDateLabel(days[days.length - 1].date) : '-';
    const rangeCaption = `${rangeStartLabel} s.d. ${rangeEndLabel}`;
    const averagePercentage = rows.length > 0
      ? Math.round(
          rows.reduce((sum, row) => {
            const recordedTotal = row.hadir + row.sakit + row.izin + row.alfa;
            return sum + (recordedTotal > 0 ? (row.hadir / recordedTotal) * 100 : 0);
          }, 0) / rows.length
        )
      : 0;

    drawSchoolLetterhead();
    drawReportTitle('REKAP ABSENSI SISWA (PER SEMESTER)', `Periode ${rangeCaption}`);
    drawReportInfo(62, 'Periode', rangeCaption);

    autoTable(doc, {
      startY: 95,
      margin: { left: marginX, right: marginX },
      head: [
        [
          { content: 'No', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Nama Siswa', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Jumlah Kehadiran', colSpan: 4, styles: { halign: 'center' } },
          { content: 'Total Hari\n(Aktif Sekolah)', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Persentase\nKehadiran (%)', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'Keterangan', rowSpan: 2, styles: { valign: 'middle' } },
        ],
        ['Hadir', 'Alfa', 'Sakit', 'Izin'],
      ],
      body: rows.map((row) => {
        const recordedTotal = row.hadir + row.sakit + row.izin + row.alfa;
        const percentage = recordedTotal > 0 ? Math.round((row.hadir / recordedTotal) * 100) : 0;
        return [
          String(row.index),
          row.student.name,
          String(row.hadir),
          String(row.alfa),
          String(row.sakit),
          String(row.izin),
          String(recordedTotal),
          `${percentage}%`,
          getAttendanceQuality(percentage),
        ];
      }),
      foot: [[
        { content: 'TOTAL / RATA-RATA', colSpan: 2, styles: { halign: 'center' } },
        String(totals.hadir),
        String(totals.alfa),
        String(totals.sakit),
        String(totals.izin),
        String(totals.hadir + totals.alfa + totals.sakit + totals.izin),
        `${averagePercentage}%`,
        '-',
      ]],
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1.7,
        lineColor: [71, 85, 105],
        lineWidth: 0.15,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [239, 246, 255],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      footStyles: {
        fillColor: [239, 246, 255],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 11 },
        1: { cellWidth: 64 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center', cellWidth: 33 },
      },
    });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Catatan: Total Hari (Aktif Sekolah) adalah jumlah hari efektif dalam periode yang dipilih.', marginX, pageHeight - 12);
    drawLegendAndSignatures((doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 160, false);
    drawPdfPageNumbers();
    doc.save(`rekap_absensi_semester_${filePeriod}.pdf`);
  };

  const renderMonthlyAttendanceView = () => {
    const days = getAttendancePeriodDays();
    const rows = getMonthlyAttendanceRows();
    const periodLabel = getAttendancePeriodLabel();
    const effectiveDays = days.filter((day) => !day.isNonAttendanceDay).length;
    const nonAttendanceDays = days.length - effectiveDays;
    const className = adminAttendanceClassId === 'all'
      ? 'Semua Kelas'
      : classes.find((item) => item.id === adminAttendanceClassId)?.name || 'Semua Kelas';

    const totals = rows.reduce(
      (acc, row) => {
        acc.hadir += row.hadir;
        acc.sakit += row.sakit;
        acc.izin += row.izin;
        acc.alfa += row.alfa;
        return acc;
      },
      { hadir: 0, sakit: 0, izin: 0, alfa: 0 }
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5 no-print">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold font-display text-slate-800">Rekap Absensi</h3>
              <p className="text-xs text-slate-500 mt-1">
                Rekap absensi siswa ditampilkan per tanggal sesuai bulan atau rentang tanggal yang dipilih.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                ref={reportLogoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadReportLogo}
                id="report-logo-upload-input"
              />
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                  {reportLogoUrl ? (
                    <img src={reportLogoUrl} alt="Logo laporan" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs font-black text-slate-500">SP</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Logo PDF</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reportLogoInputRef.current?.click()}
                      disabled={reportLogoUploadLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 disabled:text-slate-400"
                      id="btn-upload-report-logo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {reportLogoUploadLoading ? 'Mengunggah...' : reportLogoUrl ? 'Ganti' : 'Upload'}
                    </button>
                    {reportLogoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveReportLogo}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        id="btn-remove-report-logo"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadAttendancePdf}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
                id="btn-download-monthly-attendance"
              >
                <Download className="w-4 h-4" />
                Unduh PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Jenis Rekap</label>
              <select
                value={attendancePeriodMode}
                onChange={(e) => setAttendancePeriodMode(e.target.value as 'month' | 'range')}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-indigo-500"
                id="attendance-period-mode"
              >
                <option value="month">Bulanan</option>
                <option value="range">Rentang Tanggal</option>
              </select>
            </div>

            {attendancePeriodMode === 'month' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bulan</label>
                  <select
                    value={String(adminAttendanceMonth)}
                    onChange={(e) => {
                      setAdminAttendanceMonth(Number(e.target.value));
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-indigo-500"
                    id="admin-attendance-month"
                  >
                    {Array.from({ length: 12 }, (_, index) => {
                      return (
                        <option key={index} value={index}>
                          {getMonthLabel(Number(adminAttendanceYear), index).split(' ')[0]}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tahun</label>
                  <select
                    value={adminAttendanceYear}
                    onChange={(e) => setAdminAttendanceYear(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-indigo-500"
                    id="admin-attendance-year"
                  >
                    {Array.from({ length: 7 }, (_, index) => {
                      const yearValue = String(new Date().getFullYear() - 3 + index);
                      return (
                        <option key={yearValue} value={yearValue}>
                          {yearValue}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={attendanceRangeStartDate}
                    onChange={(e) => setAttendanceRangeStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-indigo-500"
                    id="attendance-range-start"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={attendanceRangeEndDate}
                    onChange={(e) => setAttendanceRangeEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-indigo-500"
                    id="attendance-range-end"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kelas</label>
              <select
                value={adminAttendanceClassId}
                onChange={(e) => setAdminAttendanceClassId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-indigo-500"
                id="admin-attendance-class"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:justify-self-end text-sm text-slate-500 font-medium">
              {className}
              <span className="block text-xs text-slate-400 mt-1">{periodLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            {[
              { code: 'hadir', label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { code: 'alfa', label: 'Alpa', color: 'bg-rose-100 text-rose-700 border-rose-200' },
              { code: 'sakit', label: 'Sakit', color: 'bg-amber-100 text-amber-700 border-amber-200' },
              { code: 'izin', label: 'Izin', color: 'bg-blue-100 text-blue-700 border-blue-200' },
              { code: 'libur', label: 'Libur / Cuti Bersama', color: 'bg-slate-100 text-slate-600 border-slate-200' },
            ].map((item) => (
              <div key={item.code} className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md border font-extrabold ${item.color}`}>
                  {item.code === 'libur' ? 'L' : item.label.charAt(0)}
                </span>
                <span className="text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Siswa</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{rows.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold uppercase text-slate-400">Hari Efektif</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{effectiveDays}</div>
              <div className="text-[10px] font-semibold text-slate-400 mt-1">{nonAttendanceDays} hari libur</div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="text-[10px] font-bold uppercase text-emerald-600">Total Hadir</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{totals.hadir}</div>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="text-[10px] font-bold uppercase text-amber-600">Total Sakit / Izin</div>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{totals.sakit + totals.izin}</div>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
              <div className="text-[10px] font-bold uppercase text-rose-600">Total Alfa</div>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">{totals.alfa}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="sticky left-0 z-20 bg-slate-50 p-4 w-14 text-center text-xs font-bold uppercase">No</th>
                  <th className="sticky left-14 z-20 bg-slate-50 p-4 min-w-[220px] text-left text-xs font-bold uppercase">Nama Siswa</th>
                  <th className="p-4 text-center text-sm font-bold text-slate-700" colSpan={days.length}>
                    {periodLabel}
                  </th>
                  <th className="p-4 w-20 text-center text-xs font-bold uppercase">Total</th>
                </tr>
                <tr className="bg-white border-b border-slate-200">
                  <th className="sticky left-0 z-20 bg-white p-3"></th>
                  <th className="sticky left-14 z-20 bg-white p-3"></th>
                  {days.map((day) => (
                    <th
                      key={day.date}
                      className={`p-3 w-12 text-center text-sm font-semibold ${day.isNonAttendanceDay ? 'text-rose-600 bg-rose-50' : 'text-slate-700'}`}
                      title={day.nonAttendanceReason || undefined}
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-bold">{day.day}</span>
                        <span className="text-[10px] uppercase">{day.monthShort}</span>
                        <span className="text-xs">{day.weekdayLabel}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center text-xs font-bold uppercase text-slate-600">H</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={days.length + 3} className="py-10 text-center text-slate-400">
                      Tidak ada data siswa untuk kelas dan periode ini.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.student.id} className="hover:bg-slate-50/60">
                      <td className="sticky left-0 z-10 bg-white p-4 text-center text-sm text-slate-500 border-r border-slate-100">
                        {row.index}
                      </td>
                      <td className="sticky left-14 z-10 bg-white p-4 border-r border-slate-100">
                        <div className="font-medium text-slate-800">{row.student.name}</div>
                      </td>
                      {row.dayStatuses.map((status, dayIndex) => {
                        const day = days[dayIndex];
                        const cellClass = day.isNonAttendanceDay
                          ? 'text-rose-600 bg-rose-50 border-rose-200'
                          : status === 'hadir'
                            ? 'text-emerald-600'
                            : status === 'sakit'
                              ? 'text-amber-600'
                              : status === 'izin'
                                ? 'text-blue-600'
                                : status === 'alfa'
                                  ? 'text-rose-600'
                                  : 'text-slate-300';

                        return (
                          <td key={`${row.student.id}-${day.date}`} className="p-3 text-center text-sm" title={day.nonAttendanceReason || undefined}>
                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md border font-bold ${cellClass}`}>
                              {day.isNonAttendanceDay ? 'L' : status ? status.charAt(0).toUpperCase() : '-'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-4 text-center text-base font-extrabold text-slate-800">
                        {row.total}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-900 no-print">
          <div className="font-bold mb-1">Keterangan:</div>
          <p className="text-blue-800">
            Data absensi ditampilkan per tanggal berdasarkan kelas yang dipilih. Sabtu/Minggu, libur nasional, dan cuti bersama
            ditandai L serta tidak dihitung sebagai kewajiban absen.
          </p>
        </div>
      </div>
    );
  };


  // --- SUB-VIEWS / TEMPLATE BLOCKS ---

  // 1. Sidebar Nav
  const renderSidebar = () => {
    if (!user) return null;

    const navItems = {
      super_admin: [
        { id: 'dashboard', label: 'Dashboard', icon: Shield },
        { id: 'schools', label: 'Kelola Sekolah', icon: School },
        { id: 'pricing', label: 'Paket & Kontak', icon: Tags },
        { id: 'password', label: 'Ganti Password', icon: Key },
      ],
      admin: [
        { id: 'dashboard', label: 'Dashboard', icon: Shield },
        { id: 'teachers', label: 'Data Guru', icon: Users },
        { id: 'password', label: 'Ganti Password', icon: Key },
      ],
      teacher: [
        { id: 'dashboard', label: 'Dashboard', icon: Shield },
        { id: 'classes', label: 'Data Kelas', icon: BookOpen },
        { id: 'students', label: 'Data Siswa', icon: GraduationCap },
        { id: 'scan', label: 'Scan QR Absensi', icon: QrCode },
        { id: 'attendance', label: 'Riwayat & Rekap', icon: Calendar },
        { id: 'academic', label: 'Akademik', icon: Award },
        { id: 'password', label: 'Ganti Password', icon: Key },
      ]
    };

    const items = navItems[user.role] || [];

    return (
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Top Header brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-600/30">
                GP
              </div>
              <div>
                <h1 className="font-display font-extrabold text-[11px] text-white tracking-tight uppercase leading-none mb-1">Administrasi Guru</h1>
                <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold block">PREMIUM EDITION</span>
              </div>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User badge */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/40">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Peran Pengguna</div>
            <div className="text-white font-bold text-sm mt-1 truncate">{user.name}</div>
            <div className="text-xs text-indigo-400 mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
              {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin Sekolah' : 'Guru Kelas'}
            </div>
            {school && (
              <div className="mt-2 text-xs text-slate-400 truncate bg-slate-800/50 px-2 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                <Building className="w-3 h-3 text-indigo-400" />
                {school.name}
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/${item.id}`);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  id={`nav-item-${item.id}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout Footer */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl text-sm font-semibold transition cursor-pointer"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi
            </button>
          </div>
        </div>
      </aside>
    );
  };

  // 2. Global top navbar
  const renderNavbar = () => {
    if (!user) return null;
    const pageTitles: Record<string, string> = {
      dashboard: user.role === 'super_admin' ? 'Ringkasan Sistem' : user.role === 'admin' ? 'Ringkasan Sekolah' : 'Ringkasan Guru',
      schools: 'Kelola Sekolah',
      pricing: 'Paket & Kontak',
      teachers: 'Data Guru',
      attendance: 'Laporan Absensi',
      classes: 'Data Kelas',
      students: 'Data Siswa',
      scan: 'Scan QR Absensi',
      academic: 'Akademik',
      password: 'Ganti Password',
    };
    return (
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-600 hover:text-slate-900"
            id="mobile-hamburger"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Halaman Aktif
            </span>
            <h2 className="text-lg font-bold font-display text-slate-800 capitalize mt-0.5">
              {pageTitles[activeTab] || activeTab.replace('_', ' ')}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Current system clock badge */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs text-slate-400 font-medium">Sistem Cloud Online</span>
            <span className="text-xs font-semibold text-slate-700">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            AKTIF
          </span>
        </div>
      </header>
    );
  };

  // 3. Super Admin Dashboard Screen
  const renderSuperAdminDashboard = () => {
    const activeSchools = schools.filter(s => s.subscriptionStatus === 'aktif').length;
    const inactiveSchools = schools.length - activeSchools;
    const totalSiswaAll = schools.reduce((sum, s) => sum + s.totalStudents, 0);
    const totalTeachersAll = schools.reduce((sum, s) => sum + s.totalTeachers, 0);
    const totalClassesAll = schools.reduce((sum, s) => sum + s.totalClasses, 0);
    const activeRate = schools.length > 0 ? Math.round((activeSchools / schools.length) * 100) : 0;
    const planCounts: Record<SubscriptionPlan, number> = {
      bulanan: 0,
      tahunan: 0,
      selamanya: 0
    };

    schools.forEach(sch => {
      planCounts[sch.subscriptionPlan] += 1;
    });

    const planLabels: Record<SubscriptionPlan, string> = {
      bulanan: 'Bulanan',
      tahunan: 'Tahunan',
      selamanya: 'Selamanya'
    };

    const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value);

    return (
      <div className="space-y-6">
        <section className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-sm">
          <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/10 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                Pusat Kendali Super Admin
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                Monitoring sekolah, lisensi, dan kapasitas pengguna
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Pantau status langganan seluruh sekolah dan kelola akses premium dari satu tempat.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-full sm:min-w-[360px]">
              <div className="bg-white/10 border border-white/10 rounded-lg p-4">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rasio Aktif</span>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-white font-display">{activeRate}%</span>
                  <span className="text-xs text-emerald-300 font-semibold pb-1">{activeSchools} aktif</span>
                </div>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-lg p-4">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Data</span>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-white font-display">{formatNumber(totalSiswaAll + totalTeachersAll)}</span>
                  <span className="text-xs text-slate-300 font-semibold pb-1">akun & siswa</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sekolah</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{formatNumber(schools.length)}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeSchools} aktif, {inactiveSchools} nonaktif</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Langganan</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{activeRate}%</h3>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Siswa</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{formatNumber(totalSiswaAll)}</h3>
              <p className="text-xs text-slate-500 mt-1">Terdaftar di semua sekolah</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kapasitas</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 font-display">{formatNumber(totalClassesAll)}</h3>
              <p className="text-xs text-slate-500 mt-1">{formatNumber(totalTeachersAll)} guru pengajar</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSchoolsView = () => {
    const filteredSchools = schools.filter(sch => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return (
        sch.name.toLowerCase().includes(query) ||
        sch.address.toLowerCase().includes(query) ||
        sch.subscriptionPlan.toLowerCase().includes(query) ||
        sch.subscriptionStatus.toLowerCase().includes(query)
      );
    });

    const recentSchools = [...schools]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    const planLabels: Record<SubscriptionPlan, string> = {
      bulanan: 'Bulanan',
      tahunan: 'Tahunan',
      selamanya: 'Selamanya'
    };

    const getPlanColor = (plan: SubscriptionPlan) => {
      if (plan === 'selamanya') return 'bg-amber-50 text-amber-700 border-amber-200';
      if (plan === 'tahunan') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      return 'bg-sky-50 text-sky-700 border-sky-200';
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">Daftar Sekolah</h2>
              <p className="text-xs text-slate-500 mt-1">Tambah, edit, reset akses, dan hapus sekolah dari sini.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari sekolah..."
                  className="w-full sm:w-64 pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  id="superadmin-school-search"
                />
              </div>
              <button
                onClick={() => {
                  setSchoolName('');
                  setSchoolAddress('');
                  setSchoolPlan('bulanan');
                  setSchoolAdminName('');
                  setCreatedSchoolAdmin(null);
                  setIsAddSchoolModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
                id="btn-add-school"
              >
                <Plus className="w-4 h-4" />
                Sekolah Baru
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Sekolah</th>
                  <th className="px-5 py-3">Kapasitas</th>
                  <th className="px-5 py-3">Paket</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      {schools.length === 0 ? 'Belum ada data sekolah terdaftar.' : 'Tidak ada sekolah yang cocok dengan pencarian.'}
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 min-w-[280px]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 font-display">{sch.name}</div>
                            <div className="text-xs text-slate-500 mt-1 max-w-[320px] truncate">{sch.address}</div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              Dibuat {new Date(sch.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 min-w-[210px]">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                            <div className="text-sm font-extrabold text-slate-900">{sch.totalTeachers}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Guru</div>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                            <div className="text-sm font-extrabold text-slate-900">{sch.totalStudents}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Siswa</div>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                            <div className="text-sm font-extrabold text-slate-900">{sch.totalClasses}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Kelas</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getPlanColor(sch.subscriptionPlan)}`}>
                          {planLabels[sch.subscriptionPlan]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 ${sch.subscriptionStatus === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sch.subscriptionStatus === 'aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {sch.subscriptionStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSchool(sch);
                              setSchoolName(sch.name);
                              setSchoolAddress(sch.address);
                              setSchoolPlan(sch.subscriptionPlan);
                              setSchoolStatus(sch.subscriptionStatus);
                              setIsEditSchoolModalOpen(true);
                            }}
                            className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg bg-slate-50 hover:bg-indigo-50 transition"
                            id={`edit-school-${sch.id}`}
                            title="Edit sekolah"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchool(sch.id)}
                            className="p-2 text-slate-500 hover:text-rose-600 rounded-lg bg-slate-50 hover:bg-rose-50 transition"
                            id={`delete-school-${sch.id}`}
                            title="Hapus sekolah"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold font-display text-slate-900">Distribusi Paket</h3>
                <p className="text-xs text-slate-500 mt-1">Komposisi paket premium aktif di sistem.</p>
              </div>
              <SlidersHorizontal className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {(['bulanan', 'tahunan', 'selamanya'] as SubscriptionPlan[]).map((plan) => {
                const percent = schools.length > 0 ? Math.round((schools.filter((s) => s.subscriptionPlan === plan).length / schools.length) * 100) : 0;
                const count = schools.filter((s) => s.subscriptionPlan === plan).length;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{planLabels[plan]}</span>
                      <span className="text-slate-500 text-xs">{count} sekolah</span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${plan === 'selamanya' ? 'bg-amber-500' : plan === 'tahunan' ? 'bg-indigo-500' : 'bg-sky-500'}`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold font-display text-slate-900">Sekolah Terbaru</h3>
                <p className="text-xs text-slate-500 mt-1">Pendaftaran terakhir di platform.</p>
              </div>
              <CalendarDays className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {recentSchools.length === 0 ? (
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-sm text-slate-500">
                  Belum ada sekolah terdaftar.
                </div>
              ) : (
                recentSchools.map((sch) => (
                  <div key={sch.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">{sch.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Date(sch.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-bold ${sch.subscriptionStatus === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {sch.subscriptionStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={`rounded-lg border p-5 ${schools.some((s) => s.subscriptionStatus !== 'aktif') ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-start gap-3">
              {schools.some((s) => s.subscriptionStatus !== 'aktif') ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-bold text-sm ${schools.some((s) => s.subscriptionStatus !== 'aktif') ? 'text-amber-900' : 'text-emerald-900'}`}>
                  {schools.some((s) => s.subscriptionStatus !== 'aktif') ? `${schools.filter((s) => s.subscriptionStatus !== 'aktif').length} sekolah nonaktif` : 'Semua sekolah aktif'}
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${schools.some((s) => s.subscriptionStatus !== 'aktif') ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {schools.some((s) => s.subscriptionStatus !== 'aktif') ? 'Periksa status langganan sekolah yang belum aktif.' : 'Tidak ada lisensi sekolah yang perlu ditinjau saat ini.'}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    );
  };

  // 3b. Super Admin: Pricing Plans & WhatsApp Contact CMS
  const renderPricingSettingsView = () => {
    const sortedPlans = [...pricingPlans].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">Paket Berlangganan</h2>
              <p className="text-xs text-slate-500 mt-1">Paket ini tampil di halaman depan (landing page) sistem.</p>
            </div>
            <button
              onClick={openAddPlanModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
              id="btn-add-plan"
            >
              <Plus className="w-4 h-4" />
              Paket Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Paket</th>
                  <th className="px-5 py-3">Harga</th>
                  <th className="px-5 py-3">Urutan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {sortedPlans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      Belum ada paket berlangganan. Tambahkan paket pertama Anda.
                    </td>
                  </tr>
                ) : (
                  sortedPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-900 font-display">{plan.name}</div>
                          {plan.isHighlighted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                              <Star className="w-3 h-3" /> Unggulan
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 max-w-[320px]">{plan.description}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">Rp{plan.price}</div>
                        <div className="text-xs text-slate-500">{plan.period}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">{plan.sortOrder}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 ${plan.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {plan.isActive ? 'Tayang' : 'Disembunyikan'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditPlanModal(plan)}
                            className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg bg-slate-50 hover:bg-indigo-50 transition"
                            id={`edit-plan-${plan.id}`}
                            title="Edit paket"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePricingPlan(plan.id, plan.name)}
                            className="p-2 text-slate-500 hover:text-rose-600 rounded-lg bg-slate-50 hover:bg-rose-50 transition"
                            id={`delete-plan-${plan.id}`}
                            title="Hapus paket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold font-display text-slate-900">Kontak WhatsApp</h3>
                <p className="text-xs text-slate-500 mt-1">Nomor tujuan saat pengunjung memilih paket di landing page.</p>
              </div>
              <MessageCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <form onSubmit={handleSaveSiteSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nomor WhatsApp</label>
                <input
                  type="text"
                  required
                  value={waNumberInput}
                  onChange={(e) => setWaNumberInput(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="settings-wa-number"
                />
                <p className="text-[11px] text-slate-400 mt-1">Gunakan format internasional tanpa tanda + atau spasi.</p>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Template Pesan</label>
                <textarea
                  value={waMessageInput}
                  onChange={(e) => setWaMessageInput(e.target.value)}
                  rows={3}
                  placeholder="Halo, saya tertarik dengan paket {paket} Absensi Premium."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 resize-none"
                  id="settings-wa-message"
                />
                <p className="text-[11px] text-slate-400 mt-1">Gunakan <code className="font-mono">{'{paket}'}</code> untuk menyisipkan nama paket yang dipilih.</p>
              </div>
              <button
                type="submit"
                disabled={settingsSaveLoading}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:bg-slate-200 transition"
                id="settings-wa-submit"
              >
                {settingsSaveLoading ? 'Menyimpan...' : 'Simpan Kontak'}
              </button>
            </form>
          </section>

          <section className="bg-slate-900 text-white rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-indigo-300" />
              <h3 className="font-bold text-sm">Cara Kerja</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hanya paket berstatus "Tayang" yang muncul di halaman depan. Saat pengunjung menekan tombol pilih paket,
              mereka akan diarahkan ke WhatsApp nomor di atas dengan pesan otomatis yang sudah berisi nama paket.
            </p>
          </section>
        </aside>
      </div>
    );
  };

  // 4. School Admin Screen
  const renderSchoolAdminDashboard = () => {
    const stats = getAttendanceStats();
    return (
      <div className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Siswa</span>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">{students.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Guru</span>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">{teachers.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Kelas</span>
              <h3 className="text-2xl font-bold text-slate-800 font-display mt-0.5">{classes.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kehadiran Hari Ini</span>
              <h3 className="text-2xl font-bold text-emerald-600 font-display mt-0.5">{stats.persen}%</h3>
            </div>
          </div>
        </div>

        {/* Detailed stats overview row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold font-display text-slate-800 mb-4">Grafik Kehadiran Hari Ini</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 font-extrabold text-2xl font-display">{stats.hadir}</span>
                <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase">Hadir</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-amber-700 font-extrabold text-2xl font-display">{stats.sakit}</span>
                <p className="text-xs font-semibold text-amber-600 mt-1 uppercase">Sakit</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-blue-700 font-extrabold text-2xl font-display">{stats.izin}</span>
                <p className="text-xs font-semibold text-blue-600 mt-1 uppercase">Izin</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-rose-700 font-extrabold text-2xl font-display">{stats.alfa}</span>
                <p className="text-xs font-semibold text-rose-600 mt-1 uppercase">Alfa</p>
              </div>
            </div>

            {/* Quick action shortcuts */}
            {user.role === 'teacher' && (
              <div className="mt-6 p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                  <p className="text-xs text-slate-600">Butuh mencatat absensi siswa secara manual karena sakit, izin, atau lupa membawa kartu QR?</p>
                </div>
                <button
                  onClick={() => {
                    setManualStudentId('');
                    setManualStatus('hadir');
                    setIsManualAttendanceModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition"
                  id="btn-quick-manual-attendance"
                >
                  Catat Absensi Manual
                </button>
              </div>
            )}
          </div>

          {/* Quick guide card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-base font-extrabold font-display tracking-tight text-white">Sistem Absensi Premium</h4>
              <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                Setiap siswa terdaftar otomatis memiliki satu QR Code unik yang tidak boleh sama. Guru kelas dapat menggunakan HP mereka untuk membuka menu "Scan QR" dan mengarahkan ke kartu siswa. Data absensi masuk ke database seketika!
              </p>
            </div>

            <div className="mt-6 border-t border-indigo-800/50 pt-4 flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-medium">Subscription Plan:</span>
              <span className="bg-indigo-800 text-indigo-200 font-bold px-2 py-0.5 rounded border border-indigo-700 uppercase">
                {school?.subscriptionPlan}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Data Kelas Tab
  const renderClassesView = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-800">Manajemen Data Kelas</h2>
            <p className="text-xs text-slate-500 mt-1">Buat, perbarui, dan hapus struktur kelas sekolah Anda</p>
          </div>
          <button
            onClick={() => {
              setClassNameInput('');
              setIsAddClassModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
            id="btn-add-class"
          >
            <Plus className="w-4 h-4" />
            Tambah Kelas Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                <th className="p-4">Nama Kelas</th>
                <th className="p-4">Tanggal Dibuat</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">
                    Belum ada data kelas. Tambahkan kelas sekarang.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800 font-display">
                      {cls.name}
                    </td>
                    <td className="p-4 text-xs">
                      {new Date(cls.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClass(cls);
                          setClassNameInput(cls.name);
                          setIsEditClassModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                        id={`edit-class-${cls.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition"
                        id={`delete-class-${cls.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Data Guru Tab
  const renderTeachersView = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-800">Akun Guru Pengajar</h2>
            <p className="text-xs text-slate-500 mt-1">Impor nama guru dari Excel, lihat password awal, dan unduh kredensial PDF.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={teacherFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => void handleImportTeacherExcel(e)}
              id="teacher-excel-input"
            />
            <button
              type="button"
              onClick={() => teacherFileInputRef.current?.click()}
              disabled={teacherImportLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition"
              id="btn-import-teacher-excel"
            >
              <Upload className="w-4 h-4" />
              {teacherImportLoading ? 'Mengimpor...' : 'Import Excel'}
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadTeacherTemplate()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-sm transition"
              id="btn-download-teacher-template"
            >
              <FileText className="w-4 h-4" />
              Template Excel
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadTeachersPdf()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition"
              id="btn-download-teacher-pdf"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() => {
                setTeacherName('');
                setTeacherUsername('');
                setTeacherPassword('');
                setIsAddTeacherModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
              id="btn-add-teacher"
            >
              <Plus className="w-4 h-4" />
              Tambah Guru
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Username Login</th>
                <th className="p-4">Password Awal</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    Belum ada data guru terdaftar.
                  </td>
                </tr>
              ) : (
                teachers.map((tch) => (
                  <tr key={tch.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800 font-display">
                      {tch.name}
                    </td>
                    <td className="p-4 text-xs font-mono bg-slate-50/40 rounded px-2 py-0.5">
                      {tch.username}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-md font-mono">
                        {tch.initialPassword || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setViewingTeacher(tch)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                        id={`detail-teacher-${tch.id}`}
                        title="Detail kredensial"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacher(tch);
                          setTeacherName(tch.name);
                          setTeacherPassword('');
                          setIsEditTeacherModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                        id={`edit-teacher-${tch.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(tch.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition"
                        id={`delete-teacher-${tch.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Data Siswa Tab (With QR Card Generator triggers!)
  const renderStudentsView = () => {
    const filteredStudents = getFilteredStudents();

    return (
      <div className="space-y-6">
        {/* Filters Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Siswa / NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                id="student-search-input"
              />
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
              id="student-class-filter"
            >
              <option value="all">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <input
              ref={studentFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => void handleImportStudentExcel(e)}
              id="student-excel-input"
            />
            <button
              type="button"
              onClick={() => studentFileInputRef.current?.click()}
              disabled={studentImportLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition"
              id="btn-import-student-excel"
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadStudentTemplate()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-sm transition"
              id="btn-download-student-template"
            >
              <FileText className="w-4 h-4" />
              Template Excel
            </button>
            <button
              type="button"
              onClick={openPromoteStudentsModal}
              disabled={classes.length < 2 || students.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm transition"
              id="btn-promote-students"
            >
              <ArrowRight className="w-4 h-4" />
              Kenaikan Kelas
            </button>
            <button
              type="button"
              onClick={() => void handlePrintStudentQRCards(filteredStudents)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition"
              id="btn-print-student-qr-bulk"
            >
              <Printer className="w-4 h-4" />
              Cetak QR Bersama
            </button>
            <button
              onClick={() => {
                setStudentName('');
                setStudentNisn('');
                setStudentClassId(classes[0]?.id || '');
                setIsAddStudentModalOpen(true);
              }}
              disabled={classes.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-sm transition"
              id="btn-add-student"
            >
              <Plus className="w-4 h-4" />
              Daftarkan Siswa Baru
            </button>
          </div>
        </div>

        {/* Classes safeguard info */}
        {classes.length === 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Sekolah Anda belum memiliki kelas terdaftar. Silakan menuju menu <b>Data Kelas</b> terlebih dahulu sebelum mendaftarkan siswa.</span>
          </div>
        )}

        {/* Main List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                  <th className="p-4">Nama Siswa</th>
                  <th className="p-4">NISN</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Password Awal</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">ID QR Code</th>
                  <th className="p-4 text-center">Kartu QR</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      Tidak menemukan data siswa yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800 font-display">
                        {std.name}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {std.nisn}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-600">
                        {std.username || '-'}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-600">
                        {std.initialPassword || '-'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md">
                          {std.className}
                        </span>
                      </td>
                      <td className="p-4 text-xs truncate max-w-[150px] font-mono text-slate-400">
                        {std.qrCode}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setViewingQRStudent(std)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition"
                          id={`view-qr-${std.id}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Lihat / Cetak Kartu QR
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setViewingStudent(std)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                          id={`detail-student-${std.id}`}
                          title="Detail akun siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(std);
                            setStudentName(std.name);
                            setStudentNisn(std.nisn);
                            setStudentClassId(std.classId);
                            setIsEditStudentModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                          id={`edit-student-${std.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(std.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition"
                          id={`delete-student-${std.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Laporan Absensi & Rekap Tab (Admins & Teachers)
  const renderAttendanceReportView = () => {
    const filteredLogs = getFilteredAttendances();

    return (
      <div className="space-y-6">
        {/* Filters Block */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-800">Laporan Rekap Absensi</h3>
              <p className="text-xs text-slate-500 mt-0.5">Filter riwayat kehadiran berdasarkan Rentang Harian atau Rentang 6-Bulanan per Semester (Ganjil: Juli-Desember, Genap: Januari-Juni)</p>
            </div>

            {user.role === 'teacher' && (
              <button
                onClick={() => {
                  setManualStudentId('');
                  setManualStatus('hadir');
                  setManualDate(new Date().toISOString().split('T')[0]);
                  setIsManualAttendanceModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition"
                id="btn-add-attendance-manual-report"
              >
                <Plus className="w-3.5 h-3.5" />
                Catat Kehadiran Manual
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cari Nama / NISN</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                id="report-search"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kelas</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                id="report-class"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status Kehadiran</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                id="report-status"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="alfa">Alfa</option>
              </select>
            </div>

            {/* Rentang Rekap */}
            <div>
              <label className="block text-xs font-bold text-indigo-500 uppercase mb-1">Rentang Rekap</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold rounded-xl text-sm focus:outline-indigo-500"
                id="report-period"
              >
                <option value="harian">📅 Harian (Pilih Tanggal)</option>
                <option value="ganjil">🍂 Semester Ganjil (Jul - Des)</option>
                <option value="genap">🌸 Semester Genap (Jan - Jun)</option>
              </select>
            </div>

            {/* Time Selector based on Rentang Rekap */}
            {filterPeriod === 'harian' ? (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tanggal Absensi</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="report-date"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tahun Akademik</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="report-year"
                >
                  <option value="all">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Iframe Safe Printing Warning Banner */}
        {isIframe && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-2xl flex items-start gap-3 shadow-sm no-print">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900 block text-sm">💡 Tips Mencetak PDF Laporan (Landscape)</span>
              <p className="leading-relaxed">
                Anda sedang membuka sistem ini di dalam <strong className="text-amber-900 font-semibold">Frame Pratinjau (iFrame) AI Studio</strong>. Fitur cetak browser biasanya diblokir oleh kebijakan keamanan iFrame.
              </p>
              <p className="font-medium text-amber-950 mt-1">
                Silakan klik tombol <strong className="bg-white/80 border border-amber-300 px-1.5 py-0.5 rounded shadow-sm text-indigo-700 font-semibold">"Buka di Tab Baru"</strong> di pojok kanan atas layar pratinjau browser Anda, kemudian klik kembali tombol <strong>Cetak Rekap</strong> di tab baru tersebut. Dokumen akan langsung tersusun rapi secara horizontal (Landscape)!
              </p>
            </div>
          </div>
        )}

        {/* Toggle View Mode */}
        <div className="flex items-center justify-between bg-slate-150/60 p-1 rounded-xl max-w-md border border-slate-200 shadow-sm no-print">
          <button
            onClick={() => setRecapViewType('summary')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              recapViewType === 'summary'
                ? 'bg-white text-indigo-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            📊 Jumlah Rekap S/I/A/H per Siswa
          </button>
          <button
            onClick={() => setRecapViewType('detailed')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              recapViewType === 'detailed'
                ? 'bg-white text-indigo-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            📋 Daftar Riwayat Detail
          </button>
        </div>

        {/* Content Table based on View Mode */}
        {recapViewType === 'summary' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 no-print animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Siswa</span>
              <span className="text-2xl font-black text-slate-800 font-display mt-1 block">{getRecapByStudent().length} Siswa</span>
            </div>
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Hadir (H)</span>
              <span className="text-2xl font-black text-emerald-700 font-display mt-1 block">
                {getRecapByStudent().reduce((sum, r) => sum + r.hadir, 0)} Hari
              </span>
            </div>
            <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Total Sakit (S)</span>
              <span className="text-2xl font-black text-amber-700 font-display mt-1 block">
                {getRecapByStudent().reduce((sum, r) => sum + r.sakit, 0)} Hari
              </span>
            </div>
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Total Izin (I)</span>
              <span className="text-2xl font-black text-blue-700 font-display mt-1 block">
                {getRecapByStudent().reduce((sum, r) => sum + r.izin, 0)} Hari
              </span>
            </div>
            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Total Alfa (A)</span>
              <span className="text-2xl font-black text-rose-700 font-display mt-1 block">
                {getRecapByStudent().reduce((sum, r) => sum + r.alfa, 0)} Hari
              </span>
            </div>
          </div>
        )}

        {/* Content Table based on View Mode */}
        {recapViewType === 'summary' ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn no-print">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tampilan Rekap Akumulasi (Hadir / Sakit / Izin / Alfa)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Menampilkan total jumlah kehadiran tiap siswa untuk periode yang dipilih</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const data = getRecapByStudent();
                    if (data.length === 0) return;
                    let csvContent = 'No,Nama Siswa,NISN,Kelas,Hadir,Sakit,Izin,Alfa,Persentase Kehadiran\n';
                    data.forEach((row, idx) => {
                      csvContent += `${idx + 1},"${row.studentName}","${row.nisn}","${row.className}",${row.hadir},${row.sakit},${row.izin},${row.alfa},${row.persentase}%\n`;
                    });
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `rekap_absensi_${filterClass === 'all' ? 'semua_kelas' : 'kelas'}_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Excel (CSV)
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  Cetak Rekap
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Nama Siswa</th>
                    <th className="p-4">NISN</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4 text-center bg-emerald-50/40 text-emerald-800">Hadir (H)</th>
                    <th className="p-4 text-center bg-amber-50/40 text-amber-800">Sakit (S)</th>
                    <th className="p-4 text-center bg-blue-50/40 text-blue-800">Izin (I)</th>
                    <th className="p-4 text-center bg-rose-50/40 text-rose-800">Alfa (A)</th>
                    <th className="p-4 text-center font-bold text-indigo-900">Kehadiran (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {getRecapByStudent().length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        Tidak ada data siswa yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    getRecapByStudent().map((row, idx) => (
                      <tr key={row.studentId} className="hover:bg-slate-50/40 transition">
                        <td className="p-4 text-center text-xs font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-4 font-bold text-slate-800 font-display">
                          {row.studentName}
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-500">
                          {row.nisn}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                            {row.className}
                          </span>
                        </td>
                        <td className="p-4 text-center font-extrabold text-emerald-600 bg-emerald-50/10 text-base">
                          {row.hadir}
                        </td>
                        <td className="p-4 text-center font-extrabold text-amber-600 bg-amber-50/10 text-base">
                          {row.sakit}
                        </td>
                        <td className="p-4 text-center font-extrabold text-blue-600 bg-blue-50/10 text-base">
                          {row.izin}
                        </td>
                        <td className="p-4 text-center font-extrabold text-rose-600 bg-rose-50/10 text-base">
                          {row.alfa}
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 text-xs">
                              {row.persentase}%
                            </span>
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  row.persentase >= 85
                                    ? 'bg-emerald-500'
                                    : row.persentase >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${row.persentase}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {getRecapByStudent().length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50/80 border-t border-slate-200 font-bold text-sm text-slate-800">
                      <td colSpan={4} className="p-4 text-right">TOTAL KESELURUHAN (HARI):</td>
                      <td className="p-4 text-center text-emerald-700 bg-emerald-50/20 font-extrabold text-base">
                        {getRecapByStudent().reduce((sum, r) => sum + r.hadir, 0)}
                      </td>
                      <td className="p-4 text-center text-amber-700 bg-amber-50/20 font-extrabold text-base">
                        {getRecapByStudent().reduce((sum, r) => sum + r.sakit, 0)}
                      </td>
                      <td className="p-4 text-center text-blue-700 bg-blue-50/20 font-extrabold text-base">
                        {getRecapByStudent().reduce((sum, r) => sum + r.izin, 0)}
                      </td>
                      <td className="p-4 text-center text-rose-700 bg-rose-50/20 font-extrabold text-base">
                        {getRecapByStudent().reduce((sum, r) => sum + r.alfa, 0)}
                      </td>
                      <td className="p-4 text-center font-black text-indigo-900 bg-indigo-50/20 text-base">
                        {Math.round(
                          (getRecapByStudent().reduce((sum, r) => sum + r.hadir, 0) /
                            (getRecapByStudent().reduce((sum, r) => sum + r.hadir + r.sakit + r.izin + r.alfa, 0) || 1)) * 100
                        )}%
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden no-print">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                    <th className="p-4">Siswa</th>
                    <th className="p-4">NISN</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">Tanggal & Waktu</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Dicatat Oleh</th>
                    {user.role === 'teacher' && <th className="p-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        Tidak ada catatan absensi yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const pillColors = {
                        hadir: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        sakit: 'bg-amber-50 text-amber-700 border-amber-100',
                        izin: 'bg-blue-50 text-blue-700 border-blue-100',
                        alfa: 'bg-rose-50 text-rose-700 border-rose-100'
                      };

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-800 font-display">
                            {log.studentName}
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-500">
                            {log.nisn}
                          </td>
                          <td className="p-4 text-xs font-semibold">
                            {log.className}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span>{log.date}</span>
                              <span className="text-xs text-slate-400">{log.time}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${pillColors[log.status]}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-slate-500 font-medium">
                              {log.method === 'qr' ? '⚡ Scan QR Code' : '✍️ Manual'}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {log.scannedByName}
                          </td>
                          {user.role === 'teacher' && (
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeleteAttendance(log.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition"
                                id={`delete-attendance-${log.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LAPORAN KHUSUS UNTUK CETAK (Hidden on Screen, Visible on Print) */}
        <div className="hidden print:block w-full text-slate-950 printable-report">
          {/* Kop Surat */}
          <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wide uppercase font-display text-slate-900">
                  {school?.name || 'KARTU ABSENSI DIGITAL'}
                </h1>
                <p className="text-xs text-slate-600 font-medium max-w-xl">
                  {school?.address || 'Sistem Rekap Presensi Siswa Berbasis QR Code'}
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-mono">
              ID: {school?.id || 'APP-3017'}
            </div>
          </div>

          {/* Judul Laporan */}
          <div className="text-center mb-6">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-900">
              REKAPITULASI PRESENSI / KEHADIRAN SISWA
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Sistem Presensi Kelas & Absensi Sekolah Digital
            </p>
          </div>

          {/* Filter & Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs border border-slate-300 p-3 rounded-xl bg-slate-50/50">
            <div className="space-y-1">
              <div>
                <span className="text-slate-500 font-bold">Kelas: </span>
                <span className="font-semibold text-slate-800">
                  {filterClass === 'all' ? 'Semua Kelas' : classes.find(c => c.id === filterClass)?.name || filterClass}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Status Filter: </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {filterStatus === 'all' ? 'Semua Status' : filterStatus}
                </span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-500 font-bold">Periode: </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {filterPeriod === 'harian'
                    ? `Harian (${filterDate})`
                    : `Semester ${filterPeriod === 'ganjil' ? 'Ganjil (Juli-Desember)' : 'Genap (Januari-Juni)'} - ${filterYear}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Tanggal Cetak: </span>
                <span className="font-semibold text-slate-800">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Utama untuk Cetak */}
          <table className="printable-table">
            <thead>
              <tr>
                <th className="w-10">No</th>
                <th>Nama Siswa</th>
                <th>NISN</th>
                <th>Kelas</th>
                <th className="w-20">Hadir (H)</th>
                <th className="w-20">Sakit (S)</th>
                <th className="w-20">Izin (I)</th>
                <th className="w-20">Alfa (A)</th>
                <th className="w-28">% Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {getRecapByStudent().length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-slate-400">
                    Tidak ada data siswa yang sesuai filter.
                  </td>
                </tr>
              ) : (
                getRecapByStudent().map((row, idx) => (
                  <tr key={row.studentId}>
                    <td className="text-center font-mono text-xs">{idx + 1}</td>
                    <td className="font-bold">{row.studentName}</td>
                    <td className="font-mono text-xs">{row.nisn}</td>
                    <td className="text-center">{row.className}</td>
                    <td className="text-center font-bold text-emerald-700">{row.hadir}</td>
                    <td className="text-center font-bold text-amber-700">{row.sakit}</td>
                    <td className="text-center font-bold text-blue-700">{row.izin}</td>
                    <td className="text-center font-bold text-rose-700">{row.alfa}</td>
                    <td className="text-center font-extrabold">{row.persentase}%</td>
                  </tr>
                ))
              )}
            </tbody>
            {getRecapByStudent().length > 0 && (
              <tfoot>
                <tr className="font-bold bg-slate-100 text-slate-900 border-t-2 border-slate-900">
                  <td colSpan={4} className="text-right p-2 text-xs">TOTAL KESELURUHAN (HARI):</td>
                  <td className="text-center p-2 text-xs font-bold">{getRecapByStudent().reduce((sum, r) => sum + r.hadir, 0)}</td>
                  <td className="text-center p-2 text-xs font-bold">{getRecapByStudent().reduce((sum, r) => sum + r.sakit, 0)}</td>
                  <td className="text-center p-2 text-xs font-bold">{getRecapByStudent().reduce((sum, r) => sum + r.izin, 0)}</td>
                  <td className="text-center p-2 text-xs font-bold">{getRecapByStudent().reduce((sum, r) => sum + r.alfa, 0)}</td>
                  <td className="text-center p-2 text-xs font-black">
                    {Math.round(
                      (getRecapByStudent().reduce((sum, r) => sum + r.hadir, 0) /
                        (getRecapByStudent().reduce((sum, r) => sum + r.hadir + r.sakit + r.izin + r.alfa, 0) || 1)) * 100
                    )}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Bagian Tanda Tangan */}
          <div className="grid grid-cols-2 gap-8 mt-12 text-xs pt-8">
            <div className="text-center">
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-800 mt-0.5">Kepala Sekolah</p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-800 border-b border-slate-400 inline-block px-8">
                __________________________
              </p>
              <p className="text-[10px] text-slate-500 mt-1">NIP. ....................................</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Dicetak Oleh,</p>
              <p className="font-bold text-slate-800 mt-0.5">{user?.name || 'Petugas Absensi'}</p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-800 border-b border-slate-400 inline-block px-8">
                {user?.name || '__________________________'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Sistem Absensi Digital QR</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. Guru QR Scan screen
  const renderTeacherScanView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: Main scan card */}
        <div className="lg:col-span-2 space-y-6">
          <QRScanner
            students={students}
            onScanSuccess={handleQRScanSuccess}
          />

          {/* Form Pencatatan Manual Ketidakhadiran */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold font-display text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 animate-pulse" />
                Pencatatan Manual Siswa Tidak Masuk (Sakit / Izin / Alfa)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Jika ada siswa yang tidak masuk (sakit, izin, atau tanpa keterangan/alfa), silakan pilih nama mereka di bawah ini lalu simpan tanpa perlu scan.
              </p>
            </div>

            <form onSubmit={handleScanManualAttendance} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Siswa Selector */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5 tracking-wide text-[10px]">
                    Pilih Siswa Tidak Hadir
                  </label>
                  <input
                    type="text"
                    value={scanManualStudentSearch}
                    onChange={(e) => setScanManualStudentSearch(e.target.value)}
                    placeholder="Cari nama siswa, NISN, atau kelas..."
                    className="w-full px-3 py-2 mb-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 font-medium"
                  />
                  <select
                    required
                    value={scanManualStudentId}
                    onChange={(e) => setScanManualStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 font-medium"
                    id="scan-manual-student-select"
                  >
                    <option value="">-- Cari / Pilih Siswa --</option>
                    {students
                      .filter((s) => {
                        const query = scanManualStudentSearch.trim().toLowerCase();
                        if (!query) return true;
                        return (
                          s.name.toLowerCase().includes(query) ||
                          s.nisn.toLowerCase().includes(query) ||
                          s.className.toLowerCase().includes(query)
                        );
                      })
                      .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nisn}) - {s.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5 tracking-wide text-[10px]">
                    Status Ketidakhadiran
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {(['sakit', 'izin', 'alfa'] as const).map((status) => {
                      const colors = {
                        sakit: 'peer-checked:bg-amber-500 peer-checked:text-white border-amber-100 hover:bg-amber-50 text-amber-800',
                        izin: 'peer-checked:bg-blue-500 peer-checked:text-white border-blue-100 hover:bg-blue-50 text-blue-800',
                        alfa: 'peer-checked:bg-rose-500 peer-checked:text-white border-rose-100 hover:bg-rose-50 text-rose-800'
                      };
                      return (
                        <label key={status} className="cursor-pointer relative">
                          <input
                            type="radio"
                            name="scan-manual-status"
                            value={status}
                            checked={scanManualStatus === status}
                            onChange={() => setScanManualStatus(status)}
                            className="sr-only peer"
                          />
                          <span className={`py-2 border rounded-xl text-xs font-semibold capitalize block transition-all ${colors[status]}`}>
                            {status}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={actionLoading || !scanManualStudentId}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition shadow-sm hover:shadow"
                  id="scan-manual-submit-btn"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Ketidakhadiran'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right pane: Real-time logs of today */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 font-display">Scan Hari Ini</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Sistem Live Sinkronisasi</p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">
              {historyToday.length} Absen
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {historyToday.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada absensi yang diproses hari ini.
              </div>
            ) : (
              historyToday.map((log) => {
                const colors = {
                  hadir: 'bg-emerald-500',
                  sakit: 'bg-amber-500',
                  izin: 'bg-blue-500',
                  alfa: 'bg-rose-500'
                };
                return (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{log.studentName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {log.className} • {log.time}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors[log.status]}`}></span>
                      <span className="capitalize font-bold text-slate-700">{log.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Password Change View
  const renderPasswordChangeView = () => {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider">Keamanan Akun</span>
            <h3 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight mt-1">
              Ganti Password
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Perbarui password akun Anda secara berkala untuk menjaga keamanan sistem administrasi Anda.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password Lama</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama Anda"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 focus:bg-white text-slate-800 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                  aria-label={showOldPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password Baru</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min. 4 karakter)"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 focus:bg-white text-slate-800 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                  aria-label={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru Anda"
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 focus:bg-white text-slate-800 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  navigate('/dashboard');
                }}
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={passwordChangeLoading}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
              >
                {passwordChangeLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderLandingPage = () => {
    const highlights = [
      { icon: QrCode, title: 'Scan QR cepat', text: 'Absensi masuk hanya dengan pemindaian kode QR siswa.' },
      { icon: ClipboardList, title: 'Rekap bulanan', text: 'Pantau kehadiran per tanggal, per kelas, dan per bulan.' },
      { icon: ShieldCheck, title: 'Multi-role', text: 'Super admin, admin sekolah, dan guru punya akses berbeda.' },
      { icon: FileSpreadsheet, title: 'Ekspor data', text: 'Unduh laporan untuk arsip, audit, atau pelaporan internal.' },
    ];

    const modules = [
      { title: 'Dashboard Sekolah', desc: 'Ringkasan kelas, siswa, guru, dan statistik absensi harian.' },
      { title: 'Data Guru & Siswa', desc: 'Kelola akun, impor data, reset password, dan QR card siswa.' },
      { title: 'Absensi QR & Manual', desc: 'Scan cepat atau catat ketidakhadiran secara manual.' },
      { title: 'Akademik', desc: 'Tahun ajaran, mata pelajaran, bobot penilaian, dan nilai.' },
    ];

    const workflows = [
      'Admin menyiapkan sekolah, kelas, guru, dan siswa.',
      'Guru melakukan scan QR saat siswa datang ke sekolah.',
      'Absensi manual dipakai untuk sakit, izin, atau alfa.',
      'Rekap bulanan langsung siap dilihat dan diekspor.',
    ];

    const audiences = [
      { title: 'Super Admin', desc: 'Kelola sekolah, subscription, dan reset akses admin sekolah.' },
      { title: 'Admin Sekolah', desc: 'Pantau guru, data siswa, dan laporan absensi bulanan.' },
      { title: 'Guru Kelas', desc: 'Scan QR, input manual, dan lihat riwayat absensi hari ini.' },
    ];

    const faqs = [
      {
        q: 'Apakah Absensi Premium mendukung rekap bulanan?',
        a: 'Ya. Admin bisa memilih bulan, tahun, dan kelas untuk melihat rekap per tanggal secara dinamis.',
      },
      {
        q: 'Apakah siswa punya username dan password sendiri?',
        a: 'Ya. Sistem membuat username, password awal, dan QR unik untuk setiap siswa.',
      },
      {
        q: 'Bisakah data diekspor?',
        a: 'Bisa. Laporan bisa diunduh untuk kebutuhan arsip atau distribusi internal.',
      },
    ];

    const toneClasses: Record<'emerald' | 'blue' | 'rose', { box: string; label: string; value: string }> = {
      emerald: {
        box: 'border-emerald-500/20 bg-emerald-500/10',
        label: 'text-emerald-300',
        value: 'text-emerald-100',
      },
      blue: {
        box: 'border-blue-500/20 bg-blue-500/10',
        label: 'text-blue-300',
        value: 'text-blue-100',
      },
      rose: {
        box: 'border-rose-500/20 bg-rose-500/10',
        label: 'text-rose-300',
        value: 'text-rose-100',
      },
    };
    const heroMetrics: Array<[string, string, 'emerald' | 'blue' | 'rose']> = [
      ['Hadir', '24', 'emerald'],
      ['Izin', '3', 'blue'],
      ['Alfa', '1', 'rose'],
    ];

    const activePlans = [...pricingPlans].filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

    const handleChoosePlan = (plan: PricingPlan) => {
      const rawNumber = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');
      if (!rawNumber) {
        showToast('Nomor WhatsApp belum diatur. Silakan hubungi admin sistem.', 'error');
        return;
      }
      const template = siteSettings.whatsappMessageTemplate || 'Halo, saya tertarik dengan paket {paket} Absensi Premium.';
      const message = template.replace(/\{paket\}/g, plan.name);
      window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    };

    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-18 items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/25">
                  GP
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 font-display tracking-tight uppercase">
                    Absensi Premium
                  </div>
                  <div className="text-[11px] font-bold tracking-[0.22em] text-indigo-500 uppercase">
                    Administrasi Guru
                  </div>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
                <a href="#fitur" className="hover:text-slate-900 transition">Fitur</a>
                <a href="#modul" className="hover:text-slate-900 transition">Modul</a>
                <a href="#harga" className="hover:text-slate-900 transition">Harga</a>
                <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  <Key className="w-4 h-4" />
                  Masuk
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
                >
                  Buka Aplikasi
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden bg-white border-b border-slate-200">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-indigo-200/40 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-24 w-[24rem] h-[24rem] rounded-full bg-sky-200/40 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
                <div className="space-y-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Absensi sekolah, QR, rekap, dan akademik dalam satu sistem
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.05]">
                      Absensi Sekolah,
                      <span className="block bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
                        Rapi &amp; Modern.
                      </span>
                    </h1>
                    <p className="max-w-2xl text-base sm:text-lg text-slate-600 leading-8">
                      Sistem administrasi sekolah untuk absensi digital, rekap bulanan, data guru dan siswa, serta
                      pengelolaan akademik yang rapi dan mudah dipakai.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                    >
                      Masuk ke Sistem
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href="#harga"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      Lihat Harga
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      ['QR Scan', 'Cepat dan konsisten'],
                      ['Manual', 'Untuk sakit/izin/alfa'],
                      ['Rekap Bulan', 'Dinamis per kelas'],
                      ['Ekspor', 'CSV dan PDF'],
                    ].map(([title, desc]) => (
                      <div key={title} className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm p-4">
                        <div className="text-sm font-bold text-slate-900">{title}</div>
                        <div className="text-xs text-slate-500 mt-1 leading-5">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 shadow-2xl shadow-slate-900/20">
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5 text-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-300">Preview Dashboard</div>
                        <div className="text-xl font-extrabold font-display mt-1">Absensi Perbulan</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                        Juli 2026
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {heroMetrics.map(([label, value, tone]) => (
                        <div key={label} className={`rounded-xl border p-3 ${toneClasses[tone].box}`}>
                          <div className={`text-[10px] uppercase font-bold ${toneClasses[tone].label}`}>{label}</div>
                          <div className={`text-2xl font-extrabold mt-1 ${toneClasses[tone].value}`}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-700 overflow-hidden">
                      <div className="grid grid-cols-6 bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400">
                        {['No', 'Nama', '1', '2', '3', 'Total'].map((item) => (
                          <div key={item} className="px-3 py-2 border-r border-slate-700 last:border-r-0">
                            {item}
                          </div>
                        ))}
                      </div>
                      {[
                        ['1', 'Aditya Pratama', 'H', 'H', '-', '24'],
                        ['2', 'Bunga Lestari', 'H', 'A', 'H', '22'],
                        ['3', 'Cahya Ramadhan', 'H', 'H', 'I', '22'],
                      ].map((row) => (
                        <div key={row[0]} className="grid grid-cols-6 text-sm text-slate-200 border-t border-slate-700">
                          {row.map((cell, index) => (
                            <div key={`${row[0]}-${index}`} className="px-3 py-3 border-r border-slate-700 last:border-r-0">
                              {cell}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="fitur" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">Fitur Utama</div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">Dibangun untuk pekerjaan harian sekolah</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-base font-bold text-slate-900">{item.title}</div>
                    <p className="text-sm text-slate-600 mt-2 leading-6">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="modul" className="border-y border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">Modul</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">Satu sistem, banyak pekerjaan selesai</h2>
                  <p className="text-sm text-slate-600 mt-3 leading-7">
                    Absensi Premium merangkum operasional harian sekolah ke dalam beberapa modul yang saling terhubung.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {modules.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-base font-bold text-slate-900">{item.title}</div>
                      <p className="text-sm text-slate-600 mt-2 leading-6">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="harga" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">Harga</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">Pilih paket yang sesuai kebutuhan sekolah</h2>
              <p className="text-sm text-slate-600 mt-3 leading-7">
                Klik salah satu paket untuk langsung terhubung dengan tim kami via WhatsApp.
              </p>
            </div>

            {activePlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
                Paket berlangganan belum tersedia. Silakan hubungi Super Admin.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 items-stretch">
                {activePlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
                      plan.isHighlighted
                        ? 'border-indigo-600 bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 md:-translate-y-2'
                        : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {plan.isHighlighted && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-wide shadow-md">
                        <Star className="w-3 h-3" />
                        Paling Populer
                      </span>
                    )}

                    <div className={`text-xs font-bold uppercase tracking-[0.22em] ${plan.isHighlighted ? 'text-indigo-300' : 'text-indigo-500'}`}>
                      {plan.name}
                    </div>
                    <p className={`text-sm mt-2 leading-6 ${plan.isHighlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold font-display ${plan.isHighlighted ? 'text-white' : 'text-slate-900'}`}>
                        Rp{plan.price}
                      </span>
                      <span className={`text-sm font-semibold ${plan.isHighlighted ? 'text-slate-400' : 'text-slate-400'}`}>
                        {plan.period}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.isHighlighted ? 'text-indigo-300' : 'text-indigo-500'}`} />
                          <span className={plan.isHighlighted ? 'text-slate-200' : 'text-slate-600'}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleChoosePlan(plan)}
                      className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition ${
                        plan.isHighlighted
                          ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                      id={`choose-plan-${plan.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Pilih Paket Ini
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="alur" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">Alur Kerja</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">Alur yang singkat dan jelas</h2>
            <div className="grid gap-4 mt-6 lg:grid-cols-4">
              {workflows.map((item, index) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-700 mt-4 leading-6">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
              <div className="grid gap-6 lg:grid-cols-3">
                {audiences.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
                    <div className="text-base font-bold">{item.title}</div>
                    <p className="text-sm text-slate-300 mt-2 leading-6">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-500">FAQ</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">Pertanyaan yang biasanya muncul</h2>
            <div className="grid gap-4 mt-6">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="font-bold text-slate-900">{item.q}</div>
                  <p className="text-sm text-slate-600 mt-2 leading-6">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
            <div className="rounded-3xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-8 sm:px-10 sm:py-10 text-white">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-100">Mulai</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display mt-3 leading-tight">
                    Masuk ke Absensi Premium dan lihat dashboard sekolah Anda.
                  </h2>
                  <p className="text-sm text-indigo-100 mt-4 leading-7 max-w-xl">
                    Cocok untuk sekolah yang butuh absensi cepat, rekap bulanan yang rapi, dan pengelolaan data yang mudah diaudit.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition"
                    >
                      Buka Aplikasi
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href="#harga"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-semibold hover:bg-white/15 transition"
                    >
                      Lihat Harga
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-10 sm:py-10 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Ringkasan Produk</div>
                  <div className="grid grid-cols-1 gap-4 mt-5">
                    {[
                      { icon: MonitorSmartphone, title: 'Akses Web', text: 'Dipakai langsung dari browser tanpa instalasi khusus.' },
                      { icon: BadgeCheck, title: 'Peran Berlapis', text: 'Hak akses dipisah untuk super admin, admin, dan guru.' },
                      { icon: Globe2, title: 'Siap Multi Sekolah', text: 'Cocok untuk satu sekolah atau banyak sekolah dalam satu sistem.' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <p className="text-sm text-slate-600 mt-1 leading-6">{item.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <footer className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">GP</div>
                <div>
                  <div className="font-bold text-slate-900">Absensi Premium</div>
                  <div>Administrasi Guru Premium</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>Absensi digital QR</span>
                <span>Rekap bulanan</span>
                <span>Manajemen sekolah</span>
              </div>
            </footer>
          </section>
        </main>
      </div>
    );
  };

  // Main UI Screen Route Router based on active tab
  const renderTabContent = () => {
    if (dataLoading && activeTab === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 text-sm mt-3 font-medium">Memuat data sinkronisasi relasional...</p>
        </div>
      );
    }

    if (activeTab === 'password') {
      return renderPasswordChangeView();
    }

    if (user?.role === 'super_admin') {
      if (activeTab === 'dashboard') return renderSuperAdminDashboard();
      if (activeTab === 'schools') return renderSchoolsView();
      if (activeTab === 'pricing') return renderPricingSettingsView();
    }

    if (user?.role === 'admin') {
      if (activeTab === 'dashboard') return renderSchoolAdminDashboard();
      if (activeTab === 'teachers') return renderTeachersView();
    }

    if (user?.role === 'teacher') {
      if (activeTab === 'dashboard') return renderSchoolAdminDashboard(); // uses same stats layout
      if (activeTab === 'classes') return renderClassesView();
      if (activeTab === 'students') return renderStudentsView();
      if (activeTab === 'scan') return renderTeacherScanView();
      if (activeTab === 'attendance') return renderMonthlyAttendanceView();
      if (activeTab === 'academic') return <AcademicModule user={user} classes={classes} teachers={teachers} token={token} />;
    }

    return (
      <div className="text-center py-12 text-slate-400">
        Menu "{activeTab}" sedang dalam proses konstruksi.
      </div>
    );
  };


  // --- MAIN LAYOUT RENDER ---

  // Auth Loading
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-300">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/20 mb-4 animate-bounce">
          GP
        </div>
        <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs mt-3 tracking-widest font-mono">MEMVERIFIKASI SESI...</p>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    if (location.pathname !== '/login') {
      return renderLandingPage();
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased relative overflow-hidden">
        {/* Subtle decorative grid/glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/30 mb-4">
            GP
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Administrasi Guru Premium
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
            Sistem administrasi guru, tahun ajaran, bobot penilaian, dan rekap nilai modern
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="bg-slate-900 py-8 px-6 shadow-xl border border-slate-800/80 rounded-3xl sm:px-10">
            {loginError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-semibold flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Username Akun
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan username..."
                  id="login-username"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
                    aria-label={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full cursor-pointer flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all disabled:bg-slate-800 disabled:text-slate-500"
                  id="login-submit-btn"
                >
                  {isLoggingIn ? 'Memvalidasi...' : 'Masuk ke Dashboard'}
                </button>
              </div>
            </form>


          </div>
        </div>
      </div>
    );
  }

  // Active Authenticated Layout
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-600">
      {/* Toast Alert */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg max-w-sm flex items-start gap-3 ${alertMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : alertMessage.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-800'}`}
          >
            {alertMessage.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            ) : (
              <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${alertMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            )}
            <span className="text-xs font-semibold">{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Nav */}
      {renderSidebar()}

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {renderNavbar()}

        <main className="flex-1 px-4 py-5 sm:px-5 lg:px-6 space-y-6 overflow-y-auto w-full">
          {renderTabContent()}
        </main>
      </div>


      {/* --- ALL MODALS SECTIONS --- */}

      {/* 1. Super Admin: Add School Modal */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Daftarkan Sekolah Baru</h3>
              <button onClick={() => {
                setCreatedSchoolAdmin(null);
                setIsAddSchoolModalOpen(false);
              }} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdSchoolAdmin ? (
              <div className="flex-1 min-h-0 space-y-4 text-xs overflow-y-auto pr-1">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider mb-2">Sekolah berhasil dibuat</div>
                  <div className="text-sm font-semibold text-slate-800 mb-3">{createdSchoolAdmin.schoolName}</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="rounded-lg bg-white border border-emerald-100 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Nama Admin</div>
                      <div className="text-sm font-semibold text-slate-800">{createdSchoolAdmin.adminName}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-emerald-100 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Username</div>
                      <div className="text-sm font-mono font-semibold text-slate-800">{createdSchoolAdmin.username}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-emerald-100 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Password</div>
                      <div className="text-sm font-mono font-semibold text-slate-800">{createdSchoolAdmin.password}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSchoolAdmin(null);
                      setIsAddSchoolModalOpen(false);
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddSchool} className="flex-1 min-h-0 space-y-4 text-xs overflow-y-auto pr-1">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Sekolah</label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    placeholder="Contoh: SMA Negeri 1 Bandung"
                    id="modal-school-name"
                  />
                </div>

                <div>
                  <SchoolAddressPicker value={schoolAddress} onChange={setSchoolAddress} />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Paket Berlangganan</label>
                  <select
                    value={schoolPlan}
                    onChange={(e) => setSchoolPlan(e.target.value as SubscriptionPlan)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-school-plan"
                  >
                    <option value="bulanan">Paket Bulanan</option>
                    <option value="tahunan">Paket Tahunan</option>
                    <option value="selamanya">Paket Selamanya (Lifetime)</option>
                  </select>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                  <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider block">Akun Admin Sekolah</span>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Admin</label>
                    <input
                      type="text"
                      required
                      value={schoolAdminName}
                      onChange={(e) => setSchoolAdminName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                      placeholder="Nama lengkap admin sekolah..."
                      id="modal-school-admin-name"
                    />
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                    Username dan password admin akan dibuat otomatis setelah sekolah disimpan.
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedSchoolAdmin(null);
                      setIsAddSchoolModalOpen(false);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                    id="modal-school-submit"
                  >
                    {actionLoading ? 'Menyimpan...' : 'Daftarkan Sekolah'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Super Admin: Edit School Modal */}
      {isEditSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Edit Data & Status Sekolah</h3>
              <button onClick={() => setIsEditSchoolModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSchool} className="flex-1 min-h-0 space-y-4 text-xs overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Sekolah</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-school-name"
                />
              </div>

              <div>
                <SchoolAddressPicker value={schoolAddress} onChange={setSchoolAddress} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Paket Berlangganan</label>
                  <select
                    value={schoolPlan}
                    onChange={(e) => setSchoolPlan(e.target.value as SubscriptionPlan)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-edit-school-plan"
                  >
                    <option value="bulanan">Paket Bulanan</option>
                    <option value="tahunan">Paket Tahunan</option>
                    <option value="selamanya">Paket Selamanya (Lifetime)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Status Aktif</label>
                  <select
                    value={schoolStatus}
                    onChange={(e) => setSchoolStatus(e.target.value as SubscriptionStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-edit-school-status"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {schoolPasswordReset && schoolPasswordReset.schoolName === selectedSchool?.name && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Password admin berhasil direset</div>
                      <div className="text-sm font-semibold text-slate-800">{schoolPasswordReset.schoolName}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 uppercase">
                      Simpan sekarang
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white border border-emerald-100 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Nama Admin</div>
                      <div className="text-sm font-semibold text-slate-800 break-words">{schoolPasswordReset.adminName}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-emerald-100 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Username</div>
                      <div className="text-sm font-mono font-semibold text-slate-800 break-all">{schoolPasswordReset.username}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-emerald-100 p-3 sm:col-span-2">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Password Baru</div>
                      <div className="text-sm font-mono font-semibold text-slate-800 break-all">{schoolPasswordReset.password}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSchoolPasswordReset(null);
                    setIsEditSchoolModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => void handleResetSchoolPassword()}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-reset-school-password"
                >
                  Reset Password
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-edit-school-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2b. Super Admin: Add Pricing Plan Modal */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Tambah Paket Berlangganan</h3>
              <button onClick={() => setIsAddPlanModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPricingPlan} className="flex-1 min-h-0 space-y-4 text-xs overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  placeholder="Contoh: Tahunan"
                  id="modal-plan-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Harga (Rp)</label>
                  <input
                    type="text"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    placeholder="1.200.000"
                    id="modal-plan-price"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Periode</label>
                  <input
                    type="text"
                    required
                    value={planPeriod}
                    onChange={(e) => setPlanPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    placeholder="/ tahun"
                    id="modal-plan-period"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  placeholder="Cocok untuk sekolah yang..."
                  id="modal-plan-description"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Fitur (satu per baris)</label>
                <textarea
                  value={planFeaturesText}
                  onChange={(e) => setPlanFeaturesText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 resize-none"
                  placeholder={'Absensi QR & manual\nRekap bulanan\nDukungan WhatsApp'}
                  id="modal-plan-features"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Urutan Tampil</label>
                  <input
                    type="number"
                    value={planSortOrder}
                    onChange={(e) => setPlanSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-plan-sort"
                  />
                </div>
                <div className="flex flex-col gap-2 justify-end">
                  <label className="inline-flex items-center gap-2 text-slate-600 font-semibold">
                    <input type="checkbox" checked={planIsHighlighted} onChange={(e) => setPlanIsHighlighted(e.target.checked)} id="modal-plan-highlight" />
                    Tandai unggulan
                  </label>
                  <label className="inline-flex items-center gap-2 text-slate-600 font-semibold">
                    <input type="checkbox" checked={planIsActive} onChange={(e) => setPlanIsActive(e.target.checked)} id="modal-plan-active" />
                    Tayangkan di landing page
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-plan-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2c. Super Admin: Edit Pricing Plan Modal */}
      {isEditPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Edit Paket Berlangganan</h3>
              <button onClick={() => setIsEditPlanModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPricingPlan} className="flex-1 min-h-0 space-y-4 text-xs overflow-y-auto pr-1">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-plan-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Harga (Rp)</label>
                  <input
                    type="text"
                    required
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-edit-plan-price"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Periode</label>
                  <input
                    type="text"
                    required
                    value={planPeriod}
                    onChange={(e) => setPlanPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-edit-plan-period"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-plan-description"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Fitur (satu per baris)</label>
                <textarea
                  value={planFeaturesText}
                  onChange={(e) => setPlanFeaturesText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 resize-none"
                  id="modal-edit-plan-features"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Urutan Tampil</label>
                  <input
                    type="number"
                    value={planSortOrder}
                    onChange={(e) => setPlanSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="modal-edit-plan-sort"
                  />
                </div>
                <div className="flex flex-col gap-2 justify-end">
                  <label className="inline-flex items-center gap-2 text-slate-600 font-semibold">
                    <input type="checkbox" checked={planIsHighlighted} onChange={(e) => setPlanIsHighlighted(e.target.checked)} id="modal-edit-plan-highlight" />
                    Tandai unggulan
                  </label>
                  <label className="inline-flex items-center gap-2 text-slate-600 font-semibold">
                    <input type="checkbox" checked={planIsActive} onChange={(e) => setPlanIsActive(e.target.checked)} id="modal-edit-plan-active" />
                    Tayangkan di landing page
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-edit-plan-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. School Admin: Add Class Modal */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Tambah Kelas Baru</h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  placeholder="Contoh: Kelas X-A atau XI-IPS 1"
                  id="modal-class-name"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-class-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. School Admin: Edit Class Modal */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Edit Nama Kelas</h3>
              <button onClick={() => setIsEditClassModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-class-name"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-edit-class-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. School Admin: Add Teacher Modal */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Tambah Akun Guru Baru</h3>
              <button onClick={() => setIsAddTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Lengkap Guru</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  placeholder="Contoh: Dra. Herlina Siregar"
                  id="modal-teacher-name"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 leading-relaxed">
                Username dan password guru akan digenerate otomatis oleh sistem berdasarkan nama yang Anda masukkan.
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-teacher-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. School Admin: Edit Teacher Modal */}
      {isEditTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Edit Akun Guru</h3>
              <button onClick={() => setIsEditTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Guru</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-teacher-name"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="block text-slate-500 font-bold mb-1 uppercase">Reset Password (Opsional)</label>
                <div className="relative mt-1">
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    placeholder="Kosongkan jika tidak diubah..."
                    id="modal-edit-teacher-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
                    aria-label={showTeacherPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTeacherModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-edit-teacher-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6b. School Admin: Teacher Detail Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-800">Detail Kredensial Guru</h3>
                <p className="text-xs text-slate-500 mt-1">Password awal tersimpan dari saat akun pertama dibuat.</p>
              </div>
              <button onClick={() => setViewingTeacher(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Nama Guru</div>
                <div className="text-sm font-semibold text-slate-800">{viewingTeacher.name}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Username</div>
                <div className="text-sm font-mono font-semibold text-slate-800 break-all">{viewingTeacher.username}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Password Awal</div>
                <div className="text-sm font-mono font-semibold text-slate-800 break-all">{viewingTeacher.initialPassword || '-'}</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 leading-relaxed">
                Gunakan data ini untuk login pertama kali. Jika password sudah direset, password awal tetap terlihat di sini.
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTeacher(viewingTeacher);
                  setTeacherName(viewingTeacher.name);
                  setTeacherPassword('');
                  setViewingTeacher(null);
                  setIsEditTeacherModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setViewingTeacher(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. School Admin: Add Student Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Daftarkan Siswa Baru</h3>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  placeholder="Nama lengkap siswa..."
                  id="modal-student-name"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nomor NISN</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 font-mono"
                  placeholder="Masukkan 10 digit NISN..."
                  id="modal-student-nisn"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Kelas</label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-student-class"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 leading-relaxed font-medium">
                Sistem akan otomatis me-generate username, password awal, dan kartu QR unik saat siswa berhasil disimpan.
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-student-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. School Admin: Edit Student Modal */}
      {isEditStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Edit Data Siswa</h3>
              <button onClick={() => setIsEditStudentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Siswa</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-student-name"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">NISN</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={studentNisn}
                  onChange={(e) => setStudentNisn(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 font-mono"
                  id="modal-edit-student-nisn"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Kelas</label>
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-edit-student-class"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-edit-student-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8b. School Admin: Promote Students Modal */}
      {isPromoteStudentsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-800">Kenaikan Kelas</h3>
                <p className="text-xs text-slate-500 mt-1">Pilih siswa dari kelas asal untuk dipindahkan ke kelas tujuan.</p>
              </div>
              <button onClick={() => setIsPromoteStudentsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePromoteStudents} className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Kelas Asal</label>
                  <select
                    value={promoteFromClassId}
                    onChange={(e) => setPromoteFromClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="promote-from-class"
                  >
                    <option value="">-- Pilih Kelas Asal --</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1 uppercase">Kelas Tujuan</label>
                  <select
                    value={promoteTargetClassId}
                    onChange={(e) => setPromoteTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                    id="promote-target-class"
                  >
                    <option value="">-- Pilih Kelas Tujuan --</option>
                    {classes
                      .filter((item) => item.id !== promoteFromClassId)
                      .map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  {getPromoteStudentCandidates().length} siswa di kelas asal, {selectedPromoteStudentIds.length} dipilih
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const candidateIds = getPromoteStudentCandidates().map((student) => student.id);
                    const isAllSelected = candidateIds.length > 0 && candidateIds.every((id) => selectedPromoteStudentIds.includes(id));
                    setSelectedPromoteStudentIds(isAllSelected ? [] : candidateIds);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-bold"
                  id="btn-toggle-select-promote-students"
                >
                  {getPromoteStudentCandidates().length > 0 && getPromoteStudentCandidates().every((student) => selectedPromoteStudentIds.includes(student.id))
                    ? 'Batal Pilih Semua'
                    : 'Pilih Semua'}
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {getPromoteStudentCandidates().length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    Belum ada siswa pada kelas asal yang dipilih.
                  </div>
                ) : (
                  getPromoteStudentCandidates().map((student) => (
                    <label key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPromoteStudentIds.includes(student.id)}
                        onChange={(e) => {
                          setSelectedPromoteStudentIds((current) =>
                            e.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id)
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{student.nisn} • {student.username || '-'}</div>
                      </div>
                      <div className="text-xs font-semibold text-slate-400">{student.className}</div>
                    </label>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoteStudentsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || selectedPromoteStudentIds.length === 0}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl disabled:bg-slate-200 disabled:text-slate-400"
                  id="modal-promote-students-submit"
                >
                  {actionLoading ? 'Memproses...' : 'Naikkan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8c. School Admin: Student Detail Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 p-6 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-800">Detail Akun Siswa</h3>
                <p className="text-xs text-slate-500 mt-1">Username, password awal, dan QR siswa tersimpan otomatis.</p>
              </div>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Nama Siswa</div>
                <div className="text-sm font-semibold text-slate-800">{viewingStudent.name}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Kelas</div>
                <div className="text-sm font-semibold text-slate-800">{viewingStudent.className}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">NISN</div>
                <div className="text-sm font-mono font-semibold text-slate-800">{viewingStudent.nisn}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Username</div>
                <div className="text-sm font-mono font-semibold text-slate-800 break-all">{viewingStudent.username || '-'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase text-slate-400">Password Awal</div>
                <div className="text-sm font-mono font-semibold text-slate-800 break-all">{viewingStudent.initialPassword || '-'}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(viewingStudent);
                  setStudentName(viewingStudent.name);
                  setStudentNisn(viewingStudent.nisn);
                  setStudentClassId(viewingStudent.classId);
                  setViewingStudent(null);
                  setIsEditStudentModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                Edit Data
              </button>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Viewing QR Code Digital Card Modal */}
      {viewingQRStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-xl border border-slate-100 p-6 relative">
            <button
              onClick={() => setViewingQRStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              id="close-qr-modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-center text-sm font-extrabold font-display text-slate-800 mb-6 uppercase tracking-wider">
              Preview Kartu Siswa
            </h3>

            <StudentQRCard
              student={viewingQRStudent}
              schoolName={school?.name || 'Absensi Premium'}
            />
          </div>
        </div>
      )}

      {/* 10. Manual Attendance Input Modal */}
      {isManualAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-display text-slate-800">Catat Absensi Manual</h3>
              <button onClick={() => setIsManualAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Pilih Siswa</label>
                <input
                  type="text"
                  value={manualStudentSearch}
                  onChange={(e) => setManualStudentSearch(e.target.value)}
                  placeholder="Cari nama siswa, NISN, atau kelas..."
                  className="w-full px-3 py-2 mb-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                />
                <select
                  required
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-manual-student"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students
                    .filter((s) => {
                      const query = manualStudentSearch.trim().toLowerCase();
                      if (!query) return true;
                      return (
                        s.name.toLowerCase().includes(query) ||
                        s.nisn.toLowerCase().includes(query) ||
                        s.className.toLowerCase().includes(query)
                      );
                    })
                    .map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nisn}) - {s.className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Status Kehadiran</label>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {(['hadir', 'sakit', 'izin', 'alfa'] as const).map((status) => {
                    const colors = {
                      hadir: 'peer-checked:bg-emerald-500 peer-checked:text-white border-emerald-100 hover:bg-emerald-50 text-emerald-800',
                      sakit: 'peer-checked:bg-amber-500 peer-checked:text-white border-amber-100 hover:bg-amber-50 text-amber-800',
                      izin: 'peer-checked:bg-blue-500 peer-checked:text-white border-blue-100 hover:bg-blue-50 text-blue-800',
                      alfa: 'peer-checked:bg-rose-500 peer-checked:text-white border-rose-100 hover:bg-rose-50 text-rose-800'
                    };
                    return (
                      <label key={status} className="cursor-pointer relative">
                        <input
                          type="radio"
                          name="modal-manual-status"
                          value={status}
                          checked={manualStatus === status}
                          onChange={() => setManualStatus(status)}
                          className="sr-only peer"
                        />
                        <span className={`py-2 border rounded-xl text-xs font-semibold capitalize block transition-all ${colors[status]}`}>
                          {status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Tanggal Absensi</label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  id="modal-manual-date"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualAttendanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !manualStudentId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:bg-slate-200"
                  id="modal-manual-submit"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan Absensi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
