let phProfUser = null;

document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('profile');
  if(!user) return;
  phProfUser = user;

  document.getElementById('profile-avatar').textContent = phInitials(user.name);
  document.getElementById('profile-avatar').style.background = user.avatarColor || 'var(--forest)';
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-year').textContent = user.year;
  document.getElementById('pf-bio').value = user.bio;
  document.getElementById('pf-year').value = user.year;
  document.getElementById('pf-public').checked = user.prefs.publicProfile;
  document.getElementById('pf-digest').checked = user.prefs.weeklyDigest;

  document.getElementById('snap-points').textContent = user.points;
  document.getElementById('snap-helped').textContent = user.helped;
  document.getElementById('snap-sessions').textContent = user.sessions;
  document.getElementById('snap-streak').textContent = user.streak + ' days';

  renderSubjects();
  renderInterests();
  document.getElementById('pf-add-subject').innerHTML = PH_SUBJECTS
    .filter(s=>!phProfUser.subjects.includes(s))
    .map(s=>`<option>${s}</option>`).join('');

  document.getElementById('profile-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    PeerHub.updateUser({
      bio: document.getElementById('pf-bio').value.trim(),
      year: document.getElementById('pf-year').value
    });
    phProfUser = PeerHub.currentUser();
    document.getElementById('profile-year').textContent = phProfUser.year;
    phToast('Profile updated.');
  });

  document.getElementById('pf-public').addEventListener('change', savePrefs);
  document.getElementById('pf-digest').addEventListener('change', savePrefs);

  document.getElementById('pf-add-subject-btn').addEventListener('click', ()=>{
    const sel = document.getElementById('pf-add-subject');
    if(!sel.value) return;
    const subs = [...phProfUser.subjects, sel.value];
    PeerHub.updateUser({ subjects: subs });
    phProfUser = PeerHub.currentUser();
    renderSubjects();
    sel.querySelector(`option[value="${sel.value}"]`)?.remove();
    document.getElementById('pf-add-subject').innerHTML = PH_SUBJECTS
      .filter(s=>!phProfUser.subjects.includes(s)).map(s=>`<option>${s}</option>`).join('');
    phToast('Subject added to your profile.');
  });

  document.getElementById('pf-add-interest-btn').addEventListener('click', ()=>{
    const input = document.getElementById('pf-add-interest');
    if(!input.value.trim()) return;
    const interests = [...phProfUser.interests, input.value.trim()];
    PeerHub.updateUser({ interests });
    phProfUser = PeerHub.currentUser();
    renderInterests();
    input.value = '';
  });
});

function savePrefs(){
  PeerHub.updateUser({ prefs: {
    ...phProfUser.prefs,
    publicProfile: document.getElementById('pf-public').checked,
    weeklyDigest: document.getElementById('pf-digest').checked
  }});
  phProfUser = PeerHub.currentUser();
  phToast('Preferences saved.');
}

function renderSubjects(){
  document.getElementById('profile-subjects').innerHTML = phProfUser.subjects.length
    ? phProfUser.subjects.map(s=>`<span class="chip chip-gold">${s}</span>`).join('')
    : '<span class="text-muted" style="font-size:.85rem;">No subjects added yet.</span>';
}
function renderInterests(){
  document.getElementById('profile-interests').innerHTML = phProfUser.interests.length
    ? phProfUser.interests.map(s=>`<span class="chip">${phEscape(s)}</span>`).join('')
    : '<span class="text-muted" style="font-size:.85rem;">No interests added yet.</span>';
}
