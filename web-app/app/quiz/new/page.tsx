'use client';
import {FormEvent,useState} from 'react';import {useRouter} from 'next/navigation';import {supabase} from '../../../lib/supabase';
import { createPreviewQuiz, isPreviewMode } from '../../../lib/preview';
import {ArrowLeft,PencilLine,Plus,Save,CheckCircle2,Trash2,Clock3} from 'lucide-react';
export default function NewQuiz(){const router=useRouter();const[title,setTitle]=useState('');const[description,setDescription]=useState('');const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
async function save(event: FormEvent) {
  event.preventDefault();
  setBusy(true);
  setMsg('');
  try {
    if (isPreviewMode) {
      router.push('/quiz/' + createPreviewQuiz(title, description));
      return;
    }
    if (!supabase) throw Error('Missing configuration');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Error('Please sign in');
    const { data, error } = await supabase.from('quizzes').insert({ title, description, creator_id: user.id }).select('id').single();
    if (error) throw error;
    router.push('/quiz/' + data.id);
  } catch (error) {
    setMsg(error instanceof Error ? error.message : 'Save failed');
  } finally {
    setBusy(false);
  }
}
return <main className="wrap" style={{maxWidth:700}}><a href="/dashboard#quizzes"><ArrowLeft size={17} style={{verticalAlign:"middle"}}/> My Quizzes</a><div className="quiz-editor-head"><div className="eyebrow">CREATE YOUR CHALLENGE</div><h1>Create a Quiz <PencilLine size={26} style={{verticalAlign:"middle"}}/></h1><p style={{margin:0}}>Give your quiz a name, then add questions and answers.</p></div><form className="panel stack" onSubmit={save}><label htmlFor="quiz-title">Title</label><input id="quiz-title" value={title} onChange={e=>setTitle(e.target.value)} required/><label htmlFor="quiz-description">Description</label><textarea id="quiz-description" value={description} onChange={e=>setDescription(e.target.value)}/>{msg&&<p className="error" role="alert">{msg}</p>}<button disabled={busy}>Create quiz</button></form></main>}
