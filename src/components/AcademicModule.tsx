import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  SlidersHorizontal, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  FileText, 
  Check, 
  X, 
  Printer, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { 
  Class as ClassType, 
  Student as StudentType, 
  User as UserType, 
  Subject, 
  AcademicYear, 
  AssessmentWeight, 
  Assessment, 
  StudentGrade 
} from '../types';
import { apiFetch } from '../lib/api';

interface AcademicModuleProps {
  user: UserType;
  classes: ClassType[];
  teachers: UserType[];
  token: string | null;
}

export default function AcademicModule({ user, classes, teachers, token }: AcademicModuleProps) {
  const fetch = apiFetch;

  // --- SUB TAB SYSTEM ---
  const [activeSubTab, setActiveSubTab] = useState<'subjects' | 'years' | 'weights' | 'input' | 'recap'>('subjects');

  // --- STATE FOR CRUD DATA ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [weights, setWeights] = useState<AssessmentWeight[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [students, setStudents] = useState<StudentType[]>([]);

  // Loading and alerts
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- FORM STATES ---
  // Subject Form
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacherName, setSubjectTeacherName] = useState('');
  const [subjectClassId, setSubjectClassId] = useState('');
  const [subjectIsActive, setSubjectIsActive] = useState(true);

  // Academic Year Form
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearName, setYearName] = useState('');
  const [yearIsActive, setYearIsActive] = useState(false);

  // Assessment Weight Form
  const [weightNh, setWeightNh] = useState<string>('60');
  const [weightPas, setWeightPas] = useState<string>('40');
  const [weightSubjectId, setWeightSubjectId] = useState('');

  // Input Nilai (Grades Input) Filter & Entry States
  const [inputYearId, setInputYearId] = useState('');
  const [inputSemester, setInputSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [inputClassId, setInputClassId] = useState('');
  const [inputSubjectId, setInputSubjectId] = useState('');
  const [inputCategory, setInputCategory] = useState<'nh' | 'pas'>('nh');
  const [selectedNhId, setSelectedNhId] = useState<string>('');
  const [showInlineAddNh, setShowInlineAddNh] = useState(false);
  
  // Grade scoring form
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({}); // studentId -> value
  const [isAddAssessmentModalOpen, setIsAddAssessmentModalOpen] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [newAssessmentCategory, setNewAssessmentCategory] = useState<'nh' | 'pas'>('nh');
  const [newAssessmentDate, setNewAssessmentDate] = useState(new Date().toISOString().split('T')[0]);

  // Recap Filter States
  const [recapYearId, setRecapYearId] = useState('');
  const [recapSemester, setRecapSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [recapClassId, setRecapClassId] = useState('');
  const [recapSubjectId, setRecapSubjectId] = useState('');
  const [recapData, setRecapData] = useState<{
    weights: AssessmentWeight[];
    assessments: Assessment[];
    students: any[];
    grades: StudentGrade[];
  } | null>(null);

  // --- API HEADER GENERATION ---
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  // --- INITIAL DATA FETCHING ---
  const fetchAllAcademicData = async () => {
    setIsLoading(true);
    try {
      // Fetch subjects
      const subRes = await fetch('/api/academic/subjects', { headers: getHeaders() });
      if (subRes.ok) setSubjects(await subRes.json());

      // Fetch academic years
      const yearRes = await fetch('/api/academic/academic-years', { headers: getHeaders() });
      if (yearRes.ok) {
        const yearsData: AcademicYear[] = await yearRes.json();
        setAcademicYears(yearsData);
        // Default select active year
        const activeY = yearsData.find(y => y.isActive);
        if (activeY) {
          setInputYearId(activeY.id);
          setRecapYearId(activeY.id);
        } else if (yearsData.length > 0) {
          setInputYearId(yearsData[0].id);
          setRecapYearId(yearsData[0].id);
        }
      }

      // Fetch standard students
      const studRes = await fetch('/api/admin/students', { headers: getHeaders() });
      if (studRes.ok) setStudents(await studRes.json());

      // Fetch general assessments
      const assRes = await fetch('/api/academic/assessments', { headers: getHeaders() });
      if (assRes.ok) setAssessments(await assRes.json());

    } catch (error) {
      console.error('Failed to load academic data:', error);
      showAlert('error', 'Gagal memuat beberapa data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAcademicData();
  }, [token]);

  useEffect(() => {
    if (subjects.length > 0 && !weightSubjectId) {
      setWeightSubjectId(subjects[0].id);
    }
  }, [subjects, weightSubjectId]);

  useEffect(() => {
    if (isSubjectModalOpen && !editingSubject && !subjectTeacherName && teachers.length > 0) {
      setSubjectTeacherName(teachers[0].name);
    }
  }, [isSubjectModalOpen, editingSubject, subjectTeacherName, teachers]);

  useEffect(() => {
    if (!weightSubjectId) return;

    const loadWeights = async () => {
      const res = await fetch(`/api/academic/weights?subjectId=${encodeURIComponent(weightSubjectId)}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const weightsData: AssessmentWeight[] = await res.json();
        setWeights(weightsData);
        const nhObj = weightsData.find((w) => w.code === 'nh');
        const pasObj = weightsData.find((w) => w.code === 'pas');
        if (nhObj) setWeightNh(nhObj.weight);
        if (pasObj) setWeightPas(pasObj.weight);
      }
    };

    loadWeights();
  }, [weightSubjectId, token]);

  // Handle class default selection
  useEffect(() => {
    if (classes.length > 0) {
      if (!inputClassId) setInputClassId(classes[0].id);
      if (!recapClassId) setRecapClassId(classes[0].id);
    }
  }, [classes]);

  // Filter subjects for the selected input class
  const filteredInputSubjects = subjects.filter(s => s.classId === inputClassId && s.isActive);
  useEffect(() => {
    if (filteredInputSubjects.length > 0) {
      setInputSubjectId(filteredInputSubjects[0].id);
    } else {
      setInputSubjectId('');
    }
  }, [inputClassId, subjects]);

  // Filter subjects for selected recap class
  const filteredRecapSubjects = subjects.filter(s => s.classId === recapClassId && s.isActive);
  useEffect(() => {
    if (filteredRecapSubjects.length > 0) {
      setRecapSubjectId(filteredRecapSubjects[0].id);
    } else {
      setRecapSubjectId('');
    }
  }, [recapClassId, subjects]);

  // Sync selected assessment based on input filters and category
  useEffect(() => {
    if (activeSubTab !== 'input' || !inputYearId || !inputSemester || !inputClassId || !inputSubjectId) {
      setSelectedAssessment(null);
      return;
    }

    if (inputCategory === 'pas') {
      const existingPas = assessments.find(a => 
        a.academicYearId === inputYearId &&
        a.semester === inputSemester &&
        a.classId === inputClassId &&
        a.subjectId === inputSubjectId &&
        a.categoryCode === 'pas'
      );

      if (existingPas) {
        if (selectedAssessment?.id !== existingPas.id) {
          handleSelectAssessmentForGrading(existingPas);
        }
      } else {
        // Auto create PAS in background
        const autoCreatePas = async () => {
          setIsLoading(true);
          try {
            const payload = {
              academicYearId: inputYearId,
              semester: inputSemester,
              classId: inputClassId,
              subjectId: inputSubjectId,
              categoryCode: 'pas',
              name: 'PAS',
              date: new Date().toISOString().split('T')[0]
            };
            const res = await fetch('/api/academic/assessments', {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const created: Assessment = await res.json();
              setAssessments(prev => {
                if (prev.some(a => a.id === created.id)) return prev;
                return [...prev, created];
              });
              handleSelectAssessmentForGrading(created);
            }
          } catch (err) {
            console.error('Failed to auto create PAS', err);
          } finally {
            setIsLoading(false);
          }
        };
        autoCreatePas();
      }
    } else {
      // NH (Nilai Harian)
      const currentNh = assessments.filter(a => 
        a.academicYearId === inputYearId &&
        a.semester === inputSemester &&
        a.classId === inputClassId &&
        a.subjectId === inputSubjectId &&
        a.categoryCode === 'nh'
      );

      if (currentNh.length > 0) {
        const found = currentNh.find(a => a.id === selectedNhId) || currentNh[0];
        if (selectedNhId !== found.id) {
          setSelectedNhId(found.id);
        }
        if (selectedAssessment?.id !== found.id) {
          handleSelectAssessmentForGrading(found);
        }
      } else {
        setSelectedNhId('');
        setSelectedAssessment(null);
      }
    }
  }, [
    activeSubTab,
    inputYearId,
    inputSemester,
    inputClassId,
    inputSubjectId,
    inputCategory,
    selectedNhId,
    assessments
  ]);

  // --- RECAP GENERATION API TRIGGER ---
  const fetchRecapReport = async () => {
    if (!recapYearId || !recapSemester || !recapClassId || !recapSubjectId) {
      setRecapData(null);
      return;
    }
    setIsLoading(true);
    try {
      const query = `academicYearId=${recapYearId}&semester=${recapSemester}&classId=${recapClassId}&subjectId=${recapSubjectId}`;
      const res = await fetch(`/api/academic/recap?${query}`, { headers: getHeaders() });
      if (res.ok) {
        setRecapData(await res.json());
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal memuat rekap nilai.');
      }
    } catch (err) {
      showAlert('error', 'Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger recap whenever recap filters change
  useEffect(() => {
    fetchRecapReport();
  }, [recapYearId, recapSemester, recapClassId, recapSubjectId, subjects]);

  // --- SUBJECTS ACTIONS (CRUD) ---
  const handleOpenSubjectModal = (sub: Subject | null = null) => {
    setEditingSubject(sub);
    if (sub) {
      setSubjectCode(sub.code);
      setSubjectName(sub.name);
      setSubjectTeacherName(sub.teacherName);
      setSubjectClassId(sub.classId);
      setSubjectIsActive(sub.isActive);
    } else {
      setSubjectCode('');
      setSubjectName('');
      setSubjectTeacherName(teachers[0]?.name || '');
      setSubjectClassId(classes[0]?.id || '');
      setSubjectIsActive(true);
    }
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !subjectTeacherName || !subjectClassId) {
      showAlert('error', 'Semua kolom wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        code: subjectCode.trim(),
        name: subjectName.trim(),
        teacherName: subjectTeacherName.trim(),
        classId: subjectClassId,
        isActive: subjectIsActive
      };

      const url = editingSubject ? `/api/academic/subjects/${editingSubject.id}` : '/api/academic/subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showAlert('success', editingSubject ? 'Mata pelajaran berhasil diperbarui.' : 'Mata pelajaran berhasil ditambahkan.');
        setIsSubjectModalOpen(false);
        fetchAllAcademicData();
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal menyimpan mata pelajaran.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini? Semua data penilaian dan nilai siswa yang terkait akan ikut terhapus!')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/academic/subjects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showAlert('success', 'Mata pelajaran berhasil dihapus.');
        fetchAllAcademicData();
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal menghapus mata pelajaran.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACADEMIC YEARS ACTIONS (CRUD) ---
  const handleOpenYearModal = (yr: AcademicYear | null = null) => {
    setEditingYear(yr);
    if (yr) {
      setYearName(yr.name);
      setYearIsActive(yr.isActive);
    } else {
      setYearName('');
      setYearIsActive(false);
    }
    setIsYearModalOpen(true);
  };

  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName) {
      showAlert('error', 'Tahun ajaran wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: yearName.trim(),
        isActive: yearIsActive
      };

      const url = editingYear ? `/api/academic/academic-years/${editingYear.id}` : '/api/academic/academic-years';
      const method = editingYear ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showAlert('success', editingYear ? 'Tahun ajaran berhasil diperbarui.' : 'Tahun ajaran berhasil ditambahkan.');
        setIsYearModalOpen(false);
        fetchAllAcademicData();
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal menyimpan tahun ajaran.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteYear = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus Tahun Ajaran ini?')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/academic/academic-years/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showAlert('success', 'Tahun ajaran berhasil dihapus.');
        fetchAllAcademicData();
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal menghapus tahun ajaran.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- WEIGHT SETTINGS ACTIONS ---
  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightSubjectId) {
      showAlert('error', 'Pilih mata pelajaran terlebih dahulu.');
      return;
    }
    const parsedNh = Number(weightNh);
    const parsedPas = Number(weightPas);
    if (Number.isNaN(parsedNh) || Number.isNaN(parsedPas)) {
      showAlert('error', 'Bobot harus berupa angka.');
      return;
    }
    if (parsedNh + parsedPas !== 100) {
      showAlert('error', 'Gagal! Total persentase bobot NH dan PAS harus tepat 100%.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/academic/weights', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          subjectId: weightSubjectId,
          weights: [
            { code: 'nh', weight: parsedNh },
            { code: 'pas', weight: parsedPas }
          ]
        })
      });

      if (res.ok) {
        showAlert('success', 'Bobot penilaian berhasil disimpan.');
        fetchAllAcademicData();
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal memperbarui bobot.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ASSESSMENTS & GRADES ACTIONS (INPUT NILAI) ---
  // Select assessment to load grading scores
  const handleSelectAssessmentForGrading = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    
    // Load student grades for this assessment
    setIsLoading(true);
    try {
      const res = await fetch('/api/academic/grades', { headers: getHeaders() });
      if (res.ok) {
        const allGrades: StudentGrade[] = await res.json();
        const assessmentGrades = allGrades.filter(g => g.assessmentId === assessment.id);
        
        // Populate scores mapping
        const inputs: Record<string, string> = {};
        students.filter(s => s.classId === inputClassId).forEach(student => {
          const match = assessmentGrades.find(g => g.studentId === student.id);
          inputs[student.id] = match ? String(match.value) : '';
        });
        setScoreInputs(inputs);
      }
    } catch (err) {
      showAlert('error', 'Gagal memuat nilai siswa.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save a new NH assessment (inline creation)
  const handleSaveNewNh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputYearId || !inputSemester || !inputClassId || !inputSubjectId || !newAssessmentName) {
      showAlert('error', 'Lengkapi seluruh data filter dan nama penilaian.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        academicYearId: inputYearId,
        semester: inputSemester,
        classId: inputClassId,
        subjectId: inputSubjectId,
        categoryCode: 'nh',
        name: newAssessmentName.trim(),
        date: newAssessmentDate
      };

      const res = await fetch('/api/academic/assessments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created: Assessment = await res.json();
        showAlert('success', 'NH Baru berhasil dibuat.');
        setShowInlineAddNh(false);
        setNewAssessmentName('');
        
        // Refresh local assessments list
        const assRes = await fetch('/api/academic/assessments', { headers: getHeaders() });
        if (assRes.ok) {
          const freshAssessments = await assRes.json();
          setAssessments(freshAssessments);
        }
        
        // Automatically select the newly created NH
        setSelectedNhId(created.id);
        handleSelectAssessmentForGrading(created);
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal membuat NH.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save student scores
  const handleSaveStudentScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;

    const gradesPayload = Object.entries(scoreInputs).map(([studentId, val]) => ({
      studentId,
      value: Math.max(0, Math.min(100, Number(val) || 0))
    }));

    setIsLoading(true);
    try {
      const res = await fetch('/api/academic/grades', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          assessmentId: selectedAssessment.id,
          grades: gradesPayload
        })
      });

      if (res.ok) {
        showAlert('success', 'Nilai siswa berhasil disimpan!');
        setSelectedAssessment(null);
        fetchAllAcademicData();
      } else {
        showAlert('error', 'Gagal menyimpan nilai.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new assessment (NH or PAS)
  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputYearId || !inputSemester || !inputClassId || !inputSubjectId || !newAssessmentName) {
      showAlert('error', 'Lengkapi seluruh data filter dan nama penilaian.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        academicYearId: inputYearId,
        semester: inputSemester,
        classId: inputClassId,
        subjectId: inputSubjectId,
        categoryCode: newAssessmentCategory,
        name: newAssessmentName.trim(),
        date: newAssessmentDate
      };

      const res = await fetch('/api/academic/assessments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created: Assessment = await res.json();
        showAlert('success', 'Aspek penilaian berhasil dibuat.');
        setIsAddAssessmentModalOpen(false);
        setNewAssessmentName('');
        fetchAllAcademicData();
        // Immediately load for grading
        handleSelectAssessmentForGrading(created);
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal membuat penilaian.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssessment = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus aspek penilaian "${name}" beserta seluruh nilai siswa di dalamnya?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/academic/assessments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showAlert('success', 'Penilaian berhasil dihapus.');
        if (selectedAssessment?.id === id) setSelectedAssessment(null);
        fetchAllAcademicData();
      } else {
        showAlert('error', 'Gagal menghapus penilaian.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setIsLoading(false);
    }
  };


  // --- LANDSCAPE PRINT FUNCTIONALITY FOR RECAP GRADES ---
  const handlePrintRecap = () => {
    window.print();
  };

  // --- EXCEL/CSV EXPORT FALLBACK FOR IFRAME SECURITY ---
  const handleDownloadRecapCSV = () => {
    if (!recapData || recapData.students.length === 0) return;

    const { assessments, students, grades, weights } = recapData;
    const nhAssessments = assessments.filter(a => a.categoryCode === 'nh');
    const pasAssessment = assessments.find(a => a.categoryCode === 'pas');

    let csvContent = 'No,Nama Siswa,NISN,Kelas';
    
    // Header for NHs
    nhAssessments.forEach((nh, idx) => {
      csvContent += `,NH ${idx + 1} (${nh.name})`;
    });
    csvContent += ',Rata-rata NH,PAS,Nilai Akhir\n';

    // Rows
    students.forEach((student, idx) => {
      let rowStr = `${idx + 1},"${student.name}","${student.nisn}","${student.className}"`;
      
      let totalNhSum = 0;
      let nhCount = 0;

      nhAssessments.forEach(nh => {
        const grade = grades.find(g => g.studentId === student.id && g.assessmentId === nh.id);
        const val = grade ? grade.value : 0;
        rowStr += `,${val}`;
        totalNhSum += val;
        nhCount++;
      });

      const avgNh = nhCount > 0 ? Math.round(totalNhSum / nhCount) : 0;
      
      const pasGrade = pasAssessment ? grades.find(g => g.studentId === student.id && g.assessmentId === pasAssessment.id) : null;
      const pasVal = pasGrade ? pasGrade.value : 0;

      const nhWeight = weights.find(w => w.code === 'nh')?.weight || 60;
      const pasWeight = weights.find(w => w.code === 'pas')?.weight || 40;
      const finalScore = Math.round((avgNh * nhWeight / 100) + (pasVal * pasWeight / 100));

      rowStr += `,${avgNh},${pasVal},${finalScore}\n`;
      csvContent += rowStr;
    });

    const activeSubjectName = subjects.find(s => s.id === recapSubjectId)?.name || 'Mata Pelajaran';
    const activeClassName = classes.find(c => c.id === recapClassId)?.name || 'Kelas';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_nilai_${activeSubjectName.replace(/\s+/g, '_')}_${activeClassName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // --- RENDER SECTIONS ---

  // 1. MATA PELAJARAN (SUBJECTS) SUB-VIEW
  const renderSubjectsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-800">Daftar Mata Pelajaran</h3>
            <p className="text-xs text-slate-500">Kelola kurikulum, kelas pengampu, dan guru penanggung jawab</p>
          </div>
          <button
            onClick={() => handleOpenSubjectModal(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            id="btn-add-subject"
          >
            <Plus className="w-4 h-4" />
            Tambah Mata Pelajaran
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Kode Mapel</th>
                  <th className="p-4">Nama Mata Pelajaran</th>
                  <th className="p-4">Guru Pengampu</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Belum ada mata pelajaran terdaftar. Silakan tambahkan baru.
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-slate-50/40">
                      <td className="p-4 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-mono text-xs font-bold text-slate-700">{sub.code}</td>
                      <td className="p-4 font-bold text-slate-800 font-display">{sub.name}</td>
                      <td className="p-4 text-slate-600">{sub.teacherName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md">
                          {sub.className || classes.find(c => c.id === sub.classId)?.name || 'Tanpa Kelas'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sub.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          {sub.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenSubjectModal(sub)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

  // 2. TAHUN AJARAN (ACADEMIC YEARS) TAB
  const renderYearsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-800">Daftar Tahun Ajaran</h3>
            <p className="text-xs text-slate-500">Atur periode pengajaran aktif. Hanya boleh ada satu Tahun Ajaran yang berstatus Aktif.</p>
          </div>
          <button
            onClick={() => handleOpenYearModal(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Tahun Ajaran
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">Tahun Ajaran</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {academicYears.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      Belum ada tahun ajaran terdaftar.
                    </td>
                  </tr>
                ) : (
                  academicYears.map((yr, idx) => (
                    <tr key={yr.id} className="hover:bg-slate-50/40">
                      <td className="p-4 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-800 font-display">{yr.name}</td>
                      <td className="p-4">
                        {yr.isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Aktif (Sedang Berjalan)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                            Tidak Aktif
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenYearModal(yr)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteYear(yr.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

  // 3. JENIS PENILAIAN / BOBOT TAB
  const renderWeightsTab = () => {
    const selectedWeightSubject = subjects.find((subject) => subject.id === weightSubjectId);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-800">Bobot Penilaian per Mata Pelajaran (%)</h3>
          <p className="text-xs text-slate-500">Tentukan persentase kontribusi Nilai Harian (NH) dan PAS untuk mapel yang dipilih.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-md">
          <form onSubmit={handleSaveWeights} className="space-y-4 text-xs font-semibold text-slate-600">
            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase">Mata Pelajaran</label>
              <select
                value={weightSubjectId}
                onChange={(e) => setWeightSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                disabled={subjects.length === 0}
              >
                <option value="">{subjects.length === 0 ? 'Belum ada data mapel' : 'Pilih mata pelajaran'}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - {classes.find((cls) => cls.id === subject.classId)?.name || 'Tanpa Kelas'}
                  </option>
                ))}
              </select>
              {selectedWeightSubject && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Bobot aktif untuk {selectedWeightSubject.name} {classes.find((cls) => cls.id === selectedWeightSubject.classId)?.name ? `di ${classes.find((cls) => cls.id === selectedWeightSubject.classId)?.name}` : ''}
                </p>
              )}
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3 mb-4">
              <InfoIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                Ketentuan: Total akumulasi bobot NH dan PAS untuk mapel ini harus tepat berjumlah <strong>100%</strong>.
              </p>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase">Bobot Nilai Harian / Tugas (NH) - %</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={weightNh}
                onChange={(e) => setWeightNh(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1 uppercase">Bobot Penilaian Akhir Semester (PAS) - %</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={weightPas}
                onChange={(e) => setWeightPas(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Total Bobot</span>
                <span className={`text-lg font-black ${Number(weightNh || 0) + Number(weightPas || 0) === 100 ? 'text-emerald-600' : 'text-rose-500 animate-pulse'}`}>
                  {Number(weightNh || 0) + Number(weightPas || 0)}% {Number(weightNh || 0) + Number(weightPas || 0) === 100 ? '✓ Valid' : '✗ Harus 100%'}
                </span>
              </div>
              <button
                type="submit"
                disabled={isLoading || !weightSubjectId}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition"
              >
                <Save className="w-4 h-4" />
                Simpan Bobot
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // 4. INPUT NILAI TAB (GRADES ENTRY)
  const renderInputTab = () => {
    // Current list of NH assessments for dropdown
    const currentNhAssessments = assessments.filter(a => 
      a.academicYearId === inputYearId &&
      a.semester === inputSemester &&
      a.classId === inputClassId &&
      a.subjectId === inputSubjectId &&
      a.categoryCode === 'nh'
    );

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-800">Pencatatan & Input Nilai</h3>
          <p className="text-xs text-slate-500">Lakukan pengisian nilai siswa berdasarkan tahun ajaran, kelas, mata pelajaran, dan kategori harian atau semester.</p>
        </div>

        {/* 5-Filter Selector Panel (1. Tahun Ajaran, 2. Semester, 3. Kelas, 4. Mata Pelajaran, 5. Kategori) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tahun Ajaran</label>
            <select
              value={inputYearId}
              onChange={(e) => setInputYearId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-indigo-500"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name} {y.isActive ? '(Aktif)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Semester</label>
            <select
              value={inputSemester}
              onChange={(e) => setInputSemester(e.target.value as 'ganjil' | 'genap')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-indigo-500"
            >
              <option value="ganjil">Semester Ganjil</option>
              <option value="genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kelas</label>
            <select
              value={inputClassId}
              onChange={(e) => setInputClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-indigo-500"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
            <select
              value={inputSubjectId}
              onChange={(e) => setInputSubjectId(e.target.value)}
              disabled={filteredInputSubjects.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {filteredInputSubjects.length === 0 ? (
                <option value="">-- Tidak ada mapel di kelas ini --</option>
              ) : (
                <>
                  <option value="">-- Pilih Mapel --</option>
                  {filteredInputSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kategori Penilaian</label>
            <select
              value={inputCategory}
              onChange={(e) => {
                setInputCategory(e.target.value as 'nh' | 'pas');
                setSelectedAssessment(null);
              }}
              className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-800 focus:outline-indigo-500"
            >
              <option value="nh">NH (Nilai Harian)</option>
              <option value="pas">PAS (Ujian Semester)</option>
            </select>
          </div>
        </div>

        {/* Selected View for Entry */}
        {inputYearId && inputSemester && inputClassId && inputSubjectId ? (
          <div className="space-y-6">
            
            {/* NH (Nilai Harian) Sub-control panel for selecting or adding new NH assessment */}
            {inputCategory === 'nh' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Pilih NH yang sudah ada:</label>
                    <select
                      value={selectedNhId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedNhId(val);
                        const found = assessments.find(a => a.id === val);
                        if (found) {
                          handleSelectAssessmentForGrading(found);
                        } else {
                          setSelectedAssessment(null);
                        }
                      }}
                      disabled={currentNhAssessments.length === 0}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-indigo-500 disabled:opacity-50"
                    >
                      <option value="">-- Pilih Harian --</option>
                      {currentNhAssessments.map(nh => (
                        <option key={nh.id} value={nh.id}>{nh.name} ({nh.date})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setNewAssessmentName(`NH ${currentNhAssessments.length + 1}`);
                      setNewAssessmentDate(new Date().toISOString().split('T')[0]);
                      setShowInlineAddNh(!showInlineAddNh);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {showInlineAddNh ? 'Batal Tambah' : 'Tambah NH Baru'}
                  </button>
                </div>

                {/* Inline NH Creation Form */}
                {showInlineAddNh && (
                  <form onSubmit={handleSaveNewNh} className="bg-slate-50 p-4 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Penilaian</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: NH 1, NH Bab 1, NH Bab 2"
                        value={newAssessmentName}
                        onChange={(e) => setNewAssessmentName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                      <input
                        type="date"
                        required
                        value={newAssessmentDate}
                        onChange={(e) => setNewAssessmentDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      {isLoading ? 'Menyimpan...' : 'Simpan NH'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Student Scores Input Table Form */}
            {selectedAssessment ? (
              <form onSubmit={handleSaveStudentScores} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-500">Tabel Input Nilai</span>
                    <h4 className="font-bold text-slate-800 text-base font-display mt-0.5">
                      {selectedAssessment.name} {selectedAssessment.categoryCode === 'nh' ? '(Nilai Harian)' : '(Penilaian Akhir Semester)'}
                    </h4>
                  </div>
                  {selectedAssessment && selectedAssessment.categoryCode === 'nh' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAssessment(selectedAssessment.id, selectedAssessment.name)}
                      className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus NH Ini
                    </button>
                  )}
                </div>

                {/* Table Layout of Students with Value Inputs */}
                <div className="overflow-hidden border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                        <th className="p-3.5 w-16 text-center">No</th>
                        <th className="p-3.5">NIS</th>
                        <th className="p-3.5">Nama Siswa</th>
                        <th className="p-3.5 w-32">Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {students.filter(s => s.classId === inputClassId).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-slate-400 text-xs font-semibold">
                            Belum ada siswa terdaftar di kelas ini.
                          </td>
                        </tr>
                      ) : (
                        students.filter(s => s.classId === inputClassId).map((student, idx) => (
                          <tr key={student.id} className="hover:bg-slate-50/40">
                            <td className="p-3.5 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-mono text-xs text-slate-500">{student.nisn}</td>
                            <td className="p-3.5 font-bold text-slate-800">{student.name}</td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  required
                                  value={scoreInputs[student.id] !== undefined ? scoreInputs[student.id] : ''}
                                  onChange={(e) => {
                                    setScoreInputs(prev => ({
                                      ...prev,
                                      [student.id]: e.target.value.replace(/\D/g, '')
                                    }));
                                  }}
                                  placeholder="0-100"
                                  className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-800 focus:outline-indigo-500 focus:bg-white"
                                />
                                <span className="text-xs font-semibold text-slate-400">/ 100</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Submit Action Button */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isLoading || students.filter(s => s.classId === inputClassId).length === 0}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-slate-400 text-xs">
                {inputCategory === 'nh' ? (
                  'Silakan pilih salah satu NH dari dropdown di atas atau tambahkan NH baru untuk menampilkan tabel nilai.'
                ) : (
                  'Menyiapkan aspek penilaian PAS untuk mata pelajaran ini...'
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-slate-400 text-xs">
            Silakan pilih seluruh filter (Tahun Ajaran, Semester, Kelas, dan Mata Pelajaran) di atas untuk memulai pencatatan nilai.
          </div>
        )}
      </div>
    );
  };

  // 5. REKAP NILAI TAB (GRADEBOOK LEDGER)
  const renderRecapTab = () => {
    const isReady = recapYearId && recapSemester && recapClassId && recapSubjectId && recapData;
    const { weights: recapWeights, assessments: recapAssessments, students: recapStudents, grades: recapGrades } = recapData || {
      weights: [],
      assessments: [],
      students: [],
      grades: []
    };

    const nhAssessments = recapAssessments.filter(a => a.categoryCode === 'nh');
    const pasAssessment = recapAssessments.find(a => a.categoryCode === 'pas');

    const nhWeight = recapWeights.find(w => w.code === 'nh')?.weight || 60;
    const pasWeight = recapWeights.find(w => w.code === 'pas')?.weight || 40;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-800">Rekapitulasi Nilai Akademik</h3>
            <p className="text-xs text-slate-500">Transkrip ledger nilai final siswa lengkap dengan perhitungan bobot persentase</p>
          </div>
          {isReady && recapStudents.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleDownloadRecapCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Excel (CSV)
              </button>
              <button
                onClick={handlePrintRecap}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                Cetak Rekap (Landscape)
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tahun Ajaran</label>
            <select
              value={recapYearId}
              onChange={(e) => setRecapYearId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Semester</label>
            <select
              value={recapSemester}
              onChange={(e) => setRecapSemester(e.target.value as 'ganjil' | 'genap')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
            >
              <option value="ganjil">Semester Ganjil</option>
              <option value="genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kelas</label>
            <select
              value={recapClassId}
              onChange={(e) => setRecapClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
            <select
              value={recapSubjectId}
              onChange={(e) => setRecapSubjectId(e.target.value)}
              disabled={filteredRecapSubjects.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {filteredRecapSubjects.length === 0 ? (
                <option value="">-- Tidak ada mapel di kelas ini --</option>
              ) : (
                filteredRecapSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Main Recap Grid Ledger Table */}
        {isReady && (
          <div className="space-y-6">
            
            {/* Bobot Info Badge Row */}
            <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs no-print">
              <span className="text-slate-500 font-medium">
                Sistem Rumus Aktif: <strong>Nilai Akhir = (Rata-rata NH * {nhWeight}%) + (PAS * {pasWeight}%)</strong>
              </span>
              <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                Bobot Terkonfigurasi: NH {nhWeight}% | PAS {pasWeight}%
              </span>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden no-print">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4">Nama Siswa</th>
                      <th className="p-4">NISN</th>
                      
                      {/* Dynamic columns of NHs */}
                      {nhAssessments.map((nh, idx) => (
                        <th key={nh.id} className="p-4 text-center text-[10px] font-semibold bg-indigo-50/20 text-indigo-900 border-x border-slate-100 max-w-[100px] truncate" title={nh.name}>
                          NH {idx + 1}
                        </th>
                      ))}

                      <th className="p-4 text-center bg-indigo-50/50 font-bold text-indigo-950 border-x border-slate-100">Rata NH ({nhWeight}%)</th>
                      <th className="p-4 text-center bg-amber-50/30 text-amber-900 border-x border-slate-100">PAS ({pasWeight}%)</th>
                      <th className="p-4 text-center bg-emerald-50 text-emerald-950 font-black text-xs">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {recapStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7 + nhAssessments.length} className="text-center py-12 text-slate-400">
                          Tidak ada siswa yang sesuai filter di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      recapStudents.map((student, idx) => {
                        let totalNhValue = 0;
                        let nhCount = 0;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/40">
                            <td className="p-4 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-4 font-bold text-slate-800 font-display">{student.name}</td>
                            <td className="p-4 font-mono text-xs text-slate-500">{student.nisn}</td>
                            
                            {/* NH values columns mapping */}
                            {nhAssessments.map(nh => {
                              const scoreObj = recapGrades.find(g => g.studentId === student.id && g.assessmentId === nh.id);
                              const val = scoreObj ? scoreObj.value : 0;
                              totalNhValue += val;
                              nhCount++;

                              return (
                                <td key={nh.id} className="p-4 text-center border-x border-slate-100 font-bold text-slate-700">
                                  {scoreObj ? scoreObj.value : <span className="text-slate-300 font-normal">-</span>}
                                </td>
                              );
                            })}

                            {/* Average NH */}
                            {(() => {
                              const avgNh = nhCount > 0 ? Math.round(totalNhValue / nhCount) : 0;
                              
                              // PAS Value
                              const pasScoreObj = pasAssessment ? recapGrades.find(g => g.studentId === student.id && g.assessmentId === pasAssessment.id) : null;
                              const pasVal = pasScoreObj ? pasScoreObj.value : 0;

                              // Final weighted score
                              const finalScore = Math.round((avgNh * nhWeight / 100) + (pasVal * pasWeight / 100));

                              return (
                                <>
                                  <td className="p-4 text-center border-x border-slate-100 bg-indigo-50/10 font-extrabold text-indigo-700">
                                    {avgNh}
                                  </td>
                                  <td className="p-4 text-center border-x border-slate-100 bg-amber-50/10 font-extrabold text-amber-700">
                                    {pasScoreObj ? pasVal : <span className="text-slate-300 font-normal">-</span>}
                                  </td>
                                  <td className="p-4 text-center bg-emerald-50/20 font-black text-emerald-700 text-base">
                                    {finalScore}
                                  </td>
                                </>
                              );
                            })()}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DEDICATED PRINT VIEW - FULLY OPTIMIZED FOR LANDSCAPE PRINTING */}
            <div className="hidden print:block w-full text-slate-950 printable-report">
              <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold tracking-wide uppercase text-slate-900">
                      REKAPITULASI LAPORAN NILAI SISWA
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      Kurikulum Akademik Sekolah Digital Terintegrasi
                    </p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  Tahun Ajaran: {academicYears.find(y => y.id === recapYearId)?.name || 'Semua'}
                </div>
              </div>

              {/* Print Filter Details Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs border border-slate-300 p-3 rounded-xl bg-slate-50/50">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 font-bold">Mata Pelajaran: </span>
                    <span className="font-semibold text-slate-900">
                      {subjects.find(s => s.id === recapSubjectId)?.name || 'Mapel'} ({subjects.find(s => s.id === recapSubjectId)?.code || '-'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Kelas: </span>
                    <span className="font-semibold text-slate-900">
                      {classes.find(c => c.id === recapClassId)?.name || 'Kelas'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div>
                    <span className="text-slate-500 font-bold">Semester: </span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {recapSemester}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Tanggal Cetak: </span>
                    <span className="font-semibold text-slate-900">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Printable Table */}
              <table className="printable-table w-full">
                <thead>
                  <tr>
                    <th className="w-10">No</th>
                    <th>Nama Siswa</th>
                    <th>NISN</th>
                    {nhAssessments.map((nh, idx) => (
                      <th key={nh.id}>NH {idx + 1}</th>
                    ))}
                    <th>Rata NH</th>
                    <th>PAS</th>
                    <th>Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {recapStudents.map((student, idx) => {
                    let totalNhValue = 0;
                    let nhCount = 0;

                    return (
                      <tr key={student.id}>
                        <td className="text-center font-mono text-xs">{idx + 1}</td>
                        <td className="font-bold">{student.name}</td>
                        <td className="font-mono text-xs text-center">{student.nisn}</td>
                        
                        {nhAssessments.map(nh => {
                          const scoreObj = recapGrades.find(g => g.studentId === student.id && g.assessmentId === nh.id);
                          const val = scoreObj ? scoreObj.value : 0;
                          totalNhValue += val;
                          nhCount++;

                          return (
                            <td key={nh.id} className="text-center">
                              {scoreObj ? scoreObj.value : '-'}
                            </td>
                          );
                        })}

                        {(() => {
                          const avgNh = nhCount > 0 ? Math.round(totalNhValue / nhCount) : 0;
                          const pasScoreObj = pasAssessment ? recapGrades.find(g => g.studentId === student.id && g.assessmentId === pasAssessment.id) : null;
                          const pasVal = pasScoreObj ? pasScoreObj.value : 0;
                          const finalScore = Math.round((avgNh * nhWeight / 100) + (pasVal * pasWeight / 100));

                          return (
                            <>
                              <td className="text-center font-bold">{avgNh}</td>
                              <td className="text-center font-bold">{pasScoreObj ? pasVal : '-'}</td>
                              <td className="text-center font-extrabold" style={{ backgroundColor: '#f0fdf4' }}>{finalScore}</td>
                            </>
                          );
                        })()}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signature Row for Printed Report */}
              <div className="grid grid-cols-2 gap-8 mt-12 text-xs pt-8">
                <div className="text-center">
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-bold text-slate-800 mt-0.5">Kepala Sekolah / Guru Pengampu</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-800 border-b border-slate-400 inline-block px-8">
                    {subjects.find(s => s.id === recapSubjectId)?.teacherName || '__________________________'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Guru Mata Pelajaran</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Dicetak Oleh,</p>
                  <p className="font-bold text-slate-800 mt-0.5">Sistem Akademik Digital</p>
                  <div className="h-20"></div>
                  <p className="font-bold text-slate-800 border-b border-slate-400 inline-block px-8">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Admin Sesi Sekolah</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {!isReady && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-slate-400 text-xs">
            Lengkapi data filter Tahun Ajaran, Kelas, dan Mata Pelajaran untuk menyusun transkrip nilai.
          </div>
        )}
      </div>
    );
  };


  // --- MAIN LAYOUT ---
  return (
    <div className="space-y-6">
      
      {/* Tab Menu Header Selector */}
      <div className="flex items-center justify-between bg-slate-150/40 p-1.5 rounded-2xl max-w-2xl border border-slate-200/60 shadow-sm no-print">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${activeSubTab === 'subjects' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📚 Mata Pelajaran
        </button>
        <button
          onClick={() => setActiveSubTab('years')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${activeSubTab === 'years' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          🗓️ Tahun Ajaran
        </button>
        <button
          onClick={() => setActiveSubTab('weights')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${activeSubTab === 'weights' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          ⚖️ Bobot Nilai
        </button>
        <button
          onClick={() => setActiveSubTab('input')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${activeSubTab === 'input' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          ✏️ Input Nilai
        </button>
        <button
          onClick={() => setActiveSubTab('recap')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${activeSubTab === 'recap' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📄 Rekap Nilai
        </button>
      </div>

      {/* Alert Toasts */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}
          >
            <Check className="w-4 h-4" />
            <span>{alert.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SubTab Content Switcher */}
      <div>
        {activeSubTab === 'subjects' && renderSubjectsTab()}
        {activeSubTab === 'years' && renderYearsTab()}
        {activeSubTab === 'weights' && renderWeightsTab()}
        {activeSubTab === 'input' && renderInputTab()}
        {activeSubTab === 'recap' && renderRecapTab()}
      </div>

      {/* --- ALL ACADEMIC MODALS FOR CRUD --- */}
      
      {/* 1. Subject Create/Edit Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold font-display text-slate-800">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Kode Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: IND-10"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Contoh: Bahasa Indonesia"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Guru Pengampu</label>
                <select
                  required
                  value={subjectTeacherName}
                  onChange={(e) => setSubjectTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                  disabled={teachers.length === 0}
                >
                  <option value="">{teachers.length === 0 ? 'Data guru belum tersedia' : 'Pilih guru pengampu'}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name} {teacher.username ? `(${teacher.username})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Kelas</label>
                <select
                  value={subjectClassId}
                  onChange={(e) => setSubjectClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="sub-active"
                  checked={subjectIsActive}
                  onChange={(e) => setSubjectIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="sub-active" className="text-slate-600 font-bold uppercase select-none">Mata Pelajaran Aktif</label>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Academic Year Create/Edit Modal */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold font-display text-slate-800">
                {editingYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
              </h3>
              <button onClick={() => setIsYearModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveYear} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  placeholder="Contoh: 2026/2027"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="yr-active"
                  checked={yearIsActive}
                  onChange={(e) => setYearIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="yr-active" className="text-slate-600 font-bold uppercase select-none">Set Sebagai Aktif</label>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-relaxed font-medium">
                Mengaktifkan tahun ajaran ini akan otomatis menonaktifkan tahun ajaran lainnya yang saat ini sedang aktif di server.
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Assessment (Aspek Penilaian) Modal */}
      {isAddAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold font-display text-slate-800">
                Tambah Aspek Penilaian Baru
              </h3>
              <button onClick={() => setIsAddAssessmentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Kategori Aspek</label>
                <select
                  value={newAssessmentCategory}
                  onChange={(e) => setNewAssessmentCategory(e.target.value as 'nh' | 'pas')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500 font-bold text-slate-800"
                >
                  <option value="nh">Nilai Harian / Tugas / Kuis (NH)</option>
                  <option value="pas">Penilaian Akhir Semester (PAS)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Nama Penilaian</label>
                <input
                  type="text"
                  required
                  value={newAssessmentName}
                  onChange={(e) => setNewAssessmentName(e.target.value)}
                  placeholder={newAssessmentCategory === 'nh' ? 'Contoh: NH 1 - Aljabar Linier' : 'Contoh: PAS Matematika'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1 uppercase">Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  required
                  value={newAssessmentDate}
                  onChange={(e) => setNewAssessmentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-indigo-500"
                />
              </div>

              {newAssessmentCategory === 'pas' && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 leading-relaxed font-medium">
                  Setiap mata pelajaran, semester, kelas, dan tahun ajaran hanya diperbolehkan memiliki maksimal <strong>satu (1) aspek PAS</strong>.
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAssessmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  Buat Aspek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple Helper Icon component
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
