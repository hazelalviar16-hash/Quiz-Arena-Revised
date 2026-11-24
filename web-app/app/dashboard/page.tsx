'use client';
import { useEffect, useState } from 'react'; import Link from 'next/link'; import { useRouter } from 'next/navigation'; import { Crown, LayoutDashboard, Users, Target, BookOpen, Trophy, UserRound, Settings, HelpCircle, LogOut, Flame, Wifi, WifiOff, PenLine, Gamepad2, ArrowRight, Plus, Medal, Sun, Moon, Star, Inbox, Palette, ChevronRight, Share2, Copy, Clock3, Accessibility, Volume2, Bell, Monitor } from 'lucide-react'; import { supabase } from '../../lib/supabase';
import { createPreviewRoom, isPreviewMode, previewRoomCode, readPreview, setPreviewPlayerName } from '../../lib/preview';
import { QuizArenaWordmark } from '../quiz-arena-wordmark';

type Quiz = { id: string; title: string; status: string };
const tabs = [
  { id: 'home', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'multiplayer', label: 'Multiplayer', Icon: Users },
  { id: 'solo', label: 'Solo Mode', Icon: Target },
  { id: 'quizzes', label: 'My Quizzes', Icon: BookOpen },
  { id: 'achievements', label: 'Achievements', Icon: Trophy },
  { id: 'profile', label: 'Profile', Icon: UserRound },
  { id: 'settings', label: 'Settings', Icon: Settings },
  { id: 'help', label: 'How to Play', Icon: HelpCircle },
] as const;
type DashboardTab = typeof tabs[number]['id'];

