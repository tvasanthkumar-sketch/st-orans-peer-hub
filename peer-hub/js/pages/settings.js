document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('settings');
  if(!user) return;

  document.getElementById('st-username').value = user.username;
  document.getElementById('st-name').value = user.name;
  document.getElementById('st-notifications').checked = user.prefs.notifications;
  document.getElementById('st-digest').checked = user.prefs.weeklyDigest;

  document.getElementById('st-save-account').addEventListener('click', ()=>{
    const name = document.getElementById('st-name').value.trim();
    if(!name) return;
    PeerHub.updateUser({ name });
    phToast('Account details saved.');
  });

  document.getElementById('st-save-password').addEventListener('click', ()=>{
    const pw = document.getElementById('st-password').value;
    if(!pw){ phToast('Enter a new password first.'); return; }
    PeerHub.updateUser({ password: pw });
    document.getElementById('st-password').value = '';
    phToast('Password updated.');
  });

  document.getElementById('st-notifications').addEventListener('change', (e)=>{
    PeerHub.updateUser({ prefs: { ...PeerHub.currentUser().prefs, notifications:e.target.checked }});
    phToast('Notification settings saved.');
  });
  document.getElementById('st-digest').addEventListener('change', (e)=>{
    PeerHub.updateUser({ prefs: { ...PeerHub.currentUser().prefs, weeklyDigest:e.target.checked }});
    phToast('Notification settings saved.');
  });

  document.getElementById('st-signout').addEventListener('click', ()=>{
    PeerHub.logout();
    window.location.href = 'index.html';
  });
});
