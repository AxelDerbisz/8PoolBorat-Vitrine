// Global state
let currentSection = 'clubInfo';
let teamsData = [];
let newsData = [];
let sponsorsData = [];
let messagesData = [];

// Show section
function showSection(sectionName) {
    currentSection = sectionName;

    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');
}

// Show alert
function showAlert(element, type, message) {
    element.className = `alert alert-${type} show`;
    element.textContent = message;
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}

function showGlobalAlert(type, message) {
    const alertDiv = document.getElementById('globalAlert');
    showAlert(alertDiv, type, message);
}

// ==================== CLUB INFO ====================

async function loadClubInfo() {
    const loadingDiv = document.getElementById('clubInfoLoading');
    const contentDiv = document.getElementById('clubInfoContent');

    try {
        const docRef = doc(db, 'clubInfo', 'main');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('club_name').value = data.name || '';
            document.getElementById('club_founded').value = data.founded || '';
            document.getElementById('club_description').value = data.description || '';
            document.getElementById('club_history').value = data.history || '';
            document.getElementById('club_address').value = data.address || '';
            document.getElementById('club_phone').value = data.phone || '';
            document.getElementById('club_email').value = data.email || '';
        }

        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading club info:', error);
        showGlobalAlert('error', 'Erreur lors du chargement des informations');
    }
}

// Save club info
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clubInfoForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: document.getElementById('club_name').value,
                founded: document.getElementById('club_founded').value,
                description: document.getElementById('club_description').value,
                history: document.getElementById('club_history').value,
                address: document.getElementById('club_address').value,
                phone: document.getElementById('club_phone').value,
                email: document.getElementById('club_email').value,
                updatedAt: Timestamp.now()
            };

            try {
                await setDoc(doc(db, 'clubInfo', 'main'), data);
                showGlobalAlert('success', '✅ Informations du club sauvegardées !');
            } catch (error) {
                console.error('Error saving club info:', error);
                showGlobalAlert('error', '❌ Erreur lors de la sauvegarde');
            }
        });
    }
});

// ==================== TEAMS ====================

async function loadTeams() {
    const loadingDiv = document.getElementById('teamsLoading');
    const contentDiv = document.getElementById('teamsContent');

    try {
        const querySnapshot = await getDocs(collection(db, 'teams'));
        teamsData = [];
        querySnapshot.forEach((doc) => {
            teamsData.push({ id: doc.id, ...doc.data() });
        });

        renderTeams();
        loadingDiv.classList.add('hidden');
    } catch (error) {
        console.error('Error loading teams:', error);
        showGlobalAlert('error', 'Erreur lors du chargement des équipes');
    }
}

function renderTeams() {
    const contentDiv = document.getElementById('teamsContent');

    if (teamsData.length === 0) {
        contentDiv.innerHTML = '<p class="help-text">Aucune équipe. Cliquez sur "Ajouter une équipe" pour commencer.</p>';
        return;
    }

    contentDiv.innerHTML = teamsData.map(team => {
        const schedule = team.schedule || [];
        const scheduleHtml = schedule.map((match, idx) => `
            <div class="schedule-item" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; background: #f9f9f9;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #1a472a;">Match ${idx + 1}</strong>
                    <button type="button" onclick="removeMatch('${team.id}', ${idx})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">❌ Supprimer</button>
                </div>
                <div class="grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <div>
                        <label style="font-size: 12px; color: #666;">Date</label>
                        <input type="date" name="schedule_date_${idx}" value="${match.date || ''}" required style="width: 100%; padding: 6px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="font-size: 12px; color: #666;">Adversaire</label>
                        <input type="text" name="schedule_opponent_${idx}" value="${match.opponent || ''}" required style="width: 100%; padding: 6px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="font-size: 12px; color: #666;">Lieu</label>
                        <input type="text" name="schedule_location_${idx}" value="${match.location || ''}" required style="width: 100%; padding: 6px; font-size: 14px;">
                    </div>
                </div>
            </div>
        `).join('');

        return `
        <div class="item-card">
            <h3>${team.name || 'Sans nom'}</h3>
            <form onsubmit="saveTeam(event, '${team.id}')">
                <div class="grid">
                    <div class="form-group">
                        <label>Nom de l'équipe</label>
                        <input type="text" name="name" value="${team.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Division</label>
                        <input type="text" name="division" value="${team.division || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Capitaine</label>
                    <input type="text" name="captain" value="${team.captain || ''}" required>
                </div>
                <div class="form-group">
                    <label>Joueurs (un par ligne)</label>
                    <textarea name="players" rows="4">${(team.players || []).join('\n')}</textarea>
                    <span class="help-text">Entrez un joueur par ligne</span>
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <label style="margin: 0;">📅 Prochains matchs</label>
                        <button type="button" onclick="addMatch('${team.id}')" class="btn" style="padding: 6px 12px; font-size: 14px;">➕ Ajouter un match</button>
                    </div>
                    <div id="schedule_${team.id}">
                        ${scheduleHtml || '<p style="color: #999; font-style: italic;">Aucun match programmé</p>'}
                    </div>
                    <input type="hidden" name="schedule_count" value="${schedule.length}">
                </div>
                <div class="action-buttons">
                    <button type="submit" class="btn btn-success">💾 Sauvegarder</button>
                    <button type="button" onclick="deleteTeam('${team.id}')" class="btn btn-danger">🗑️ Supprimer</button>
                </div>
            </form>
        </div>
    `}).join('');
}

