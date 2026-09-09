/* ==========================================================================
   St Oran's Peer Hub — Data layer
   Everything is stored in localStorage so the prototype works fully
   client-side on GitHub Pages, with no backend required.
   ========================================================================== */

const PH_KEY = 'peerhub_v1';

const PH_SUBJECTS = ['Mathematics','English','Biology','Chemistry','Physics','History','Art','Te Reo Māori','Music','Computer Science'];

const PH_THOUGHTS = [
  "Small steps, taken daily, outpace giant leaps taken rarely.",
  "You don't have to see the whole staircase, just the next step.",
  "Progress is quieter than perfection, and twice as useful.",
  "Ask for help early — it's cheaper than fixing things late.",
  "A calm desk makes for a calm mind.",
  "Today's effort is next month's ease.",
  "Rest is part of the plan, not a break from it.",
  "The peer who explains it well often understands it best."
];

const PH_RORO_LINES = {
  home: ["Welcome back! I tidied your desk while you were gone. 🌿", "Peer Points look good today — keep it up!"],
  calendar: ["Don't forget to colour-code your chaos.", "A busy week ahead — want a study block booked in?"],
  assignments: ["Nothing overdue yet. Let's keep it that way!", "Ticking things off feels good, doesn't it?"],
  findPeer: ["Someone out there is great at the thing you're stuck on.", "Helping others is how you bank Peer Points too!"],
  resources: ["I sorted these by subject, just for you.", "New notes were added recently — have a look!"],
  study: ["Focus mode: engaged. I'll be quiet now.", "Great streak! Roro is proud. 🐉"],
  profile: ["Looking sharp! Your profile is your first impression.", "Add a subject or two — peers can find you faster."],
  progress: ["Look how far you've come this term!", "Badges are basically dragon treasure. Collect them."],
  settings: ["Tidy settings, tidy mind.", "Signing out? I'll guard the Hub till you're back."]
};

function phUid(){ return 'id_' + Math.random().toString(36).slice(2,10); }

