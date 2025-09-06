document.addEventListener('DOMContentLoaded', () => {
    // URL ของ Web App ที่ได้จากการ Deploy บน Google Apps Script
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2AOrE42EPZtW0SbhndUDgVx_fE3IQPio2MnsTSCu69xzASyxRN-IWLP3Q-Zi7unXR/exec';

    // --- ส่วนของการทำงานร่วม (สำหรับทุกหน้า) ---
    const fetchData = async (action, params = {}) => {
        try {
            const url = new URL(APP_SCRIPT_URL);
            url.searchParams.append('action', action);
            for (const key in params) {
                url.searchParams.append(key, params[key]);
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
            return null;
        }
    };

    // --- ส่วนการทำงานของหน้า Index.html ---
    if (document.getElementById('dashboard')) {
        loadDashboardData();
        setupEventListeners();
    }
    
    async function loadDashboardData() {
        const result = await fetchData('getAllData');
        if (result && result.success) {
            const data = result.data;
            displayDashboardStats(data);
            displayStudentTable(data);
            displayRankings(data);
        }
    }

    function displayDashboardStats(data) {
        const totalStudents = data.length; // สมมติว่าข้อมูลที่ได้คือข้อมูลคนที่กรอกแล้ว
        const continuingStudents = data.filter(d => d.university).length;
        
        document.getElementById('total-students').textContent = totalStudents; // ควรมาจากชีตนักเรียนทั้งหมด
        document.getElementById('students-continue').textContent = continuingStudents;
        // การคำนวณ "ไม่ศึกษาต่อ" อาจต้องใช้ข้อมูลนักเรียนทั้งหมดมาเปรียบเทียบ
        document.getElementById('students-not-continue').textContent = 'N/A'; 
        
        const universities = [...new Set(data.map(item => item.university))];
        document.getElementById('total-universities').textContent = universities.length;
    }

    function displayStudentTable(data) {
        const tbody = document.querySelector("#student-table tbody");
        tbody.innerHTML = '';
        data.forEach(student => {
            const row = `<tr>
                <td>${student.fullName || 'ไม่มีข้อมูล'}</td>
                <td>${student.university}</td>
                <td>${student.faculty}</td>
                <td>${student.major}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    }

    function displayRankings(data) {
        const universityCounts = countOccurrences(data, 'university');
        const facultyCounts = countOccurrences(data, 'faculty');
        const majorCounts = countOccurrences(data, 'major');

        renderList(document.getElementById('top-universities'), universityCounts);
        renderList(document.getElementById('top-faculties'), facultyCounts);
        renderList(document.getElementById('top-majors'), majorCounts);
    }
    
    function countOccurrences(data, key) {
        return data.reduce((acc, item) => {
            const value = item[key];
            if (value) {
                acc[value] = (acc[value] || 0) + 1;
            }
            return acc;
        }, {});
    }

    function renderList(element, counts) {
        element.innerHTML = '';
        const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5); // แสดง 5 อันดับแรก
        sorted.forEach(([name, count]) => {
            const li = document.createElement('li');
            li.textContent = `${name} (${count} คน)`;
            element.appendChild(li);
        });
    }
    
    window.searchData = async () => {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const result = await fetchData('getAllData');
        if (result && result.success) {
            const filteredData = result.data.filter(student => {
                return (student.fullName && student.fullName.toLowerCase().includes(query)) ||
                       (student.university && student.university.toLowerCase().includes(query)) ||
                       (student.faculty && student.faculty.toLowerCase().includes(query)) ||
                       (student.major && student.major.toLowerCase().includes(query)) ||
                       (student.studentId && student.studentId.toString().includes(query));
            });
            displayStudentTable(filteredData);
        }
    };
    
    function setupEventListeners() {
        const loginModal = document.getElementById('login-modal');
        const showLoginBtn = document.getElementById('show-login-btn');
        const closeButton = document.querySelector('.close-button');

        showLoginBtn.onclick = () => { loginModal.style.display = 'block'; };
        closeButton.onclick = () => { loginModal.style.display = 'none'; };
        window.onclick = (event) => {
            if (event.target == loginModal) {
                loginModal.style.display = 'none';
            }
        };
        // เพิ่ม event listener สำหรับปุ่มอื่นๆ
    }

    // --- ส่วนการทำงานของหน้า Admin.html ---
    if (document.getElementById('news-management')) {
        // ฟังก์ชันสำหรับหน้าแอดมิน
    }
});