export default function Dashboard() {
  const router = useRouter(); const [quizzes, setQuizzes] = useState<Quiz[]>([]); const [code, setCode] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const [name, setName] = useState('Player'); const [streak, setStreak] = useState(0); const [online, setOnline] = useState(true); const [tab, setTab] = useState<DashboardTab>('home'); const [theme, setTheme] = useState('light'); const [avatar, setAvatar] = useState('#7428c8'); const [large, setLarge] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  useEffect(() => { try { const today = new Date().toLocaleDateString('en-CA'); const last = localStorage.getItem('qa-web-last'); let n = Number(localStorage.getItem('qa-web-streak') || 0); if (last !== today) { const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA'); n = last === yesterday ? n + 1 : 1; localStorage.setItem('qa-web-last', today); localStorage.setItem('qa-web-streak', String(n)) } setStreak(n); const th = localStorage.getItem('qa-web-theme') || 'light'; setTheme(th); document.body.dataset.theme = th; setAvatar(localStorage.getItem('qa-web-avatar') || '#7428c8') } catch { } const change = () => setOnline(navigator.onLine); change(); window.addEventListener('online', change); window.addEventListener('offline', change); return () => { window.removeEventListener('online', change); window.removeEventListener('offline', change) } }, []);
  useEffect(() => {
    function readTab() {
      const selected = window.location.hash.slice(1);
      setTab(tabs.find(({ id }) => id === selected)?.id ?? 'home');
    }
    readTab();
    window.addEventListener('hashchange', readTab);
    return () => window.removeEventListener('hashchange', readTab);
  }, []);

  useEffect(() => {
    if (isPreviewMode) {
      const preview = readPreview();
      setName(preview.playerName);
      setQuizzes(preview.quizzes);
      return;
    }
    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player');
      const { data, error } = await supabase.from('quizzes').select('id,title,status').eq('creator_id', user.id).order('created_at', { ascending: false });
      if (error) setMsg(error.message);
      else setQuizzes(data || []);
    }
    void load();
  }, [router]);

  function openTab(id: DashboardTab) {
    setTab(id);
    window.location.hash = id;
  }

  async function host(quiz: Quiz) {
    setBusy(true);
    setMsg('');
    try {
      if (isPreviewMode) {
        router.push('/room/' + createPreviewRoom(quiz.id));
        return;
      }
      if (!supabase) throw Error('Configure Supabase in web-app/.env.local');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw Error('Please sign in');
      const room = String(Math.floor(100000 + Math.random() * 900000));
      const { data, error } = await supabase.from('game_sessions').insert({ quiz_id: quiz.id, host_id: user.id, room_code: room, status: 'waiting' }).select('room_code').single();
      if (error) throw error;
      router.push('/room/' + data.room_code);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not create room.');
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    if (!/^\d{6}$/.test(code)) return setMsg('Enter a valid six-digit code');
    setBusy(true);
    setMsg('');
    try {
      if (isPreviewMode) {
        if (!readPreview().rooms.some(room => room.room_code === code)) {
          throw Error('Preview room not found. Try code ' + previewRoomCode + '.');
        }
      } else {
        if (!supabase) throw Error('Configure Supabase in web-app/.env.local');
        const { error } = await supabase.rpc('join_game_room', { p_room_code: code });
        if (error) throw error;
      }
      router.push('/room/' + code);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Could not join room');
    } finally {
      setBusy(false);
    }
  }
  function changeTheme(value: string) { setTheme(value); document.body.dataset.theme = value; localStorage.setItem('qa-web-theme', value) }
  async function signOut() {
    setSigningOut(true);
    setSignOutError('');
    try {
      if (isPreviewMode) {
        setPreviewPlayerName();
      } else {
        const result = await supabase?.auth.signOut();
        if (result?.error) throw result.error;
      }
      router.push('/auth');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  const badges = [
    { Icon: Star, label: 'Welcome Player', unlocked: true },
    { Icon: Flame, label: '3-Day Streak', unlocked: streak >= 3 },
    { Icon: Trophy, label: '7-Day Streak', unlocked: streak >= 7 },
    { Icon: PenLine, label: 'Quiz Creator', unlocked: quizzes.length > 0 },
  ];
  const unlockedBadgeCount = badges.filter(({ unlocked }) => unlocked).length;
  return <div className="layout"><aside className="sidebar"><div className="dashboard-wordmark"><QuizArenaWordmark /></div><div className="side-label">YOUR ARENA</div>{tabs.map(({ id, label, Icon }) => <a key={id} href={'#' + id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'location' : undefined}><Icon size={19} />{label}</a>)}<div style={{ flex: 1 }} /><button className="secondary" type="button" disabled={signingOut} onClick={signOut}><LogOut size={18} /> {isPreviewMode ? 'Sign in screen' : signingOut ? 'Signing out…' : 'Sign out'}</button></aside><main className="content">
    {isPreviewMode && <p className="muted"><strong>UI preview.</strong> Changes stay in this browser.</p>}
    {signOutError && <p className="error" role="alert">{signOutError}</p>}
    <div className="dashboard-header"><div><div className="muted small" style={{ fontWeight: 900, letterSpacing: 1 }}>YOUR QUIZ ARENA</div><p className="muted" style={{ margin: '5px 0' }}>Your home for quizzes, challenges and achievements.</p></div><button className="avatar" type="button" aria-label="Open profile" style={{ background: avatar }} onClick={() => openTab('profile')}><UserRound size={25} aria-hidden="true" /></button></div><div className="dashboard-banner"><div><div className="eyebrow">READY, SET, QUIZ!</div><h1>Hey, {name}!</h1><p>Ready to make today a winning day?</p></div><div className="banner-icon"><Crown size={75} fill="#ffc400" color="#ffc400" /></div></div><div className="statrow"><div className="stat"><Flame size={19} /> {streak} day streak</div><div className="stat">{online ? <Wifi size={19} /> : <WifiOff size={19} />} {online ? 'Online' : 'Offline'}</div><div className="stat"><Trophy size={19} /> {unlockedBadgeCount} local {unlockedBadgeCount === 1 ? 'badge' : 'badges'}</div></div>
    {tab === 'home' && <><h2 className="sectiontitle">CHOOSE YOUR ARENA</h2><div className="grid">
      <button type="button" className="mode purple" onClick={() => openTab('multiplayer')}>
        <span className="mode-icon"><Users size={30} aria-hidden="true" /></span>
        <span className="mode-title">Multiplayer Mode</span>
        <span className="mode-description">Join friends or host a live quiz <ArrowRight size={16} aria-hidden="true" /></span>
      </button>
      <button type="button" className="mode pink" onClick={() => openTab('solo')}>
        <span className="mode-icon"><Target size={30} aria-hidden="true" /></span>
        <span className="mode-title">Solo Mode</span>
        <span className="mode-description">Practice at your own pace <ArrowRight size={16} aria-hidden="true" /></span>
      </button>
    </div><h2 className="sectiontitle">QUICK ACTIONS</h2><div className="grid three"><div className="feature"><div className="feature-icon"><PenLine size={23} /></div><b>Create a Quiz</b><p className="muted">Build questions manually.</p><Link href="/quiz/new" className="btn">Create quiz</Link></div><div className="feature"><div className="feature-icon"><Gamepad2 size={23} /></div><b>Join a Room</b><p className="muted">Enter your host's code.</p><button onClick={() => openTab('multiplayer')}>Join game</button></div><div className="feature"><div className="feature-icon"><Medal size={23} /></div><b>My Achievements</b><p className="muted">See your local progress.</p><button className="secondary" onClick={() => openTab('achievements')}>View badges</button></div></div></>}
    {tab === 'multiplayer' && <><h2 className="icon-heading"><Users size={24} /> Multiplayer Mode</h2><div className="grid"><section className="panel stack"><h2 className="icon-heading"><Gamepad2 size={23} /> Join Game</h2><p className="muted">{isPreviewMode ? 'Try the sample room code ' + previewRoomCode + '.' : 'Enter the six-digit room code from your host.'}</p><input aria-label="Room code" className="code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} /><button disabled={busy || code.length !== 6} onClick={join}>Join Game <ArrowRight size={17} /></button></section><section className="panel stack"><h2 className="icon-heading"><Crown size={23} /> Host Game</h2><p className="muted">{isPreviewMode ? 'Choose a sample quiz or one you created in this browser.' : 'Choose a reviewed or published quiz to host.'}</p><button onClick={() => openTab('quizzes')}>Choose a Quiz</button><Link className="btn secondary" href="/quiz/new">+ Create Manually</Link></section></div></>}
    {tab === 'quizzes' && <><div className="nav"><h2 className="icon-heading"><BookOpen size={24} /> My Quizzes</h2><Link className="btn" href="/quiz/new"><Plus size={18} /> New Quiz</Link></div><div className="grid">{quizzes.length === 0 ? <div className="panel"><h2 className="icon-heading"><Inbox size={24} /> No quizzes yet</h2><p className="muted">Create your first quiz to get started.</p><Link href="/quiz/new" className="btn">Create Quiz</Link></div> : quizzes.map(q => <div className="panel" key={q.id}><h3>{q.title}</h3><span className="pill">{q.status}</span><div className="actions" style={{ marginTop: 20 }}><Link className="btn secondary" href={'/quiz/' + q.id}>View questions</Link><button disabled={busy || (!isPreviewMode && !['reviewed', 'published'].includes(q.status))} onClick={() => host(q)}>Host room</button></div></div>)}</div></>}
    {tab === 'solo' && <div className="panel" style={{ textAlign: 'center', padding: 50 }}><div className="empty-icon"><Target size={46} /></div><h2>Solo Practice Arena</h2><p className="muted">Solo gameplay is not connected to the quiz backend yet.</p><button onClick={() => openTab('quizzes')}>Browse My Quizzes</button></div>}
    {tab === 'achievements' && <><h2 className="icon-heading"><Trophy size={24} /> Achievements</h2><p className="muted">These badges are stored locally in this browser.</p><div className="grid three">{badges.map(({ Icon, label, unlocked }) => <div className="badge" key={label} style={{ opacity: unlocked ? 1 : .45 }}><div className="badge-icon"><Icon size={28} /></div><b>{label}</b><p className="muted">{unlocked ? 'Unlocked' : 'Locked'}</p></div>)}</div></>}
    {tab === 'profile' && <div className="panel stack"><h2 className="icon-heading"><UserRound size={24} /> My Profile</h2><div className="avatar" style={{ background: avatar }}><UserRound size={26} /></div><h3>{name}</h3><p className="muted">Choose an avatar color</p><div className="actions">{['#7428c8', '#f52d86', '#0db9b8', '#e2a900', '#4b67dc'].map(c => <button key={c} aria-label={'Avatar color ' + c} onClick={() => { setAvatar(c); localStorage.setItem('qa-web-avatar', c) }} style={{ width: 42, height: 42, borderRadius: 50, background: c, padding: 0, border: c === avatar ? '4px solid #24113f' : 'none' }} />)}</div><button className="secondary" onClick={() => openTab('settings')}>Appearance & Accessibility</button></div>}
    {tab === 'settings' && <div className="panel stack"><h2 className="icon-heading"><Settings size={24} /> Appearance & Accessibility</h2><label>Appearance</label><div className="switches"><button className={theme === 'light' ? '' : 'secondary'} onClick={() => changeTheme('light')}><Sun size={18} /> Light</button><button className={theme === 'dark' ? '' : 'secondary'} onClick={() => changeTheme('dark')}><Moon size={18} /> Dark</button></div><label><input type="checkbox" style={{ width: 'auto' }} checked={large} onChange={e => { setLarge(e.target.checked); document.documentElement.style.fontSize = e.target.checked ? '18px' : '16px' }} /> Larger text</label><p className="muted">Appearance settings are local to this browser.</p></div>}
    {tab === 'help' && <div className="panel stack"><h2 className="icon-heading"><HelpCircle size={24} /> How to Play</h2>{[['Multiplayer', 'Join a room with the six-digit code supplied by the host.'], ['Host a Game', 'Create a quiz and use a reviewed or published quiz to start a room.'], ['Manual Quiz Creation', 'Add questions and four possible answers. Select the correct answer.'], ['Solo Mode', 'Solo gameplay is planned but not connected yet.'], ['Account', 'Web and mobile share the same Supabase authentication when configured for the same project.']].map(([h, d]) => <div className="question" key={h}><b>{h}</b><p className="muted">{d}</p></div>)}</div>}
    {msg && <p className="error" role="alert">{msg}</p>}</main></div>
}
