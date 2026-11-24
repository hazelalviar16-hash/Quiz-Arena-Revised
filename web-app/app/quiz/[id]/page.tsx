'use client';
import {FormEvent,useEffect,useState} from 'react';import {useParams} from 'next/navigation';import {supabase} from '../../../lib/supabase';
import { addPreviewQuestion, isPreviewMode, readPreview } from '../../../lib/preview';
import {ArrowLeft,PencilLine,Plus,Save,CheckCircle2,Trash2,Clock3} from 'lucide-react';
type Q={id:string;question_text:string;position:number};
export default function QuizDetail(){const{id}=useParams<{id:string}>();const[title,setTitle]=useState('');const[questions,setQuestions]=useState<Q[]>([]);const[text,setText]=useState('');const[opts,setOpts]=useState(['','','','']);const[correct,setCorrect]=useState(0);const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
async function load() {
  if (isPreviewMode) {
    const quiz = readPreview().quizzes.find(item => item.id === id);
    setTitle(quiz?.title ?? 'Quiz');
    setQuestions(quiz?.questions ?? []);
    setMsg(quiz ? '' : 'Quiz not found in this preview.');
    return;
  }
  if (!supabase) return;
  const quiz = await supabase.from('quizzes').select('title').eq('id', id).single();
  setTitle(quiz.data?.title || 'Quiz');
  const result = await supabase.from('questions').select('id,question_text,position').eq('quiz_id', id).order('position');
  setQuestions(result.data || []);
}
useEffect(() => { void load(); }, [id]);

async function add(event: FormEvent) {
  event.preventDefault();
  setBusy(true);
  setMsg('');
  try {
    if (opts.some(option => !option.trim())) throw Error('Fill all four options');
    if (isPreviewMode) {
      addPreviewQuestion(id, text, opts, correct);
    } else {
      if (!supabase) throw Error('Missing config');
      const { data: question, error } = await supabase.from('questions').insert({
        quiz_id: id,
        question_text: text,
        question_type: 'multiple_choice',
        position: questions.length + 1,
      }).select('id').single();
      if (error) throw error;
      const { error: optionError } = await supabase.from('answer_options').insert(opts.map((option, index) => ({
        question_id: question.id,
        option_text: option,
        is_correct: index === correct,
        position: index + 1,
      })));
      if (optionError) throw optionError;
    }
    setText('');
    setOpts(['', '', '', '']);
    await load();
  } catch (error) {
    setMsg(error instanceof Error ? error.message : 'Could not add question');
  } finally {
    setBusy(false);
  }
}
return <main className="wrap"><a href="/dashboard#quizzes"><ArrowLeft size={17} style={{verticalAlign:"middle"}}/> My Quizzes</a><div className="quiz-editor-head"><div className="eyebrow">QUIZ BUILDER</div><h1>{title}</h1><p style={{margin:0}}>Create a fun and challenging quiz, one question at a time.</p></div><div className="grid"><section className="panel"><h2>Questions ({questions.length})</h2>{questions.map(q=><div className="question" key={q.id}>{q.position}. {q.question_text}</div>)}</section><form className="panel stack" onSubmit={add}><h2>Add a question manually</h2><label htmlFor="question-text">Question</label><textarea id="question-text" required value={text} onChange={e=>setText(e.target.value)}/>{opts.map((o,i)=><div key={i}><label htmlFor={`question-option-${i}`}>Option {String.fromCharCode(65+i)}</label><div className="quizrow"><span className="letter">{String.fromCharCode(65+i)}</span><input id={`question-option-${i}`} required value={o} onChange={e=>setOpts(v=>v.map((x,j)=>j===i?e.target.value:x))}/></div></div>)}<label htmlFor="correct-option">Correct option</label><select id="correct-option" value={correct} onChange={e=>setCorrect(Number(e.target.value))}>{opts.map((_,i)=><option key={i} value={i}>Option {i+1}</option>)}</select>{msg&&<p className="error" role="alert">{msg}</p>}<button disabled={busy}>Add question</button><p className="muted">{isPreviewMode ? 'Questions and answer choices are saved in this browser.' : 'Quiz review/publishing and AI generation require additional server-side workflows.'}</p></form></div></main>}
