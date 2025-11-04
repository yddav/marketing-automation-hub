// Posts Management JavaScript
// Custom Social Media Automation Platform

let allPosts = [];
let filteredPosts = [];
let importData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // New post button
    document.getElementById('newPostBtn').addEventListener('click', () => {
        window.location.href = '/calendar';
    });

    // Bulk import button
    document.getElementById('bulkImportBtn').addEventListener('click', () => {
        document.getElementById('importModal').style.display = 'block';
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('platformFilter').addEventListener('change', applyFilters);
    document.getElementById('searchBox').addEventListener('input', applyFilters);

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // File upload
    document.getElementById('jsonFile').addEventListener('change', handleFileUpload);

    // Confirm import
    document.getElementById('confirmImportBtn').addEventListener('click', confirmImport);

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Load posts from backend
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        allPosts = await response.json();
        filteredPosts = [...allPosts];
        renderPosts();
        updateStats();
    } catch (error) {
        console.error('Error loading posts:', error);
        showEmptyState();
    }
}

// Render posts table
function renderPosts() {
    const tbody = document.getElementById('postsTableBody');
    tbody.innerHTML = '';

    if (filteredPosts.length === 0) {
        showEmptyState();
        return;
    }

    document.getElementById('postsTable').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';

    filteredPosts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="status-badge ${post.status}">${post.status}</span>
            </td>
            <td>
                <div class="post-content">${post.text}</div>
            </td>
            <td>
                <div class="platform-badges">
                    ${post.platforms.map(p => `<span class="platform-badge ${p}">${p}</span>`).join('')}
                </div>
            </td>
            <td>
                ${post.scheduled_date}<br>
                <small>${post.scheduled_time}</small>
            </td>
            <td>
                <div class="post-actions">
                    <button class="btn-icon btn-preview" onclick="previewPost(${post.id})" title="Preview">
                        👁️
                    </button>
                    <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const platformFilter = document.getElementById('platformFilter').value;
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();

    filteredPosts = allPosts.filter(post => {
        // Status filter
        if (statusFilter !== 'all' && post.status !== statusFilter) {
            return false;
        }

        // Platform filter
        if (platformFilter !== 'all' && !post.platforms.includes(platformFilter)) {
            return false;
        }

        // Search filter
        if (searchQuery && !post.text.toLowerCase().includes(searchQuery)) {
            return false;
        }

        return true;
    });

    renderPosts();
    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('totalPosts').textContent = allPosts.length;
    document.getElementById('scheduledPosts').textContent = allPosts.filter(p => p.status === 'scheduled').length;
    document.getElementById('postedPosts').textContent = allPosts.filter(p => p.status === 'posted').length;
    document.getElementById('draftPosts').textContent = allPosts.filter(p => p.status === 'draft').length;
}

// Show empty state
function showEmptyState() {
    document.getElementById('postsTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
}

// Preview post
function previewPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    const previewUrl = `/preview?text=${encodeURIComponent(post.text)}&platforms=${post.platforms.join(',')}`;
    window.open(previewUrl, '_blank');
}

// Edit post
function editPost(postId) {
    window.location.href = `/calendar?edit=${postId}`;
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            allPosts = allPosts.filter(p => p.id !== postId);
            applyFilters();
            updateStats();
        } else {
            alert('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
    }
}