function phDefaultData(){
  const today = new Date();
  const iso = (d)=> d.toISOString().slice(0,10);
  const addDays = (n)=>{ const d = new Date(today); d.setDate(d.getDate()+n); return d; };

  return {
    session: null, // logged in username
    users: {
      'demo.aria': {
        username:'demo.aria', password:'peerhub', name:'Aria Whitfield', year:'Year 12',
        bio:'Trying to be organised one term at a time.',
        subjects:['Mathematics','Chemistry','Art'],
        interests:['Debate Club','Painting'],
        avatarColor:'#C6A15B',
        prefs:{ notifications:true, weeklyDigest:true, publicProfile:true },
        points: 340, helped: 9, sessions: 26, streak: 5,
        badges:['First Session','Helpful Hand','Five-Day Streak']
      },
      'demo.kai': {
        username:'demo.kai', password:'peerhub', name:'Kai Ngata', year:'Year 13',
        bio:'Physics nerd, occasional peer tutor.',
        subjects:['Physics','Mathematics','Computer Science'],
        interests:['Robotics','Chess'],
        avatarColor:'#7A2E37',
        prefs:{ notifications:true, weeklyDigest:false, publicProfile:true },
        points: 610, helped: 21, sessions: 48, streak: 12,
        badges:['First Session','Helpful Hand','Five-Day Streak','Study Marathon','Peer Champion']
      }
    },
    peers: [
      { id:phUid(), name:'Priya Nair', year:'Year 13', subjects:['Mathematics','Physics'], availability:'now', rating:4.9, blurb:'Happy to explain calculus slowly. No judgement!' },
      { id:phUid(), name:'Tomasi Fifita', year:'Year 11', subjects:['English','History'], availability:'soon', rating:4.7, blurb:'Essay structure is my thing.' },
      { id:phUid(), name:'Grace Liu', year:'Year 12', subjects:['Chemistry','Biology'], availability:'now', rating:5.0, blurb:'Lab reports, balancing equations, all of it.' },
      { id:phUid(), name:'Mereana Walker', year:'Year 12', subjects:['Te Reo Māori','Art'], availability:'later', rating:4.8, blurb:'Kaupapa Māori projects and portfolio feedback.' },
      { id:phUid(), name:'Ben Carter', year:'Year 13', subjects:['Computer Science','Mathematics'], availability:'soon', rating:4.6, blurb:'Debugging buddy, will rubber-duck anything.' },
      { id:phUid(), name:'Isla Fraser', year:'Year 10', subjects:['Music','English'], availability:'now', rating:4.9, blurb:'Music theory + essay planning.' }
    ],
    assignments: {
      'demo.aria': [
        { id:phUid(), title:'Calculus problem set 4', subject:'Mathematics', due: iso(addDays(2)), priority:'high', done:false },
        { id:phUid(), title:'Titration lab write-up', subject:'Chemistry', due: iso(addDays(4)), priority:'medium', done:false },
        { id:phUid(), title:'Self-portrait sketch series', subject:'Art', due: iso(addDays(9)), priority:'low', done:false },
        { id:phUid(), title:'Algebra revision worksheet', subject:'Mathematics', due: iso(addDays(-2)), priority:'medium', done:true }
      ],
      'demo.kai': [
        { id:phUid(), title:'Mechanics test corrections', subject:'Physics', due: iso(addDays(1)), priority:'high', done:false },
        { id:phUid(), title:'Python assignment: sorting', subject:'Computer Science', due: iso(addDays(5)), priority:'medium', done:false }
      ]
    },
    events: {
      'demo.aria': [
        { id:phUid(), title:'Maths peer session with Priya', date: iso(addDays(1)), importance:'high' },
        { id:phUid(), title:'Chemistry lab', date: iso(addDays(2)), importance:'medium' },
        { id:phUid(), title:'Art portfolio review', date: iso(addDays(6)), importance:'low' },
        { id:phUid(), title:'Study group — Room 4', date: iso(addDays(3)), importance:'medium' }
      ],
      'demo.kai': [
        { id:phUid(), title:'Physics test', date: iso(addDays(1)), importance:'high' },
        { id:phUid(), title:'Robotics club', date: iso(addDays(4)), importance:'low' }
      ]
    },
    resources: [
      { id:phUid(), subject:'Mathematics', title:'Calculus quick-reference sheet', type:'Notes', addedBy:'Kai Ngata' },
      { id:phUid(), subject:'Mathematics', title:'Trig identities cheat sheet', type:'Notes', addedBy:'Priya Nair' },
      { id:phUid(), subject:'Chemistry', title:'Titration walkthrough video', type:'Video', addedBy:'Grace Liu' },
      { id:phUid(), subject:'English', title:'Essay structure template', type:'Template', addedBy:'Tomasi Fifita' },
      { id:phUid(), subject:'Physics', title:'Mechanics formula pack', type:'Notes', addedBy:'Kai Ngata' },
      { id:phUid(), subject:'Computer Science', title:'Intro to sorting algorithms', type:'Guide', addedBy:'Ben Carter' },
      { id:phUid(), subject:'Art', title:'Portfolio presentation tips', type:'Guide', addedBy:'Mereana Walker' },
      { id:phUid(), subject:'Te Reo Māori', title:'Common phrases audio pack', type:'Audio', addedBy:'Mereana Walker' }
    ],
    notifications: {
      'demo.aria': [
        { id:phUid(), text:'Priya Nair accepted your peer request.', time:'2h ago', read:false },
        { id:phUid(), text:'Calculus problem set 4 is due in 2 days.', time:'5h ago', read:false },
        { id:phUid(), text:'You earned the "Five-Day Streak" badge!', time:'1d ago', read:true }
      ],
      'demo.kai': [
        { id:phUid(), text:'Ben Carter sent you a study session request.', time:'1h ago', read:false }
      ]
    },
    studyLog: {
      'demo.aria': { minutesThisWeek:[40,55,20,60,35,0,15] },
      'demo.kai': { minutesThisWeek:[50,50,50,50,25,10,0] }
    }
  };
}

