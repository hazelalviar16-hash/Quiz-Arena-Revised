'use client';
import {useEffect,useState} from 'react';import {useParams,useRouter} from 'next/navigation';import {supabase} from '../../../lib/supabase';
import { isPreviewMode, previewPlayerId, readPreview, updatePreviewRoom } from '../../../lib/preview';
import {ArrowLeft,Crown,Gamepad2,Copy,Share2,UsersRound} from 'lucide-react';
type Session={id:string;room_code:string;status:string;host_id:string;current_question_id:string|null;question_ends_at:string|null};
export default function Room(){const{code}=useParams<{code:string}>();const router=useRouter();const[session,setSession]=useState<Session|null>(null);const[uid,setUid]=useState('');const[msg,setMsg]=useState('');const[players,setPlayers]=useState<number|null>(null);const[busy,setBusy]=useState(false);
useEffect(() => {
  if (isPreviewMode) {
    const room = readPreview().rooms.find(item => item.room_code === code);
    setUid(previewPlayerId);
    setSession(room ?? null);
    setPlayers(room?.players ?? null);
    setMsg(room ? '' : 'Room not found in this preview.');
    return;
  }
  if (!supabase) return;
  let live = true;
  const client = supabase;
  async function refresh() {
    const { data: { user } } = await client.auth.getUser();
    if (!live) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    setUid(user.id);
    const { data, error } = await client.from('game_sessions')
      .select('id,room_code,status,host_id,current_question_id,question_ends_at')
      .eq('room_code', code).single();
    if (!live) return;
    if (error) {
      setMsg(error.message);
      return;
    }
    setSession(data);
    const result = await client.from('session_players').select('id', { count: 'exact', head: true }).eq('session_id', data.id);
    if (live) setPlayers(result.count);
  }
  void refresh();
  const channel = client.channel('room-' + code)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions' }, () => { void refresh(); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players' }, () => { void refresh(); })
    .subscribe();
  return () => {
    live = false;
    void client.removeChannel(channel);
  };
}, [code, router]);

async function control(action: 'start' | 'finish' | 'cancel') {
  if (!session) return;
  const status = { start: 'active', finish: 'completed', cancel: 'cancelled' }[action];
  setBusy(true);
  setMsg('');
  try {
    if (isPreviewMode) {
      updatePreviewRoom(code, status);
    } else {
      if (!supabase) return;
      const { error } = await supabase.rpc('control_game_session', { p_session_id: session.id, p_action: action });
      if (error) throw error;
    }
    setSession({ ...session, status });
  } catch (error) {
    setMsg(error instanceof Error ? error.message : 'Action failed');
  } finally {
    setBusy(false);
  }
}
return <main className="wrap"><a href="/dashboard#multiplayer"><ArrowLeft size={17} style={{verticalAlign:"middle"}}/> Multiplayer</a><div className="panel"><div className="room-top"><div className="auth-logo"><Crown size={21} style={{verticalAlign:"middle"}}/> QUIZ ARENA</div><h1 style={{marginBottom:0}}>Room Lobby <Gamepad2 size={24} style={{verticalAlign:"middle"}}/></h1><p style={{marginBottom:0}}>{isPreviewMode ? 'Preview room. Activity is simulated in this browser.' : 'Invite your friends and get ready to play.'}</p></div><div className="room-code-display">{code}</div><div className="actions"><button type="button" onClick={()=>navigator.clipboard.writeText(code)}><Copy size={17}/> Copy Code</button><button type="button" className="secondary" onClick={()=>{if(navigator.share)navigator.share({title:"Quiz Arena",text:"Join my room: "+code,url:location.href});else navigator.clipboard.writeText(location.href)}}><Share2 size={17}/> Share Room</button></div><p>{isPreviewMode ? 'Use this code to reopen the room from this browser.' : 'Share this code with players.'}</p>{session?<><p><span className="pill">{session.status}</span></p><p>Players visible: {players??'—'}</p>{session.host_id===uid?<div className="actions"><button disabled={busy||session.status!=='waiting'} onClick={()=>control('start')}>Start game</button><button disabled={busy||session.status!=='active'} onClick={()=>control('finish')}>Finish</button><button disabled={busy||!['waiting','active'].includes(session.status)} onClick={()=>control('cancel')}>Cancel</button></div>:<p className="muted">Waiting for host updates. Question answering UI is a future integration step.</p>}</>:msg?null:<p>Loading room…</p>}{msg&&<p className="error" role="alert">{msg}</p>}</div></main>}