function addMatch(teamId) {
    const team = teamsData.find(t => t.id === teamId);
    if (!team) return;

    if (!team.schedule) {
        team.schedule = [];
    }

    team.schedule.push({
        date: '',
        opponent: '',
        location: 'Domicile'
    });

    renderTeams();
    showGlobalAlert('info', '➕ Match ajouté. N\'oubliez pas de sauvegarder !');
}

function removeMatch(teamId, matchIndex) {
    const team = teamsData.find(t => t.id === teamId);
    if (!team || !team.schedule) return;

    if (confirm('Supprimer ce match ?')) {
        team.schedule.splice(matchIndex, 1);
        renderTeams();
        showGlobalAlert('info', '🗑️ Match supprimé. N\'oubliez pas de sauvegarder !');
    }
}

function addNewTeam() {
    const newTeam = {
        id: 'new_' + Date.now(),
        name: 'Nouvelle équipe',
        division: '',
        captain: '',
        players: [],
        schedule: []
    };
    teamsData.unshift(newTeam);
    renderTeams();
    showGlobalAlert('info', 'Nouvelle équipe ajoutée. N\'oubliez pas de sauvegarder !');
}

async function saveTeam(event, teamId) {
    event.preventDefault();
    const form = event.target;

    // Extract schedule data
    const scheduleCount = parseInt(form.schedule_count.value) || 0;
    const schedule = [];

    for (let i = 0; i < scheduleCount; i++) {
        const date = form[`schedule_date_${i}`]?.value;
        const opponent = form[`schedule_opponent_${i}`]?.value;
        const location = form[`schedule_location_${i}`]?.value;

        if (date && opponent && location) {
            schedule.push({
                date: date,
                opponent: opponent,
                location: location
            });
        }
    }

    const data = {
        name: form.name.value,
        division: form.division.value,
        captain: form.captain.value,
        players: form.players.value.split('\n').filter(p => p.trim()),
        schedule: schedule,
        updatedAt: Timestamp.now()
    };

    try {
        if (teamId.startsWith('new_')) {
            // Add new team
            const docRef = await addDoc(collection(db, 'teams'), data);
            showGlobalAlert('success', '✅ Équipe ajoutée !');
            await loadTeams(); // Reload to get real ID
        } else {
            // Update existing team
            await setDoc(doc(db, 'teams', teamId), data);
            showGlobalAlert('success', '✅ Équipe mise à jour !');
        }
    } catch (error) {
        console.error('Error saving team:', error);
        showGlobalAlert('error', '❌ Erreur lors de la sauvegarde');
    }
}

async function deleteTeam(teamId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;

    try {
        if (!teamId.startsWith('new_')) {
            await deleteDoc(doc(db, 'teams', teamId));
        }
        teamsData = teamsData.filter(t => t.id !== teamId);
        renderTeams();
        showGlobalAlert('success', '✅ Équipe supprimée !');
    } catch (error) {
        console.error('Error deleting team:', error);
        showGlobalAlert('error', '❌ Erreur lors de la suppression');
    }
}

// ==================== NEWS ====================

