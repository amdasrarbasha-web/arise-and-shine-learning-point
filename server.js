const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const BACKUP_FILE = path.join(__dirname, 'data', 'db.backup.json');

// Middleware
app.use(cors());
// Support JSON bodies up to 25MB for base64 photo uploads from parents
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to read and write database with permanent backup memory
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } else if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading primary DB, trying backup:', err);
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (bErr) {
      console.error('Backup read also failed:', bErr);
    }
  }
  return { centerInfo: {}, admin: {}, students: [], announcements: [], homeworks: [], feedbacks: [] };
}

function writeDB(data) {
  try {
    const payload = JSON.stringify(data, null, 2);
    // Write to primary database
    fs.writeFileSync(DB_FILE, payload, 'utf8');
    // Mirror to backup file for permanent persistence
    fs.writeFileSync(BACKUP_FILE, payload, 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// ----------------- CENTER INFO -----------------
app.get('/api/center', (req, res) => {
  const db = readDB();
  res.json(db.centerInfo || {});
});

// ----------------- AUTHENTICATION -----------------
// Student login by ID & Password
app.post('/api/students/login', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: 'Please enter both Student ID and Password' });
  }

  const db = readDB();
  const cleanId = id.trim().toUpperCase();
  const cleanPass = password.trim();

  const student = db.students.find(
    s => s.id.toUpperCase() === cleanId && s.password === cleanPass
  );

  if (!student) {
    return res.status(401).json({ error: 'Invalid Student ID or Password. Please check with Arise & Shine Center.' });
  }

  // Return full student profile
  res.json({ success: true, student });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  if (
    db.admin &&
    username &&
    password &&
    username.trim().toLowerCase() === db.admin.username.toLowerCase() &&
    password.trim() === db.admin.password
  ) {
    return res.json({ success: true, admin: { name: db.admin.name, username: db.admin.username } });
  }

  res.status(401).json({ error: 'Invalid Admin credentials' });
});

// ----------------- STUDENTS CRUD -----------------
// Get all students
app.get('/api/students', (req, res) => {
  const db = readDB();
  const { search, grade } = req.query;
  let list = db.students || [];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.school && s.school.toLowerCase().includes(q))
    );
  }

  if (grade) {
    list = list.filter(s => s.grade.toLowerCase().includes(grade.toLowerCase()));
  }

  res.json(list);
});