const PeerHub = {
  _data:null,

  load(){
    if(this._data) return this._data;
    const raw = localStorage.getItem(PH_KEY);
    if(raw){
      try{ this._data = JSON.parse(raw); return this._data; }catch(e){ /* fall through to reset */ }
    }
    this._data = phDefaultData();
    this.save();
    return this._data;
  },
  save(){ localStorage.setItem(PH_KEY, JSON.stringify(this._data)); },
  reset(){ this._data = phDefaultData(); this.save(); },

  currentUsername(){ return this.load().session; },
  currentUser(){
    const d = this.load();
    return d.session ? d.users[d.session] : null;
  },
  login(username, password){
    const d = this.load();
    const u = d.users[username];
    if(u && u.password === password){ d.session = username; this.save(); return true; }
    return false;
  },
  logout(){ const d = this.load(); d.session = null; this.save(); },
  signup({username,name,year,password}){
    const d = this.load();
    if(d.users[username]) return {ok:false, error:'That username is already taken.'};
    d.users[username] = {
      username, password, name, year: year || 'Year 9',
      bio:'New to the Peer Hub — excited to get started!',
      subjects:[], interests:[], avatarColor:'#24493A',
      prefs:{ notifications:true, weeklyDigest:true, publicProfile:true },
      points:20, helped:0, sessions:0, streak:0, badges:['First Session']
    };
    d.assignments[username] = [];
    d.events[username] = [];
    d.notifications[username] = [{ id:phUid(), text:'Welcome to St Oran\u2019s Peer Hub!', time:'now', read:false }];
    d.studyLog[username] = { minutesThisWeek:[0,0,0,0,0,0,0] };
    d.session = username;
    this.save();
    return {ok:true};
  },

  updateUser(patch){
    const d = this.load(); const u = d.session;
    Object.assign(d.users[u], patch);
    this.save();
  },

  assignmentsFor(user){ return this.load().assignments[user] || []; },
  addAssignment(user, a){
    const d = this.load();
    d.assignments[user] = d.assignments[user] || [];
    d.assignments[user].unshift({ id:phUid(), done:false, ...a });
    this.save();
  },
  toggleAssignment(user, id){
    const d = this.load();
    const item = (d.assignments[user]||[]).find(x=>x.id===id);
    if(item){ item.done = !item.done; if(item.done){ d.users[user].points += 5; } this.save(); }
  },
  deleteAssignment(user, id){
    const d = this.load();
    d.assignments[user] = (d.assignments[user]||[]).filter(x=>x.id!==id);
    this.save();
  },

  eventsFor(user){ return this.load().events[user] || []; },
  addEvent(user, e){
    const d = this.load();
    d.events[user] = d.events[user] || [];
    d.events[user].push({ id:phUid(), ...e });
    this.save();
  },
  deleteEvent(user, id){
    const d = this.load();
    d.events[user] = (d.events[user]||[]).filter(x=>x.id!==id);
    this.save();
  },

  allPeers(){ return this.load().peers; },
  allResources(){ return this.load().resources; },

  notificationsFor(user){ return this.load().notifications[user] || []; },
  markAllRead(user){
    const d = this.load();
    (d.notifications[user]||[]).forEach(n=>n.read=true);
    this.save();
  },

  studyMinutesFor(user){ return (this.load().studyLog[user] || {minutesThisWeek:[0,0,0,0,0,0,0]}).minutesThisWeek; },
  logStudyMinutes(user, minutes){
    const d = this.load();
    d.studyLog[user] = d.studyLog[user] || { minutesThisWeek:[0,0,0,0,0,0,0] };
    const dow = (new Date().getDay()+6)%7; // Mon=0
    d.studyLog[user].minutesThisWeek[dow] += minutes;
    d.users[user].sessions += 1;
    d.users[user].points += Math.round(minutes/5);
    this.save();
  },

  thoughtOfDay(){
    const idx = new Date().getDate() % PH_THOUGHTS.length;
    return PH_THOUGHTS[idx];
  },
  roroLine(page){
    const lines = PH_RORO_LINES[page] || ["Hi there! I'm Roro."];
    return lines[Math.floor(Math.random()*lines.length)];
  }
};