async function loadNews() {
    console.log('🔍 loadNews() called at:', new Date().toISOString());
    const loadingDiv = document.getElementById('newsLoading');
    const contentDiv = document.getElementById('newsContent');
    console.log('📋 Elements found - loading:', loadingDiv, 'content:', contentDiv);

    try {
        console.log('📡 Creating Firestore query for news collection...');
        const q = query(collection(db, 'news'), orderBy('date', 'desc'));
        console.log('🔄 Executing getDocs query...');
        const querySnapshot = await getDocs(q);
        console.log('✅ Query successful! Document count:', querySnapshot.size);

        newsData = [];
        querySnapshot.forEach((doc) => {
            const docData = { id: doc.id, ...doc.data() };
            newsData.push(docData);
            console.log('📄 News item loaded:', doc.id, '- Title:', docData.title);
        });

        console.log('📊 Total newsData.length:', newsData.length);
        console.log('🎨 Calling renderNews()...');
        renderNews();
        console.log('✨ renderNews() completed');
        loadingDiv.classList.add('hidden');
        console.log('✅ loadNews() completed successfully');
    } catch (error) {
        console.error('❌ Error loading news:', error);
        console.error('❌ Error details:', error.message, error.stack);
        showGlobalAlert('error', 'Erreur lors du chargement des actualités');
    }
}

function renderNews() {
    console.log('🎨 renderNews() called with newsData.length:', newsData.length);
    const contentDiv = document.getElementById('newsContent');
    console.log('📋 contentDiv element:', contentDiv);

    if (newsData.length === 0) {
        console.log('⚠️ No news data, showing empty message');
        contentDiv.innerHTML = '<p class="help-text">Aucune actualité. Cliquez sur "Ajouter une actualité" pour commencer.</p>';
        return;
    }

    console.log('✅ Rendering', newsData.length, 'news items...');

    // Summary table
    let html = `
        <div style="margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="margin-bottom: 15px; color: #1a472a;">📋 Liste des actualités (${newsData.length})</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #1a472a; color: white;">
                        <th style="padding: 10px; text-align: left;">Titre</th>
                        <th style="padding: 10px; text-align: left;">Catégorie</th>
                        <th style="padding: 10px; text-align: left;">Date</th>
                        <th style="padding: 10px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    newsData.forEach((news, index) => {
        const date = news.date?.toDate ? news.date.toDate().toLocaleDateString('fr-FR') : 'N/A';
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';

        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">
                    <strong>${news.title || 'Sans titre'}</strong>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">
                    <span style="background: #1a472a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${news.category || 'N/A'}
                    </span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${date}</td>
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: center;">
                    <button onclick="scrollToNews('${news.id}')" class="btn" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;">✏️ Éditer</button>
                    <button onclick="deleteNews('${news.id}')" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">🗑️ Supprimer</button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
        <h3 style="margin-bottom: 20px; color: #1a472a;">✏️ Éditer les actualités</h3>
    `;

    // Detailed edit cards
    html += newsData.map(news => {
        const date = news.date?.toDate ? news.date.toDate().toISOString().split('T')[0] : '';
        const excerpt = (news.content || '').substring(0, 100) + (news.content?.length > 100 ? '...' : '');

        return `
        <div class="item-card" id="news-${news.id}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;">${news.title || 'Sans titre'}</h3>
                <span style="background: #1a472a; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px;">
                    ${news.category || 'N/A'}
                </span>
            </div>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px; font-style: italic;">${excerpt}</p>
            <form onsubmit="saveNews(event, '${news.id}')">
                <div class="form-group">
                    <label>Titre</label>
                    <input type="text" name="title" value="${news.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>Catégorie</label>
                    <select name="category" required>
                        <option value="actualité" ${news.category === 'actualité' ? 'selected' : ''}>Actualité</option>
                        <option value="événement" ${news.category === 'événement' ? 'selected' : ''}>Événement</option>
                        <option value="résultat" ${news.category === 'résultat' ? 'selected' : ''}>Résultat</option>
                        <option value="tournoi" ${news.category === 'tournoi' ? 'selected' : ''}>Tournoi</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Contenu</label>
                    <textarea name="content" rows="6" required>${news.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Date de publication</label>
                    <input type="date" name="date" value="${date}" required>
                </div>
                <div class="action-buttons">
                    <button type="submit" class="btn btn-success">💾 Sauvegarder</button>
                    <button type="button" onclick="deleteNews('${news.id}')" class="btn btn-danger">🗑️ Supprimer</button>
                </div>
            </form>
        </div>
    `}).join('');

    contentDiv.innerHTML = html;
}