// Get single student
app.get('/api/students/:id', (req, res) => {
  const db = readDB();
  const student = db.students.find(s => s.id.toUpperCase() === req.params.id.toUpperCase());
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// Add new student
app.post('/api/students', (req, res) => {
  const db = readDB();
  const newStudent = req.body;

  if (!newStudent.id || !newStudent.name) {
    return res.status(400).json({ error: 'Student ID and Name are required' });
  }

  // Check unique ID
  if (db.students.some(s => s.id.toUpperCase() === newStudent.id.toUpperCase())) {
    return res.status(400).json({ error: `Student with ID "${newStudent.id}" already exists.` });
  }

  // Provide defaults
  const studentRecord = {
    id: newStudent.id.trim().toUpperCase(),
    password: newStudent.password || 'student123',
    name: newStudent.name.trim(),
    gender: newStudent.gender || 'Male',
    photo: newStudent.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStudent.name)}`,
    grade: newStudent.grade || 'Class 10',
    school: newStudent.school || 'Melvisharam Matriculation School',
    parentName: newStudent.parentName || 'Parent / Guardian',
    parentPhone: newStudent.parentPhone || '6379840006',
    studentPhone: newStudent.studentPhone || '',
    rollNo: newStudent.rollNo || `ASLP-${Math.floor(100 + Math.random() * 900)}`,
    joinDate: newStudent.joinDate || new Date().toISOString().split('T')[0],
    attendance: newStudent.attendance || {
      totalClasses: 1,
      attendedClasses: 1,
      percentage: 100,
      todayStatus: 'Present',
      recentHistory: [{ date: new Date().toISOString().split('T')[0], status: 'Present', note: 'Joined center' }]
    },
    behaviour: newStudent.behaviour || {
      score: 90,
      grade: 'A',
      disciplineRating: 4.5,
      participationRating: 4.5,
      homeworkCompletion: 90,
      teacherRemarks: 'Welcomed to Arise and Shine Learning Point.',
      badges: ['New Joiner']
    },
    fee: newStudent.fee || {
      monthlyFee: Number(newStudent.monthlyFee) || 1200,
      status: 'PAID',
      lastPaidDate: new Date().toISOString().split('T')[0],
      receiptNo: `ASLP-REC-${Math.floor(10000 + Math.random() * 90000)}`,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMode: 'Cash',
      notes: 'Initial admission fee paid'
    }
  };

  db.students.unshift(studentRecord);
  writeDB(db);
  res.status(201).json({ success: true, student: studentRecord });
});

// Update student profile
app.put('/api/students/:id', (req, res) => {
  const db = readDB();
  const idx = db.students.findIndex(s => s.id.toUpperCase() === req.params.id.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  db.students[idx] = { ...db.students[idx], ...req.body };
  writeDB(db);
  res.json({ success: true, student: db.students[idx] });
});

// Update student profile photo
app.put('/api/students/:id/photo', (req, res) => {
  const db = readDB();
  const student = (db.students || []).find(s => s.id.toUpperCase() === req.params.id.toUpperCase());
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { photo } = req.body;
  if (!photo) return res.status(400).json({ error: 'Photo data or URL is required' });

  student.photo = photo;
  writeDB(db);
  res.json({ success: true, student, message: 'Student photo updated successfully' });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const db = readDB();
  const initialLen = db.students.length;
  db.students = db.students.filter(s => s.id.toUpperCase() !== req.params.id.toUpperCase());

  if (db.students.length === initialLen) {
    return res.status(404).json({ error: 'Student not found' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Student removed successfully' });
});

// ----------------- ATTENDANCE UPDATES -----------------
// Update single student attendance
app.put('/api/students/:id/attendance', (req, res) => {
  const db = readDB();
  const student = db.students.find(s => s.id.toUpperCase() === req.params.id.toUpperCase());
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { status, note, date } = req.body; // status: 'Present' | 'Absent' | 'Late'
  const recordDate = date || new Date().toISOString().split('T')[0];

  student.attendance = student.attendance || { totalClasses: 0, attendedClasses: 0, percentage: 0, recentHistory: [] };
  student.attendance.todayStatus = status;

  // Check if date already exists in recentHistory
  const histIdx = student.attendance.recentHistory.findIndex(h => h.date === recordDate);
  if (histIdx >= 0) {
    student.attendance.recentHistory[histIdx].status = status;
    if (note) student.attendance.recentHistory[histIdx].note = note;
  } else {
    student.attendance.recentHistory.unshift({
      date: recordDate,
      status,
      note: note || (status === 'Present' ? 'Attended class' : status)
    });
    student.attendance.totalClasses = (student.attendance.totalClasses || 0) + 1;
    if (status === 'Present' || status === 'Late') {
      student.attendance.attendedClasses = (student.attendance.attendedClasses || 0) + 1;
    }
  }

  // Recalculate percentage
  if (student.attendance.totalClasses > 0) {
    student.attendance.percentage = Number(
      ((student.attendance.attendedClasses / student.attendance.totalClasses) * 100).toFixed(1)
    );
  }

  writeDB(db);
  res.json({ success: true, student });
});

// Bulk mark attendance for all students for today
app.post('/api/attendance/bulk', (req, res) => {
  const db = readDB();
  const { status, date } = req.body; // e.g. status: 'Present'
  const targetDate = date || new Date().toISOString().split('T')[0];

  db.students.forEach(student => {
    student.attendance = student.attendance || { totalClasses: 0, attendedClasses: 0, percentage: 0, recentHistory: [] };
    student.attendance.todayStatus = status;

    const histIdx = student.attendance.recentHistory.findIndex(h => h.date === targetDate);
    if (histIdx >= 0) {
      student.attendance.recentHistory[histIdx].status = status;
    } else {
      student.attendance.recentHistory.unshift({
        date: targetDate,
        status,
        note: `Marked ${status}`
      });
      student.attendance.totalClasses = (student.attendance.totalClasses || 0) + 1;
      if (status === 'Present' || status === 'Late') {
        student.attendance.attendedClasses = (student.attendance.attendedClasses || 0) + 1;
      }
    }

    if (student.attendance.totalClasses > 0) {
      student.attendance.percentage = Number(
        ((student.attendance.attendedClasses / student.attendance.totalClasses) * 100).toFixed(1)
      );
    }
  });

  writeDB(db);
  res.json({ success: true, message: `Marked all students as ${status} for ${targetDate}` });
});

// ----------------- BEHAVIOUR UPDATES -----------------
app.put('/api/students/:id/behaviour', (req, res) => {
  const db = readDB();
  const student = db.students.find(s => s.id.toUpperCase() === req.params.id.toUpperCase());
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { score, teacherRemarks, grade, disciplineRating, participationRating, homeworkCompletion, badges } = req.body;

  student.behaviour = {
    ...student.behaviour,
    score: score !== undefined ? Number(score) : student.behaviour?.score || 90,
    teacherRemarks: teacherRemarks || student.behaviour?.teacherRemarks || '',
    grade: grade || (score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : 'B'),
    disciplineRating: disciplineRating || student.behaviour?.disciplineRating || 4.5,
    participationRating: participationRating || student.behaviour?.participationRating || 4.5,
    homeworkCompletion: homeworkCompletion || student.behaviour?.homeworkCompletion || 90,
    badges: badges || student.behaviour?.badges || ['Good Learner']
  };

  writeDB(db);
  res.json({ success: true, student });
});

// ----------------- FEE UPDATES -----------------
app.put('/api/students/:id/fee', (req, res) => {
  const db = readDB();
  const student = db.students.find(s => s.id.toUpperCase() === req.params.id.toUpperCase());
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { status, monthlyFee, nextDueDate, lastPaidDate, paymentMode, notes, receiptNo } = req.body;

  student.fee = {
    ...student.fee,
    status: status || student.fee?.status || 'PENDING',
    monthlyFee: monthlyFee !== undefined ? Number(monthlyFee) : student.fee?.monthlyFee || 1200,
    nextDueDate: nextDueDate || student.fee?.nextDueDate,
    lastPaidDate: lastPaidDate || (status === 'PAID' ? new Date().toISOString().split('T')[0] : student.fee?.lastPaidDate),
    paymentMode: paymentMode || student.fee?.paymentMode || 'Cash',
    notes: notes !== undefined ? notes : student.fee?.notes,
    receiptNo: receiptNo || (status === 'PAID' ? `ASLP-REC-${Math.floor(10000 + Math.random() * 90000)}` : student.fee?.receiptNo)
  };

  writeDB(db);
  res.json({ success: true, student });
});

// ----------------- ANNOUNCEMENTS -----------------
app.get('/api/announcements', (req, res) => {
  const db = readDB();
  res.json(db.announcements || []);
});

app.post('/api/announcements', (req, res) => {
  const db = readDB();
  const { title, content, category, target, isPinned } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newAnn = {
    id: `ANN-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    category: category || 'Notice',
    target: target || 'All Batches',
    date: new Date().toISOString().split('T')[0],
    isPinned: Boolean(isPinned),
    author: 'Administration - Arise & Shine'
  };

  db.announcements = db.announcements || [];
  db.announcements.unshift(newAnn);
  writeDB(db);
  res.status(201).json({ success: true, announcement: newAnn });
});

