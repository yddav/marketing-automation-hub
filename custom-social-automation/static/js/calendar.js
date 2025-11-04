// Calendar View JavaScript
// Custom Social Media Automation Platform

let currentDate = new Date();
let allPosts = [];
let selectedPlatforms = ['instagram', 'facebook', 'twitter', 'tiktok', 'pinterest'];
let editingPostId = null;

// Platform character limits
const platformLimits = {
    twitter: 280,
    facebook: 63206,
    instagram: 2200,
    tiktok: 2200,
    pinterest: 500
};

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    renderCalendar();
    setupEventListeners();
    updateStats();
});

// Setup event listeners
function setupEventListeners() {
    // Month navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });

    // New post button
    document.getElementById('newPostBtn').addEventListener('click', () => {
        openPostModal();
    });

    // Platform filters
    document.querySelectorAll('.platform-filters input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedPlatforms.push(e.target.value);
            } else {
                selectedPlatforms = selectedPlatforms.filter(p => p !== e.target.value);
            }
            renderCalendar();
        });
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeAllModals();
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Post form submission
    document.getElementById('postForm').addEventListener('submit', handlePostSubmit);

    // Preview button
    document.getElementById('previewBtn').addEventListener('click', () => {
        const formData = new FormData(document.getElementById('postForm'));
        const text = formData.get('text');
        const platforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(cb => cb.value);

        // Open preview in new tab
        const previewUrl = `/preview?text=${encodeURIComponent(text)}&platforms=${platforms.join(',')}`;
        window.open(previewUrl, '_blank');
    });

    // Character counter
    document.getElementById('postText').addEventListener('input', updateCharCount);

    // Image upload preview
    document.getElementById('postImage').addEventListener('change', handleImagePreview);

    // Post details modal actions
    document.getElementById('closeDetailsBtn').addEventListener('click', closeAllModals);
    document.getElementById('editPostBtn').addEventListener('click', editPost);
    document.getElementById('deletePostBtn').addEventListener('click', deletePost);
}

// Load posts from backend
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        allPosts = await response.json();
        renderCalendar();
        updateStats();
    } catch (error) {
        console.error('Error loading posts:', error);
        // Use mock data for demo
        allPosts = generateMockPosts();
        renderCalendar();
        updateStats();
    }
}