// Load FINDERR campaign
async function loadFindERRCampaign() {
    console.log('🔄 Loading FINDERR campaign...');

    // Show loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Loading...';
    button.disabled = true;

    try {
        // Load FINDERR campaign posts from automation folder
        const response = await fetch('/api/import/finderr-campaign');
        console.log('📡 API Response status:', response.status);

        if (response.ok) {
            importData = await response.json();
            console.log('✅ Data loaded:', importData);
            console.log('📊 Posts count:', importData.posts?.length);
            showImportPreview(importData);

            // Show success message
            button.innerHTML = '✅ Loaded!';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        } else {
            console.warn('⚠️ API returned non-OK status, using fallback');
            // Fallback: create sample FINDERR campaign
            importData = generateFindERRCampaign();
            showImportPreview(importData);

            button.innerHTML = originalText;
            button.disabled = false;
        }
    } catch (error) {
        console.error('❌ Error loading FINDERR campaign:', error);
        // Generate sample data
        importData = generateFindERRCampaign();
        showImportPreview(importData);

        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Generate sample FINDERR campaign
function generateFindERRCampaign() {
    const posts = [];
    const today = new Date();

    const templates = [
        "🔐 Lost your phone? FINDERR displays your emergency contact on the locked screen! Join our beta: hub.untrapd.com/apps/finderr/beta #PhoneSecurity #FINDERR",
        "📱 FINDERR Beta: Get 50% lifetime discount! World's first lockscreen emergency contact app. Limited spots! #BetaTester #Android",
        "🚨 Emergency mode activated! FINDERR transforms your wallpaper into a rescue beacon. Beta testing now open! #PhoneRecovery",
        "💡 Revolutionary phone security: FINDERR shows YOUR contact info on the lockscreen when lost. Beta access available! #Innovation",
        "🎯 Join 100 beta testers for FINDERR! First-ever system lockscreen modification app. Android-only launch! #Exclusive"
    ];

    const platforms = [
        ['instagram', 'facebook'],
        ['twitter', 'tiktok'],
        ['instagram', 'twitter', 'pinterest'],
        ['facebook', 'pinterest'],
        ['tiktok', 'instagram', 'facebook']
    ];

    for (let i = 0; i < 45; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + Math.floor(i / 3)); // 3 posts per day

        const hour = 9 + (i % 3) * 4; // 9am, 1pm, 5pm

        posts.push({
            text: templates[i % templates.length],
            platforms: platforms[i % platforms.length],
            scheduled_date: date.toISOString().split('T')[0],
            scheduled_time: `${String(hour).padStart(2, '0')}:00`,
            status: 'draft'
        });
    }

    return { posts, campaign_name: 'FINDERR Beta Recruitment' };
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            importData = JSON.parse(event.target.result);
            showImportPreview(importData);
        } catch (error) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

// Show import preview
function showImportPreview(data) {
    console.log('🎨 showImportPreview called with:', data);

    const preview = document.getElementById('importPreview');
    const content = document.getElementById('importPreviewContent');

    console.log('📦 Preview element:', preview);
    console.log('📄 Content element:', content);

    const posts = data.posts || [];
    console.log('📝 Posts to display:', posts.length);

    content.innerHTML = `
        <p><strong>Campaign:</strong> ${data.campaign_name || 'Imported Campaign'}</p>
        <p><strong>Total Posts:</strong> ${posts.length}</p>
        <p><strong>Date Range:</strong> ${posts[0]?.scheduled_date} to ${posts[posts.length - 1]?.scheduled_date}</p>
        <p><strong>Platforms:</strong> ${[...new Set(posts.flatMap(p => p.platforms))].join(', ')}</p>
        <hr>
        <h4>Sample Posts:</h4>
        ${posts.slice(0, 3).map(post => `
            <div class="import-preview-item">
                <strong>${post.scheduled_date} ${post.scheduled_time}</strong><br>
                ${post.text}<br>
                <small>Platforms: ${post.platforms.join(', ')}</small>
            </div>
        `).join('')}
        ${posts.length > 3 ? `<p>...and ${posts.length - 3} more posts</p>` : ''}
    `;

    preview.style.display = 'block';
    console.log('✅ Preview display set to block');
    console.log('🔍 Preview computed style:', window.getComputedStyle(preview).display);
}

// Confirm import
async function confirmImport() {
    console.log('📥 Starting import process...');

    if (!importData || !importData.posts) {
        alert('No data to import');
        return;
    }

    const totalPosts = importData.posts.length;
    console.log(`📊 Total posts to import: ${totalPosts}`);

    // Show progress
    const importBtn = document.getElementById('confirmImportBtn');
    const originalText = importBtn.innerHTML;
    importBtn.disabled = true;

    try {
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < importData.posts.length; i++) {
            const post = importData.posts[i];

            // Update progress
            importBtn.innerHTML = `⏳ Importing ${i + 1}/${totalPosts}...`;
            console.log(`📤 Importing post ${i + 1}/${totalPosts}:`, post);

            try {
                const response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(post)
                });

                console.log(`📡 Response for post ${i + 1}:`, response.status);

                if (response.ok) {
                    successCount++;
                    console.log(`✅ Post ${i + 1} imported successfully`);
                } else {
                    failCount++;
                    const errorText = await response.text();
                    console.error(`❌ Post ${i + 1} failed:`, errorText);
                }
            } catch (error) {
                failCount++;
                console.error(`❌ Error importing post ${i + 1}:`, error);
            }
        }

        console.log(`📊 Import summary: ${successCount} success, ${failCount} failed`);

        importBtn.innerHTML = '✅ Import Complete!';

        setTimeout(() => {
            closeAllModals();
            alert(`Import complete!\n\n✅ ${successCount} posts imported successfully\n${failCount > 0 ? '❌ ' + failCount + ' posts failed' : ''}`);

            // Reload posts
            console.log('🔄 Reloading posts list...');
            loadPosts();

            importBtn.innerHTML = originalText;
            importBtn.disabled = false;
        }, 1500);

    } catch (error) {
        console.error('❌ Error importing posts:', error);
        alert('Failed to import posts: ' + error.message);
        importBtn.innerHTML = originalText;
        importBtn.disabled = false;
    }
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    importData = null;
    document.getElementById('importPreview').style.display = 'none';
}

// Open post modal (for empty state button)
function openPostModal() {
    window.location.href = '/calendar';
}

// Close import modal
function closeImportModal() {
    closeAllModals();
}