// Update announcement by admin
app.put('/api/announcements/:id', (req, res) => {
  const db = readDB();
  const ann = (db.announcements || []).find(a => a.id === req.params.id);
  if (!ann) return res.status(404).json({ error: 'Announcement not found' });

  const { title, content, category, target, isPinned } = req.body;
  if (title) ann.title = title.trim();
  if (content) ann.content = content.trim();
  if (category) ann.category = category;
  if (target) ann.target = target;
  if (isPinned !== undefined) ann.isPinned = Boolean(isPinned);
  ann.updatedAt = new Date().toISOString().split('T')[0];

  writeDB(db);
  res.json({ success: true, announcement: ann });
});

app.delete('/api/announcements/:id', (req, res) => {
  const db = readDB();
  db.announcements = (db.announcements || []).filter(a => a.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Announcement deleted' });
});

// ----------------- HOMEWORK (Parents share school homework) -----------------
app.get('/api/homeworks', (req, res) => {
  const db = readDB();
  const { studentId } = req.query;
  let list = db.homeworks || [];
  if (studentId) {
    list = list.filter(h => h.studentId.toUpperCase() === studentId.toUpperCase());
  }
  res.json(list);
});

// Submit homework with photo by parent
app.post('/api/homeworks', (req, res) => {
  const db = readDB();
  const { studentId, subject, description, submissionDueDate, photoUrl, schoolName } = req.body;

  if (!studentId || !subject) {
    return res.status(400).json({ error: 'Student ID and subject are required' });
  }

  const student = db.students.find(s => s.id.toUpperCase() === studentId.toUpperCase());

  const newHw = {
    id: `HW-${Date.now()}`,
    studentId: studentId.toUpperCase(),
    studentName: student ? student.name : 'Student',
    grade: student ? student.grade : 'General',
    schoolName: schoolName || (student ? student.school : ''),
    subject: subject.trim(),
    description: description ? description.trim() : 'School homework worksheet shared by parent.',
    photoUrl: photoUrl || '',
    submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }),
    status: 'Submitted',
    adminRemarks: ''
  };

  db.homeworks = db.homeworks || [];
  db.homeworks.unshift(newHw);
  writeDB(db);
  res.status(201).json({ success: true, homework: newHw });
});

