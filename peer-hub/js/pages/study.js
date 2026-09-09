const PH_CIRCUMFERENCE = 2 * Math.PI * 112;
let phStudyUser = null;
let phTimerMode = 'focus';
let phTotalSeconds = 25 * 60;
let phRemaining = phTotalSeconds;
let phInterval = null;
let phRunning = false;
let phFocusMinutesThisSession = 0;

const PH_ENCOURAGE = [
  "You've got this — one focused block at a time.",
  "Halfway there. Roro believes in you.",
  "Deep breath. Eyes on the page. Go!",
  "Small consistent effort beats last-minute panic."
];

document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('study');
  if(!user) return;
  phStudyUser = user;

  document.getElementById('study-roro-line').textContent = PH_ENCOURAGE[Math.floor(Math.random()*PH_ENCOURAGE.length)];

  document.querySelectorAll('.mode-tabs button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.mode-tabs button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      phTimerMode = btn.dataset.mode;
      phTotalSeconds = parseInt(btn.dataset.mins,10) * 60;
      phRemaining = phTotalSeconds;
      pauseTimer();
      updateDisplay();
    });
  });

  document.getElementById('timer-toggle').addEventListener('click', ()=>{
    phRunning ? pauseTimer() : startTimer();
  });
  document.getElementById('timer-reset').addEventListener('click', ()=>{
    pauseTimer();
    phRemaining = phTotalSeconds;
    updateDisplay();
  });

  updateDisplay();
  renderStats();
});

function startTimer(){
  phRunning = true;
  document.getElementById('timer-toggle').textContent = 'Pause';
  phInterval = setInterval(()=>{
    phRemaining--;
    if(phTimerMode === 'focus') phFocusMinutesThisSession = (phTotalSeconds - phRemaining) / 60;
    if(phRemaining <= 0){
      pauseTimer();
      onSessionComplete();
      return;
    }
    updateDisplay();
  }, 1000);
}
function pauseTimer(){
  phRunning = false;
  clearInterval(phInterval);
  document.getElementById('timer-toggle').textContent = 'Start';
}
function onSessionComplete(){
  phRemaining = 0;
  updateDisplay();
  if(phTimerMode === 'focus'){
    PeerHub.logStudyMinutes(phStudyUser.username, Math.round(phTotalSeconds/60));
    phStudyUser = PeerHub.currentUser();
    phToast('Focus session complete — nice work! Time for a break.');
    renderStats();
  } else {
    phToast('Break\u2019s over. Ready for another focus block?');
  }
  phRemaining = phTotalSeconds;
  updateDisplay();
}

function updateDisplay(){
  const m = Math.floor(phRemaining/60);
  const s = phRemaining%60;
  document.getElementById('timer-time').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('timer-mode').textContent =
    phTimerMode === 'focus' ? 'FOCUS MODE' : phTimerMode === 'short' ? 'SHORT BREAK' : 'LONG BREAK';
  const fraction = phRemaining / phTotalSeconds;
  document.getElementById('timer-arc').style.strokeDasharray = PH_CIRCUMFERENCE;
  document.getElementById('timer-arc').style.strokeDashoffset = PH_CIRCUMFERENCE * (1-fraction);
}

function renderStats(){
  const minutes = PeerHub.studyMinutesFor(phStudyUser.username);
  const totalMinutes = minutes.reduce((a,b)=>a+b,0);
  document.getElementById('stat-sessions').textContent = phStudyUser.sessions;
  document.getElementById('stat-minutes').textContent = totalMinutes;
  document.getElementById('stat-streak').textContent = phStudyUser.streak;

  const max = Math.max(...minutes, 60);
  document.getElementById('week-bars').innerHTML = minutes.map(m=>`
    <div style="flex:1; height:${Math.max(4,(m/max)*70)}px; background:linear-gradient(180deg, var(--gold), var(--gold-deep)); border-radius:4px 4px 2px 2px;" title="${m} min"></div>
  `).join('');
}