// Generate mock posts for demo
function generateMockPosts() {
    const mockPosts = [];
    const today = new Date();

    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + Math.floor(Math.random() * 30));

        const platforms = ['instagram', 'facebook', 'twitter', 'tiktok', 'pinterest'];
        const randomPlatforms = platforms.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

        mockPosts.push({
            id: i + 1,
            text: `Sample post ${i + 1}`,
            platforms: randomPlatforms,
            scheduled_date: date.toISOString().split('T')[0],
            scheduled_time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:00`,
            status: Math.random() > 0.3 ? 'scheduled' : 'draft',
            image_url: Math.random() > 0.5 ? '/static/img/sample.jpg' : null
        });
    }

    return mockPosts;
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Clear calendar
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = createDayElement(daysInPrevMonth - i, month - 1, year, true);
        calendar.appendChild(day);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const day = createDayElement(i, month, year, false);
        calendar.appendChild(day);
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            const day = createDayElement(i, month + 1, year, true);
            calendar.appendChild(day);
        }
    }
}

// Create calendar day element
function createDayElement(dayNum, month, year, otherMonth) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (otherMonth) dayDiv.classList.add('other-month');

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    // Check if today
    const today = new Date();
    if (!otherMonth && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add('today');
    }

    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = dayNum;
    dayDiv.appendChild(dayNumber);

    // Posts for this day
    const dayPosts = document.createElement('div');
    dayPosts.className = 'day-posts';

    const postsForDay = allPosts.filter(post => {
        return post.scheduled_date === dateStr &&
               post.platforms.some(p => selectedPlatforms.includes(p));
    });

    postsForDay.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = `post-item ${post.platforms[0]} ${post.status}`;
        postItem.textContent = `${post.scheduled_time} - ${post.text.substring(0, 20)}...`;
        postItem.draggable = true;
        postItem.dataset.postId = post.id;

        postItem.addEventListener('click', (e) => {
            e.stopPropagation();
            showPostDetails(post);
        });

        // Drag and drop
        postItem.addEventListener('dragstart', handleDragStart);

        dayPosts.appendChild(postItem);
    });

    dayDiv.appendChild(dayPosts);

    // Day click to create post
    dayDiv.addEventListener('click', () => {
        openPostModal(dateStr);
    });

    // Drop target
    dayDiv.addEventListener('dragover', handleDragOver);
    dayDiv.addEventListener('drop', (e) => handleDrop(e, dateStr));
    dayDiv.addEventListener('dragleave', handleDragLeave);

    return dayDiv;
}

// Drag and drop handlers
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('postId', e.target.dataset.postId);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e, newDate) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.currentTarget.classList.remove('drag-over');

    const postId = e.dataTransfer.getData('postId');
    const post = allPosts.find(p => p.id == postId);

    if (post) {
        post.scheduled_date = newDate;
        await updatePost(post);
        renderCalendar();
    }

    document.querySelectorAll('.dragging').forEach(el => {
        el.classList.remove('dragging');
    });

    return false;
}

// Modal functions
function openPostModal(date = null) {
    editingPostId = null;
    document.getElementById('modalTitle').textContent = 'Create New Post';
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';

    if (date) {
        document.getElementById('scheduledDate').value = date;
    } else {
        document.getElementById('scheduledDate').value = new Date().toISOString().split('T')[0];
    }

    document.getElementById('scheduledTime').value = '09:00';
    document.getElementById('postModal').style.display = 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    editingPostId = null;
}

function showPostDetails(post) {
    const details = document.getElementById('postDetails');
    details.innerHTML = `
        <p><strong>Content:</strong> ${post.text}</p>
        <p><strong>Platforms:</strong> ${post.platforms.join(', ')}</p>
        <p><strong>Scheduled:</strong> ${post.scheduled_date} at ${post.scheduled_time}</p>
        <p><strong>Status:</strong> ${post.status}</p>
        ${post.image_url ? `<img src="${post.image_url}" style="max-width: 100%; border-radius: 8px;">` : ''}
    `;

    editingPostId = post.id;
    document.getElementById('postDetailsModal').style.display = 'block';
}

function editPost() {
    const post = allPosts.find(p => p.id === editingPostId);
    if (!post) return;

    document.getElementById('postDetailsModal').style.display = 'none';
    document.getElementById('modalTitle').textContent = 'Edit Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('postText').value = post.text;
    document.getElementById('scheduledDate').value = post.scheduled_date;
    document.getElementById('scheduledTime').value = post.scheduled_time;

    // Check platforms
    post.platforms.forEach(platform => {
        const checkbox = document.querySelector(`input[name="platforms"][value="${platform}"]`);
        if (checkbox) checkbox.checked = true;
    });

    document.getElementById('postModal').style.display = 'block';
}

async function deletePost() {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch(`/api/posts/${editingPostId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            allPosts = allPosts.filter(p => p.id !== editingPostId);
            closeAllModals();
            renderCalendar();
            updateStats();
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
    }
}

// Form submission
async function handlePostSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const platforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(cb => cb.value);

    if (platforms.length === 0) {
        alert('Please select at least one platform');
        return;
    }

    const postData = {
        text: formData.get('text'),
        platforms: platforms,
        scheduled_date: formData.get('scheduled_date'),
        scheduled_time: formData.get('scheduled_time'),
        image_url: null // TODO: Handle image upload
    };

    try {
        const postId = document.getElementById('postId').value;
        const url = postId ? `/api/posts/${postId}` : '/api/posts';
        const method = postId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            closeAllModals();
            loadPosts();
        }
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Failed to save post');
    }
}

// Update post
async function updatePost(post) {
    try {
        await fetch(`/api/posts/${post.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });
    } catch (error) {
        console.error('Error updating post:', error);
    }
}

// Character counter
function updateCharCount() {
    const text = document.getElementById('postText').value;
    const charCount = document.getElementById('charCount');
    const maxChars = document.getElementById('maxChars');

    const platforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(cb => cb.value);

    if (platforms.length > 0) {
        const minLimit = Math.min(...platforms.map(p => platformLimits[p] || 280));
        maxChars.textContent = minLimit;
        charCount.textContent = text.length;

        const counter = document.querySelector('.char-count');
        counter.classList.remove('warning', 'error');

        if (text.length > minLimit) {
            counter.classList.add('error');
        } else if (text.length > minLimit * 0.9) {
            counter.classList.add('warning');
        }
    }
}

// Image preview (multiple files)
function handleImagePreview(e) {
    const files = e.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    if (files.length === 0) {
        return;
    }

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = `Preview ${index + 1}`;
            img.style.width = files.length > 1 ? '48%' : '100%';
            img.style.display = 'inline-block';
            img.style.marginRight = '2%';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    if (files.length > 1) {
        const info = document.createElement('p');
        info.style.fontSize = '12px';
        info.style.color = '#666';
        info.textContent = `${files.length} images selected (carousel post)`;
        preview.appendChild(info);
    }
}

// Update statistics
function updateStats() {
    const scheduledPosts = allPosts.filter(p => p.status === 'scheduled');
    document.getElementById('scheduledCount').textContent = scheduledPosts.length;

    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const thisWeek = scheduledPosts.filter(p => {
        const postDate = new Date(p.scheduled_date);
        return postDate >= today && postDate <= weekLater;
    });

    const thisMonth = scheduledPosts.filter(p => {
        const postDate = new Date(p.scheduled_date);
        return postDate >= today && postDate <= monthLater;
    });

    document.getElementById('weekCount').textContent = thisWeek.length;
    document.getElementById('monthCount').textContent = thisMonth.length;
}