// Admin deletes homework record if chosen by admin
app.delete('/api/homeworks/:id', (req, res) => {
  const db = readDB();
  db.homeworks = (db.homeworks || []).filter(h => h.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Homework record deleted' });
});

// Admin reviews and updates homework status / remarks
app.put('/api/homeworks/:id', (req, res) => {
  const db = readDB();
  const hw = (db.homeworks || []).find(h => h.id === req.params.id);
  if (!hw) return res.status(404).json({ error: 'Homework record not found' });

  const { status, adminRemarks } = req.body;
  if (status) hw.status = status;
  if (adminRemarks !== undefined) hw.adminRemarks = adminRemarks;

  writeDB(db);
  res.json({ success: true, homework: hw });
});

// ----------------- FEEDBACK & QUERIES (Parents <-> Admin) -----------------
app.get('/api/feedbacks', (req, res) => {
  const db = readDB();
  const { studentId } = req.query;
  let list = db.feedbacks || [];
  if (studentId) {
    list = list.filter(f => f.studentId.toUpperCase() === studentId.toUpperCase());
  }
  res.json(list);
});

// Parent submits feedback / query
app.post('/api/feedbacks', (req, res) => {
  const db = readDB();
  const { studentId, category, message, parentName, parentPhone } = req.body;

  if (!studentId || !message) {
    return res.status(400).json({ error: 'Student ID and message query are required' });
  }

  const student = db.students.find(s => s.id.toUpperCase() === studentId.toUpperCase());

  const newFeedback = {
    id: `FB-${Date.now()}`,
    studentId: studentId.toUpperCase(),
    studentName: student ? student.name : 'Student',
    parentName: parentName || (student ? student.parentName : 'Parent'),
    parentPhone: parentPhone || (student ? student.parentPhone : ''),
    category: category || 'General Feedback',
    message: message.trim(),
    submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }),
    status: 'Pending',
    adminReply: '',
    repliedAt: ''
  };

  db.feedbacks = db.feedbacks || [];
  db.feedbacks.unshift(newFeedback);
  writeDB(db);
  res.status(201).json({ success: true, feedback: newFeedback });
});

// Admin replies to parent query
app.put('/api/feedbacks/:id', (req, res) => {
  const db = readDB();
  const fb = (db.feedbacks || []).find(f => f.id === req.params.id);
  if (!fb) return res.status(404).json({ error: 'Feedback record not found' });

  const { adminReply, status } = req.body;
  if (adminReply !== undefined) fb.adminReply = adminReply;
  fb.status = status || 'Replied';
  fb.repliedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' });

  writeDB(db);
  res.json({ success: true, feedback: fb });
});

// Admin deletes a feedback / query permanently (only when admin chooses to delete)
app.delete('/api/feedbacks/:id', (req, res) => {
  const db = readDB();
  const initialLen = (db.feedbacks || []).length;
  db.feedbacks = (db.feedbacks || []).filter(f => f.id !== req.params.id);
  
  if (db.feedbacks.length === initialLen) {
    return res.status(404).json({ error: 'Feedback record not found' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Message deleted successfully by admin' });
});

// Direct Android APK download endpoint
app.get('/arise-and-shine.apk', (req, res) => {
  const apkDist = path.join(__dirname, 'dist', 'arise-and-shine.apk');
  const apkPublic = path.join(__dirname, 'public', 'arise-and-shine.apk');
  const targetApk = fs.existsSync(apkDist) ? apkDist : (fs.existsSync(apkPublic) ? apkPublic : null);

  if (targetApk) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Arise-and-Shine.apk"');
    return res.sendFile(targetApk);
  }
  return res.status(404).send('APK is currently being packaged. Please try again shortly.');
});

// Serve frontend static files if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  // Serve static assets with no-cache on HTML and service worker
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  app.use((req, res) => {
    // Never serve index.html for API requests, assets, scripts or images
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/assets') ||
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|map|apk|aab|zip)$/i.test(req.path)
    ) {
      return res.status(404).send('Not found');
    }
    // Only serve index.html for client-side HTML page navigation
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile('index.html', { root: distPath });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`ARISE AND SHINE LEARNING POINT API server running on port ${PORT}`);
});