// Helper function to scroll to specific news card
function scrollToNews(newsId) {
    const element = document.getElementById(`news-${newsId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.boxShadow = '0 0 20px rgba(26, 71, 42, 0.5)';
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 2000);
    }
}

function addNewNews() {
    const newNews = {
        id: 'new_' + Date.now(),
        title: 'Nouvelle actualité',
        category: 'actualité',
        content: '',
        date: new Date()
    };
    newsData.unshift(newNews);
    renderNews();
    showGlobalAlert('info', 'Nouvelle actualité ajoutée. N\'oubliez pas de sauvegarder !');
}

async function saveNews(event, newsId) {
    event.preventDefault();
    const form = event.target;

    const data = {
        title: form.title.value,
        category: form.category.value,
        content: form.content.value,
        date: Timestamp.fromDate(new Date(form.date.value)),
        updatedAt: Timestamp.now()
    };

    try {
        if (newsId.startsWith('new_')) {
            await addDoc(collection(db, 'news'), data);
            showGlobalAlert('success', '✅ Actualité ajoutée !');
            await loadNews();
        } else {
            await setDoc(doc(db, 'news', newsId), data);
            showGlobalAlert('success', '✅ Actualité mise à jour !');
        }
    } catch (error) {
        console.error('Error saving news:', error);
        showGlobalAlert('error', '❌ Erreur lors de la sauvegarde');
    }
}

async function deleteNews(newsId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;

    try {
        if (!newsId.startsWith('new_')) {
            await deleteDoc(doc(db, 'news', newsId));
        }
        newsData = newsData.filter(n => n.id !== newsId);
        renderNews();
        showGlobalAlert('success', '✅ Actualité supprimée !');
    } catch (error) {
        console.error('Error deleting news:', error);
        showGlobalAlert('error', '❌ Erreur lors de la suppression');
    }
}

// ==================== SPONSORS ====================

async function loadSponsors() {
    const loadingDiv = document.getElementById('sponsorsLoading');
    const contentDiv = document.getElementById('sponsorsContent');

    try {
        const querySnapshot = await getDocs(collection(db, 'sponsors'));
        sponsorsData = [];
        querySnapshot.forEach((doc) => {
            sponsorsData.push({ id: doc.id, ...doc.data() });
        });

        renderSponsors();
        loadingDiv.classList.add('hidden');
    } catch (error) {
        console.error('Error loading sponsors:', error);
        showGlobalAlert('error', 'Erreur lors du chargement des partenaires');
    }
}

function renderSponsors() {
    const contentDiv = document.getElementById('sponsorsContent');

    if (sponsorsData.length === 0) {
        contentDiv.innerHTML = '<p class="help-text">Aucun partenaire. Cliquez sur "Ajouter un partenaire" pour commencer.</p>';
        return;
    }

    contentDiv.innerHTML = sponsorsData.map(sponsor => `
        <div class="item-card">
            <h3>${sponsor.name || 'Sans nom'}</h3>
            <form onsubmit="saveSponsor(event, '${sponsor.id}')">
                <div class="form-group">
                    <label>Nom du partenaire</label>
                    <input type="text" name="name" value="${sponsor.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select name="type" required>
                        <option value="principal" ${sponsor.type === 'principal' ? 'selected' : ''}>Principal</option>
                        <option value="officiel" ${sponsor.type === 'officiel' ? 'selected' : ''}>Officiel</option>
                        <option value="partenaire" ${sponsor.type === 'partenaire' ? 'selected' : ''}>Partenaire</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>URL du logo</label>
                    <input type="url" name="logo" value="${sponsor.logo || ''}" placeholder="https://example.com/logo.png">
                    <span class="help-text">URL de l'image du logo</span>
                </div>
                <div class="form-group">
                    <label>Site web</label>
                    <input type="url" name="website" value="${sponsor.website || ''}" placeholder="https://example.com">
                </div>
                <div class="action-buttons">
                    <button type="submit" class="btn btn-success">💾 Sauvegarder</button>
                    <button type="button" onclick="deleteSponsor('${sponsor.id}')" class="btn btn-danger">🗑️ Supprimer</button>
                </div>
            </form>
        </div>
    `).join('');
}

function addNewSponsor() {
    const newSponsor = {
        id: 'new_' + Date.now(),
        name: 'Nouveau partenaire',
        type: 'partenaire',
        logo: '',
        website: ''
    };
    sponsorsData.unshift(newSponsor);
    renderSponsors();
    showGlobalAlert('info', 'Nouveau partenaire ajouté. N\'oubliez pas de sauvegarder !');
}

async function saveSponsor(event, sponsorId) {
    event.preventDefault();
    const form = event.target;

    const data = {
        name: form.name.value,
        type: form.type.value,
        logo: form.logo.value,
        website: form.website.value,
        updatedAt: Timestamp.now()
    };

    try {
        if (sponsorId.startsWith('new_')) {
            await addDoc(collection(db, 'sponsors'), data);
            showGlobalAlert('success', '✅ Partenaire ajouté !');
            await loadSponsors();
        } else {
            await setDoc(doc(db, 'sponsors', sponsorId), data);
            showGlobalAlert('success', '✅ Partenaire mis à jour !');
        }
    } catch (error) {
        console.error('Error saving sponsor:', error);
        showGlobalAlert('error', '❌ Erreur lors de la sauvegarde');
    }
}

async function deleteSponsor(sponsorId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    try {
        if (!sponsorId.startsWith('new_')) {
            await deleteDoc(doc(db, 'sponsors', sponsorId));
        }
        sponsorsData = sponsorsData.filter(s => s.id !== sponsorId);
        renderSponsors();
        showGlobalAlert('success', '✅ Partenaire supprimé !');
    } catch (error) {
        console.error('Error deleting sponsor:', error);
        showGlobalAlert('error', '❌ Erreur lors de la suppression');
    }
}

// ==================== MESSAGES ====================

async function loadMessages() {
    const loadingDiv = document.getElementById('messagesLoading');
    const contentDiv = document.getElementById('messagesContent');

    try {
        const q = query(collection(db, 'contactMessages'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        messagesData = [];
        querySnapshot.forEach((doc) => {
            messagesData.push({ id: doc.id, ...doc.data() });
        });

        renderMessages();
        loadingDiv.classList.add('hidden');
    } catch (error) {
        console.error('Error loading messages:', error);
        showGlobalAlert('error', 'Erreur lors du chargement des messages');
    }
}

function renderMessages() {
    const contentDiv = document.getElementById('messagesContent');

    if (messagesData.length === 0) {
        contentDiv.innerHTML = '<p class="help-text">Aucun message reçu.</p>';
        return;
    }

    contentDiv.innerHTML = messagesData.map(msg => {
        const date = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('fr-FR') : 'Date inconnue';
        const readClass = msg.read ? '' : 'font-weight: bold;';

        return `
        <div class="item-card" style="${readClass}">
            <h3>${msg.subject || 'Sans sujet'}</h3>
            <p><strong>De:</strong> ${msg.name} (${msg.email})</p>
            ${msg.phone ? `<p><strong>Tél:</strong> ${msg.phone}</p>` : ''}
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 6px;">${msg.message}</p>
            <div class="action-buttons">
                <button onclick="markAsRead('${msg.id}')" class="btn btn-secondary">✓ Marquer comme lu</button>
                <button onclick="deleteMessage('${msg.id}')" class="btn btn-danger">🗑️ Supprimer</button>
                <a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}" class="btn">📧 Répondre par email</a>
            </div>
        </div>
    `}).join('');
}

async function markAsRead(messageId) {
    try {
        await updateDoc(doc(db, 'contactMessages', messageId), {
            read: true,
            status: 'read'
        });
        await loadMessages();
        showGlobalAlert('success', '✅ Message marqué comme lu');
    } catch (error) {
        console.error('Error marking message as read:', error);
        showGlobalAlert('error', '❌ Erreur lors de la mise à jour');
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
        await deleteDoc(doc(db, 'contactMessages', messageId));
        messagesData = messagesData.filter(m => m.id !== messageId);
        renderMessages();
        showGlobalAlert('success', '✅ Message supprimé !');
    } catch (error) {
        console.error('Error deleting message:', error);
        showGlobalAlert('error', '❌ Erreur lors de la suppression');
    }
}
