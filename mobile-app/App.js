
import 'react-native-url-polyfill/auto';
import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {BlurView} from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as Network from 'expo-network';
import * as Clipboard from 'expo-clipboard';
import {ArrowLeft, Award, BookOpen, Check, ChevronRight, CircleHelp, ClipboardCopy, Crown, Eye, EyeOff, FilePlus2, Gamepad2, House, LockKeyhole, LogOut, Mail, Monitor, Moon, PencilLine, Play, RotateCcw, Settings2, Share2, ShieldCheck, Sparkles, Sun, Target, Trophy, UserRound, UsersRound, Volume2, VolumeX, Wifi, WifiOff, ChartNoAxesColumn, Bell, Accessibility, Flame, Clock3, ChevronLeft} from 'lucide-react-native';

// Supabase: keep the existing environment variables and client behavior.
const URL=process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase=URL&&KEY?createClient(URL,KEY,{auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}}):null;
const P={purple:'#7428C8',pink:'#F52D86',teal:'#0DB9B8',yellow:'#FFC400'};
const THEMES={light:{bg:'#FFF7F0',ink:'#24113F',muted:'#665B70',card:'rgba(255,255,255,0.94)',glass:'rgba(255,255,255,0.83)',input:'#FFFFFF',border:'rgba(89,51,108,0.15)',nav:'#FFFFFF',purple:P.purple,pink:P.pink,teal:'#079F9E',yellow:'#E5A900'},dark:{bg:'#1D102C',ink:'#FFFFFF',muted:'#D3C3DF',card:'rgba(54,32,77,0.96)',glass:'rgba(56,34,79,0.91)',input:'#4A3260',border:'rgba(234,214,255,0.19)',nav:'#302044',purple:'#B079FF',pink:'#FF5AA7',teal:'#36D2CA',yellow:'#FFD333'}};
const STORE='qa_mobile_v3_';
const AVATARS=[{id:'purple',color:'#7428C8'},{id:'pink',color:'#F52D86'},{id:'teal',color:'#0DB9B8'},{id:'gold',color:'#D69D00'},{id:'blue',color:'#4169E1'},{id:'plum',color:'#63377F'}];
const TODAY=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const YESTERDAY=()=>{const d=new Date();d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const EMPTY_DRAFT={title:'',description:'',questions:[{prompt:'',answers:['','','',''],correct:0,seconds:'15'}]};
const copyDraft=d=>JSON.parse(JSON.stringify(d));
const initialPrefs={appearance:'system',sound:true,haptics:true,largeText:false,reducedMotion:false,avatar:'purple',tutorialDone:false};

function Card({children,t,style,padding=18}){return <View style={[s.card,{backgroundColor:t.card,borderColor:t.border},style]}><BlurView tint={t.bg===THEMES.dark.bg?'dark':'light'} intensity={Platform.OS==='android'?8:20}><View style={{padding,backgroundColor:t.glass}}>{children}</View></BlurView></View>}
function Button({title,onPress,secondary=false,disabled=false,Icon}){return <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.82} style={[s.buttonShell,disabled&&{opacity:.45}]}><LinearGradient colors={secondary?['#8740D1','#5A2492']:['#FFE05D','#FFC400','#FFB000']} style={s.button}>{Icon&&<Icon size={19} color={secondary?'white':'#24113F'}/>}<Text style={[s.buttonText,{color:secondary?'white':'#24113F'}]}>{title}</Text></LinearGradient></TouchableOpacity>}
function Field({label,t,right,large=false,...props}){return <View style={{marginBottom:15}}><Text style={[s.fieldLabel,{color:t.ink}]}>{label}</Text><View style={[s.fieldWrap,{backgroundColor:t.input,borderColor:t.border}]}><TextInput {...props} multiline={large} placeholderTextColor={t.muted} selectionColor={t.purple} style={[s.fieldInput,{color:t.ink,minHeight:large?78:47,textAlignVertical:large?'top':'center'}]}/>{right}</View></View>}
function Heading({title,subtitle,back,t}){return <View style={[s.heading,{backgroundColor:t.card,borderColor:t.border}]}><View style={s.row}>{back&&<TouchableOpacity onPress={back} style={{paddingRight:10,paddingVertical:4}}><ArrowLeft color={t.ink} size={22}/></TouchableOpacity>}<Text style={[s.headingTitle,{color:t.ink}]}>{title}</Text></View>{subtitle&&<Text style={[s.subtitle,{color:t.muted,marginTop:7}]}>{subtitle}</Text>}</View>}
function Menu({title,subtitle,Icon,color,onPress,t}){return <TouchableOpacity activeOpacity={.83} onPress={onPress} style={[s.menu,{backgroundColor:t.card,borderColor:t.border}]}><View style={[s.menuIcon,{backgroundColor:color}]}><Icon size={25} color="white"/></View><View style={{flex:1}}><Text style={[s.menuTitle,{color:t.ink}]}>{title}</Text><Text style={[s.subtitle,{color:t.muted}]}>{subtitle}</Text></View><ChevronRight color={t.ink} size={20}/></TouchableOpacity>}
function Empty({Icon,title,detail,t}){return <Card t={t}><View style={{alignItems:'center',paddingVertical:13}}><View style={[s.emptyIcon,{backgroundColor:t.input}]}><Icon color={t.purple} size={36}/></View><Text style={[s.centerTitle,{color:t.ink}]}>{title}</Text><Text style={[s.centerSub,{color:t.muted}]}>{detail}</Text></View></Card>}

export default function App(){
 const system=useColorScheme();
 const [prefs,setPrefs]=useState(initialPrefs),[readyPrefs,setReadyPrefs]=useState(false);
 const dark=prefs.appearance==='dark'||(prefs.appearance==='system'&&system==='dark');
 const t=dark?THEMES.dark:THEMES.light;
 const fontScale=prefs.largeText?1.15:1;
 const [account,setAccount]=useState(null),[initializing,setInitializing]=useState(true),[busy,setBusy]=useState(false);
 const [screen,setScreen]=useState('home'),[register,setRegister]=useState(false),[showPassword,setShowPassword]=useState(false);

 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
 const [code,setCode]=useState(''),[joinedCode,setJoinedCode]=useState('');
 const [online,setOnline]=useState(null),[streak,setStreak]=useState(0),[achievements,setAchievements]=useState([]);
 const [draft,setDraft]=useState(copyDraft(EMPTY_DRAFT)),[draftLoaded,setDraftLoaded]=useState(false),[questionIndex,setQuestionIndex]=useState(0),[previewIndex,setPreviewIndex]=useState(0);
 const [demoSeconds,setDemoSeconds]=useState(15),[demoRunning,setDemoRunning]=useState(false),[demoAnswer,setDemoAnswer]=useState(null);
 const [tutorialStep,setTutorialStep]=useState(0);
 const fade=useRef(new Animated.Value(1)).current;
 const pulse=useRef(new Animated.Value(.85)).current;
 const displayName=account?.user_metadata?.full_name?.trim()||account?.email?.split('@')[0]||'Player';
 const avatar=AVATARS.find(x=>x.id===prefs.avatar)||AVATARS[0];
 const userKey=account?.id||'guest';
 const storageKey=(key)=>STORE+userKey+'_'+key;

 useEffect(()=>{let active=true;AsyncStorage.getItem(STORE+'prefs').then(raw=>{if(active&&raw){try{setPrefs({...initialPrefs,...JSON.parse(raw)})}catch{}}}).finally(()=>{if(active)setReadyPrefs(true)});return()=>{active=false}},[]);
 function updatePref(key,value){const next={...prefs,[key]:value};setPrefs(next);AsyncStorage.setItem(STORE+'prefs',JSON.stringify(next)).catch(()=>{})}
 useEffect(()=>{if(!supabase){setInitializing(false);return}let active=true;supabase.auth.getSession().then(({data,error})=>{if(!active)return;setAccount(data?.session?.user||null);setInitializing(false);if(error)Alert.alert('Session error',error.message)}).catch(e=>{if(active){setInitializing(false);Alert.alert('Session error',e.message||'Try again')}});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active){setAccount(session?.user||null);if(!session)setScreen('home')}});return()=>{active=false;subscription.unsubscribe()}},[]);
 useEffect(()=>{let active=true;async function check(){try{const state=await Network.getNetworkStateAsync();if(active)setOnline(Boolean(state.isConnected&&state.isInternetReachable!==false))}catch{if(active)setOnline(null)}}check();const timer=setInterval(check,15000);return()=>{active=false;clearInterval(timer)}},[]);
 useEffect(()=>{if(!account)return;let active=true;async function load(){try{const [rawStreak,rawAchievements,rawDraft]=await Promise.all([AsyncStorage.getItem(storageKey('streak')),AsyncStorage.getItem(storageKey('achievements')),AsyncStorage.getItem(storageKey('draft'))]);if(!active)return;const old=rawStreak?JSON.parse(rawStreak):{date:'',count:0};const today=TODAY();let count=old.count||0;if(old.date!==today){count=old.date===YESTERDAY()?count+1:1;await AsyncStorage.setItem(storageKey('streak'),JSON.stringify({date:today,count}))}setStreak(count);const earned=rawAchievements?JSON.parse(rawAchievements):[];const next=[...new Set([...earned,'welcome',...(count>=3?['streak3']:[]),...(count>=7?['streak7']:[])])];setAchievements(next);await AsyncStorage.setItem(storageKey('achievements'),JSON.stringify(next));if(rawDraft){try{const parsed=JSON.parse(rawDraft);if(Array.isArray(parsed.questions)&&parsed.questions.length)setDraft(parsed)}catch{}}setDraftLoaded(true)}catch{if(active)setDraftLoaded(true)}}setDraftLoaded(false);setDraft(copyDraft(EMPTY_DRAFT));setQuestionIndex(0);load();return()=>{active=false}},[account?.id]);
 useEffect(()=>{if(!account||!draftLoaded)return;AsyncStorage.setItem(storageKey('draft'),JSON.stringify(draft)).catch(()=>{})},[draft,draftLoaded,account?.id]);
 useEffect(()=>{if(!account||!readyPrefs||prefs.tutorialDone||initializing)return;setScreen('tutorial')},[account?.id,readyPrefs,initializing]);
 useEffect(()=>{if(!initializing||prefs.reducedMotion)return;const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1.1,duration:650,useNativeDriver:true}),Animated.timing(pulse,{toValue:.85,duration:650,useNativeDriver:true})]));loop.start();return()=>loop.stop()},[initializing,prefs.reducedMotion]);
 useEffect(()=>{if(!demoRunning)return;const id=setInterval(()=>setDemoSeconds(n=>{if(n<=1){setDemoRunning(false);return 0}return n-1}),1000);return()=>clearInterval(id)},[demoRunning]);
 useEffect(()=>{setDemoRunning(false);setDemoAnswer(null);setDemoSeconds(Math.max(5,Math.min(120,Number(draft.questions[previewIndex]?.seconds)||15)))},[previewIndex,screen]);
 function go(next){if(prefs.reducedMotion){setScreen(next);return}Animated.timing(fade,{toValue:0,duration:110,useNativeDriver:true}).start(()=>{setScreen(next);Animated.timing(fade,{toValue:1,duration:200,useNativeDriver:true}).start()})}
 async function feedback(message){if(prefs.haptics)Haptics.selectionAsync().catch(()=>{});if(prefs.sound&&message){try{Speech.stop();Speech.speak(message,{rate:1.1,volume:.65})}catch{}}}
 function earn(id){if(achievements.includes(id))return;const next=[...achievements,id];setAchievements(next);AsyncStorage.setItem(storageKey('achievements'),JSON.stringify(next)).catch(()=>{})}
 function coming(feature){Alert.alert('Backend integration required',feature+' needs a server integration. No database changes have been made.')}
 async function authenticate(){if(!supabase)return Alert.alert('Setup needed','Keep your Supabase URL and anon key in mobile-app/.env.');if(!email.trim()||!password||(register&&!name.trim()))return Alert.alert('Missing information','Complete all required fields.');setBusy(true);try{const r=register?await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()}}}):await supabase.auth.signInWithPassword({email:email.trim(),password});if(r.error)Alert.alert('Authentication error',r.error.message);else if(register&&!r.data.session){Alert.alert('Check your email','Confirm your email, then sign in.');setRegister(false)}}catch(e){Alert.alert('Connection error',e.message||'Try again')}finally{setBusy(false)}}
 async function joinGame(){if(!supabase)return Alert.alert('Setup needed','Configure Supabase first.');if(!/^\d{6}$/.test(code))return Alert.alert('Invalid code','Enter a six-digit room code.');if(online===false)return Alert.alert('Offline','Connect to the internet to join a room.');setBusy(true);try{const {error}=await supabase.rpc('join_game_room',{p_room_code:code});if(error)Alert.alert('Unable to join',error.message);else{setJoinedCode(code);earn('joined');feedback('Room joined');go('lobby')}}catch(e){Alert.alert('Connection error',e.message||'Try again')}finally{setBusy(false)}}
 async function signOut(){if(!supabase)return;setBusy(true);try{const {error}=await supabase.auth.signOut();if(error)Alert.alert('Sign-out failed',error.message);else{setPassword('');setJoinedCode('');go('home')}}catch(e){Alert.alert('Sign-out failed',e.message||'Try again')}finally{setBusy(false)}}
 const q=draft.questions[questionIndex]||draft.questions[0];
 function setDraftField(key,value){setDraft(old=>({...old,[key]:value}))}
 function setQuestionField(key,value){setDraft(old=>({...old,questions:old.questions.map((item,i)=>i===questionIndex?{...item,[key]:value}:item)}))}
 function setAnswer(i,value){setQuestionField('answers',q.answers.map((a,j)=>i===j?value:a))}
 function validate(){if(!draft.title.trim())return 'Enter a quiz title.';if(!draft.questions.length)return 'Add at least one question.';for(let i=0;i<draft.questions.length;i++){const item=draft.questions[i];if(!item.prompt.trim())return `Enter question ${i+1}.`;if(item.answers.some(a=>!a.trim()))return `Complete all four choices in question ${i+1}.`;if(new Set(item.answers.map(a=>a.trim().toLowerCase())).size!==4)return `Question ${i+1} has duplicate choices.`;const n=Number(item.seconds);if(!Number.isInteger(n)||n<5||n>120)return `Set a 5–120 second timer for question ${i+1}.`;}return null}
 function preview(){const error=validate();if(error)return Alert.alert('Check quiz',error);earn('creator');feedback('Quiz ready');setPreviewIndex(0);go('preview')}
 function addQuestion(){setDraft(old=>({...old,questions:[...old.questions,{prompt:'',answers:['','','',''],correct:0,seconds:'15'}]}));setQuestionIndex(draft.questions.length);feedback()}
 function deleteQuestion(){if(draft.questions.length===1)return Alert.alert('Keep one question','A quiz needs at least one question.');Alert.alert('Delete question?','This question will be removed from your local draft.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{setDraft(old=>({...old,questions:old.questions.filter((_,i)=>i!==questionIndex)}));setQuestionIndex(Math.max(0,questionIndex-1))}}])}
 function resetDraft(){Alert.alert('Discard draft?','This will erase the locally saved quiz draft on this device.',[{text:'Cancel',style:'cancel'},{text:'Discard',style:'destructive',onPress:()=>{setDraft(copyDraft(EMPTY_DRAFT));setQuestionIndex(0);feedback()}}])}
 async function copyCode(){if(!joinedCode)return;await Clipboard.setStringAsync(joinedCode);feedback('Copied');Alert.alert('Copied','Room code copied to clipboard.')}
 async function shareCode(){if(!joinedCode)return;try{await Share.share({message:`Join my Quiz Arena room! Code: ${joinedCode}`})}catch(e){Alert.alert('Sharing unavailable',e.message||'Please try again')}}
 function finishTutorial(){updatePref('tutorialDone',true);earn('explorer');go('home')}
 const paragraph=(str,style)=> <Text style={[s.subtitle,{color:t.muted,fontSize:14*fontScale},style]}>{str}</Text>;
 const section=(title)=> <Text style={[s.section,{color:t.muted}]}>{title}</Text>;

 function authView(){return <View style={{maxWidth:440,width:'100%',alignSelf:'center',justifyContent:'center',flex:1}}><Card t={t} padding={23}><View style={{alignItems:'center',marginBottom:16}}><Crown color={t.yellow} fill={t.yellow} size={38}/><Text style={[s.logo,{color:t.ink}]}>QUIZ</Text><View style={{backgroundColor:'#FFC400',paddingHorizontal:18,borderRadius:7,transform:[{rotate:'-3deg'}]}}><Text style={{color:'#301044',fontWeight:'900',fontSize:25}}>ARENA</Text></View></View><Text style={[s.centerTitle,{color:t.ink}]}>{register?'Create Account':'Welcome Back!'}</Text><Text style={[s.centerSub,{color:t.muted}]}>{register?'Join Quiz Arena and start playing.':'Sign in to continue your challenge.'}</Text>{register&&<Field label="Full name" t={t} value={name} onChangeText={setName} placeholder="Full name"/>}<Field label="Email address" t={t} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="Email address"/><Field label="Password" t={t} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" placeholder="Password" right={<TouchableOpacity onPress={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff color={t.ink} size={20}/>:<Eye color={t.ink} size={20}/>}</TouchableOpacity>}/><Button title={busy?'Please wait...':register?'Register':'Sign In'} disabled={busy} onPress={authenticate}/><TouchableOpacity style={{padding:18,alignItems:'center'}} onPress={()=>setRegister(v=>!v)}><Text style={{color:t.purple,fontWeight:'800'}}>{register?'Already have an account? Sign In':"Don't have an account? Register"}</Text></TouchableOpacity></Card><TouchableOpacity onPress={()=>go('authSettings')} style={{alignItems:'center',padding:8}}><Text style={{color:t.ink}}>Appearance & Accessibility</Text></TouchableOpacity>{screen==='authSettings'&&settingsView(true)}</View>}

 function homeView(){return <><Card t={t} style={{marginTop:13,marginBottom:22}}><View style={s.row}><View style={{flex:1}}><Text style={[s.hello,{color:t.ink,fontSize:23*fontScale}]}>Hello, {displayName}!</Text>{paragraph('Ready for your next challenge?',{marginTop:6})}</View><TouchableOpacity onPress={()=>go('profile')} style={[s.avatar,{backgroundColor:avatar.color}]}><UserRound color="white" size={24}/></TouchableOpacity></View></Card><View style={s.row}><View style={[s.chip,{backgroundColor:t.card,borderColor:t.border}]}><Flame color={t.pink} size={19}/><Text style={{color:t.ink,fontWeight:'800'}}>{streak} day streak</Text></View><View style={[s.chip,{backgroundColor:t.card,borderColor:t.border}]}>{online===false?<WifiOff color={t.pink} size={18}/>:<Wifi color={t.teal} size={18}/>}<Text style={{color:t.ink,fontWeight:'700'}}>{online===null?'Checking':online?'Online':'Offline'}</Text></View></View>{section('CHOOSE YOUR ARENA')}<TouchableOpacity onPress={()=>{feedback();go('multiplayer')}} style={s.modeShell}><LinearGradient colors={['#9F4BEA','#7428C8','#51218C']} style={s.mode}><UsersRound color="white" size={34}/><View style={{flex:1}}><Text style={s.modeTitle}>Multiplayer Mode</Text><Text style={s.modeSub}>Play with friends in live rooms</Text></View><ChevronRight color="white"/></LinearGradient></TouchableOpacity><TouchableOpacity onPress={()=>{feedback();go('solo')}} style={s.modeShell}><LinearGradient colors={['#FF579F','#F52D86','#D10D62']} style={s.mode}><Target color="white" size={34}/><View style={{flex:1}}><Text style={s.modeTitle}>Solo Mode</Text><Text style={s.modeSub}>Practice at your own pace</Text></View><ChevronRight color="white"/></LinearGradient></TouchableOpacity><TouchableOpacity onPress={()=>go('achievements')}><Card t={t} padding={14}><View style={s.row}><Award color={t.yellow} size={24}/><View style={{flex:1}}><Text style={{color:t.ink,fontWeight:'800'}}>My Achievements</Text>{paragraph(`${achievements.length} local badges unlocked`)}</View><ChevronRight color={t.ink}/></View></Card></TouchableOpacity></>}

 function multiplayerView(){return <><Heading title="Multiplayer Mode" subtitle="Choose how you want to play" back={()=>go('home')} t={t}/><Menu title="Join Game" subtitle="Enter a six-digit room code" Icon={Gamepad2} color={t.teal} t={t} onPress={()=>go('join')}/><Menu title="Host Game" subtitle="Create or select a quiz" Icon={Crown} color="#E2A900" t={t} onPress={()=>go('host')}/></>}

 function joinView(){return <><Heading title="Join Game" subtitle="Join an existing multiplayer room" back={()=>go('multiplayer')} t={t}/><Empty Icon={Gamepad2} title="Enter Room Code" detail="Ask your host for the six-digit code." t={t}/><Card t={t}><TextInput keyboardType="number-pad" value={code} maxLength={6} onChangeText={v=>setCode(v.replace(/\D/g,''))} placeholder="000000" placeholderTextColor={t.muted} style={[s.code,{color:t.ink,backgroundColor:t.input,borderColor:t.border}]}/><Button title={busy?'Joining...':'Join Game'} disabled={busy} Icon={ChevronRight} onPress={joinGame}/></Card></>}

 function lobbyView(){return <><Heading title="Room Lobby" subtitle="You joined the room" back={()=>go('multiplayer')} t={t}/><Empty Icon={Check} title="Room Joined" detail="Share the room code with friends." t={t}/><Card t={t}><Text style={[s.section,{color:t.muted,textAlign:'center'}]}>ROOM CODE</Text><Text style={[s.codeBig,{color:t.purple}]}>{joinedCode}</Text><View style={s.row}><View style={{flex:1}}><Button title="Copy Code" Icon={ClipboardCopy} onPress={copyCode}/></View><View style={{flex:1}}><Button title="Share" Icon={Share2} secondary onPress={shareCode}/></View></View>{paragraph('Live player lists, host controls, and synchronized gameplay require backend integration.',{marginTop:16})}</Card></>}

 function hostView(){return <><Heading title="Host Game" subtitle="Choose how to prepare your quiz" back={()=>go('multiplayer')} t={t}/><Menu title="Create Manually" subtitle="Write and preview your questions" Icon={PencilLine} color={t.purple} t={t} onPress={()=>go('manual')}/><Menu title="AI-Assisted Creation" subtitle="Generate a draft quiz from a topic" Icon={Sparkles} color={t.pink} t={t} onPress={()=>go('ai')}/><Menu title="My Saved Quizzes" subtitle="Choose an existing hosted quiz" Icon={BookOpen} color={t.teal} t={t} onPress={()=>go('saved')}/></>}

 function manualView(){return <><Heading title="Create Quiz Manually" subtitle="Draft autosaves locally on this device" back={()=>go('host')} t={t}/><Card t={t}><Field label="Quiz title" t={t} value={draft.title} onChangeText={v=>setDraftField('title',v)} placeholder="e.g., Science Challenge"/><Field label="Description (optional)" t={t} value={draft.description} onChangeText={v=>setDraftField('description',v)} placeholder="Short description"/><View style={[s.row,{justifyContent:'space-between',marginBottom:13}]}><Text style={{color:t.ink,fontWeight:'900',fontSize:17*fontScale}}>Question {questionIndex+1} / {draft.questions.length}</Text><TouchableOpacity onPress={deleteQuestion}><Text style={{color:t.pink,fontWeight:'800'}}>Delete</Text></TouchableOpacity></View><Field label="Question" t={t} large value={q.prompt} onChangeText={v=>setQuestionField('prompt',v)} placeholder="Enter your question"/>{q.answers.map((a,i)=><View key={i} style={[s.row,{marginBottom:10}]}><TouchableOpacity onPress={()=>{setQuestionField('correct',i);feedback()}} style={[s.letter,{backgroundColor:q.correct===i?t.pink:t.purple}]}><Text style={{color:'white',fontWeight:'900'}}>{'ABCD'[i]}</Text></TouchableOpacity><View style={{flex:1}}><TextInput value={a} onChangeText={v=>setAnswer(i,v)} placeholder={'Choice '+ 'ABCD'[i]} placeholderTextColor={t.muted} style={[s.choice,{color:t.ink,backgroundColor:t.input,borderColor:t.border}]}/></View></View>)}{paragraph('Tap A–D to mark the correct answer.',{marginBottom:12})}<Field label="Time limit (5–120 seconds)" t={t} value={q.seconds} onChangeText={v=>setQuestionField('seconds',v.replace(/\D/g,''))} keyboardType="number-pad" placeholder="15"/><View style={s.row}><View style={{flex:1}}><Button title="Previous" secondary Icon={ChevronLeft} disabled={questionIndex===0} onPress={()=>setQuestionIndex(i=>i-1)}/></View><View style={{flex:1}}><Button title="Next" secondary Icon={ChevronRight} disabled={questionIndex===draft.questions.length-1} onPress={()=>setQuestionIndex(i=>i+1)}/></View></View><Button title="Add Question" secondary Icon={FilePlus2} onPress={addQuestion}/><Button title="Preview Quiz" Icon={Play} onPress={preview}/><Button title="Discard Local Draft" secondary Icon={RotateCcw} onPress={resetDraft}/>{paragraph('Changes are saved to AsyncStorage automatically. This does not upload the quiz to Supabase.',{marginTop:12})}</Card></>}
 function previewView(){const item=draft.questions[previewIndex];const total=Math.max(5,Math.min(120,Number(item?.seconds)||15));return <><Heading title="Quiz Preview" subtitle="Local demonstration — not a live game" back={()=>go('manual')} t={t}/><Card t={t}><View style={s.row}><Text style={{color:t.ink,fontWeight:'900',flex:1}}>Question {previewIndex+1} of {draft.questions.length}</Text><Clock3 color={t.pink} size={19}/><Text style={{color:t.ink,fontWeight:'900'}}>{demoSeconds}s</Text></View><View style={[s.track,{backgroundColor:t.input}]}><View style={[s.fill,{backgroundColor:t.purple,width:`${100*(previewIndex+1)/draft.questions.length}%`}]}/></View><View style={[s.track,{backgroundColor:t.input}]}><View style={[s.fill,{backgroundColor:t.pink,width:`${100*demoSeconds/total}%`}]}/></View><Text style={[s.previewQuestion,{color:t.ink}]}>{item.prompt}</Text>{item.answers.map((a,i)=><TouchableOpacity key={i} disabled={demoAnswer!==null} onPress={()=>{setDemoAnswer(i);setDemoRunning(false);feedback(i===item.correct?'Correct answer':'Try again')}} style={[s.previewAnswer,{backgroundColor:demoAnswer===i?(i===item.correct?t.teal:t.pink):t.input,borderColor:t.border}]}><Text style={{color:demoAnswer===i?'white':t.ink,fontWeight:'700'}}>{'ABCD'[i]}. {a}</Text></TouchableOpacity>)}{demoAnswer!==null&&<Text style={{color:t.ink,marginTop:12,fontWeight:'800'}}>Correct answer: {'ABCD'[item.correct]}</Text>}<Button title={demoRunning?'Pause Timer':demoSeconds===0?'Restart Timer':'Start / Resume Timer'} Icon={Clock3} onPress={()=>{if(demoSeconds===0)setDemoSeconds(total);setDemoRunning(v=>!v)}}/><View style={s.row}><View style={{flex:1}}><Button title="Previous" secondary disabled={previewIndex===0} onPress={()=>setPreviewIndex(i=>i-1)}/></View><View style={{flex:1}}><Button title="Next" secondary disabled={previewIndex===draft.questions.length-1} onPress={()=>setPreviewIndex(i=>i+1)}/></View></View><Button title="Save to Supabase" secondary onPress={()=>coming('Quiz saving')}/></Card></>}
 function aiView(){return <><Heading title="AI-Assisted Creation" subtitle="Generate and review quiz questions" back={()=>go('host')} t={t}/><Empty Icon={Sparkles} title="AI Quiz Generator" detail="Secure AI generation needs a server endpoint. Never put an AI API secret in App.js." t={t}/><Button title="Generate Questions" onPress={()=>coming('AI question generation')}/></>}
 function savedView(){return <><Heading title="My Saved Quizzes" subtitle="Select a quiz to host" back={()=>go('host')} t={t}/><Empty Icon={BookOpen} title="No Quizzes Loaded" detail="Local drafts are available under Create Manually. Cloud quiz retrieval has not been connected." t={t}/><Button title="Load Saved Quizzes" onPress={()=>coming('Saved quiz retrieval')}/></>}
 function soloView(){return <><Heading title="Solo Mode" subtitle="Practice at your own pace" back={()=>go('home')} t={t}/><Empty Icon={Target} title="Practice Arena" detail="Your quiz selection and solo gameplay will appear here once connected." t={t}/><Button title="Choose Quiz" Icon={BookOpen} onPress={()=>coming('Solo quiz selection and gameplay')}/><Button title="My Results" secondary Icon={ChartNoAxesColumn} onPress={()=>coming('Solo results')}/></>}
 function achievementsView(){const all=[['welcome','Welcome Player','Sign in to Quiz Arena',UserRound],['explorer','Arena Explorer','Complete the tutorial',BookOpen],['creator','Quiz Creator','Preview a complete local quiz',PencilLine],['joined','Room Explorer','Successfully join a multiplayer room',UsersRound],['streak3','3-Day Streak','Open Quiz Arena on 3 consecutive days',Flame],['streak7','7-Day Streak','Open Quiz Arena on 7 consecutive days',Trophy]];return <><Heading title="Achievements" subtitle="Badges earned on this device" back={()=>go('profile')} t={t}/>{all.map(([id,title,detail,Icon])=><View key={id} style={{opacity:achievements.includes(id)?1:.48}}><Menu title={(achievements.includes(id)?'Unlocked: ':'Locked: ')+title} subtitle={detail} Icon={Icon} color={achievements.includes(id)?t.yellow:t.muted} t={t} onPress={()=>Alert.alert(title,detail+'\n\nLocal-only achievement; not synchronized across devices.')}/></View>)}</>}
 function avatarView(){return <><Heading title="Choose Avatar" subtitle="Choose a profile color stored locally" back={()=>go('profile')} t={t}/><Card t={t}><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-around'}}>{AVATARS.map(a=><TouchableOpacity key={a.id} onPress={()=>{updatePref('avatar',a.id);feedback()}} style={{alignItems:'center',padding:12}}><View style={[s.avatar,{width:64,height:64,borderRadius:32,backgroundColor:a.color,borderWidth:prefs.avatar===a.id?4:0,borderColor:t.yellow}]}><UserRound color="white" size={30}/></View><Text style={{color:t.ink,marginTop:6,fontWeight:'700'}}>{a.id}</Text></TouchableOpacity>)}</View></Card></>}
 function toggleRow(label,description,Icon,key){return <TouchableOpacity onPress={()=>{updatePref(key,!prefs[key]);feedback()}} style={[s.settingsRow,{borderBottomColor:t.border}]}><Icon color={t.purple} size={21}/><View style={{flex:1}}><Text style={{color:t.ink,fontWeight:'800',fontSize:15*fontScale}}>{label}</Text>{paragraph(description)}</View><View style={[s.toggle,{backgroundColor:prefs[key]?t.teal:t.muted}]}><View style={[s.knob,{alignSelf:prefs[key]?'flex-end':'flex-start'}]}/></View></TouchableOpacity>}
 function settingsView(inAuth=false){return <>{!inAuth&&<Heading title="Appearance & Accessibility" subtitle="Stored locally on this device" back={()=>go('profile')} t={t}/>}<Card t={t}>{section('APPEARANCE')}{[['light','Light Mode',Sun],['dark','Dark Mode',Moon],['system','System Default',Monitor]].map(([id,label,Icon])=><TouchableOpacity key={id} onPress={()=>updatePref('appearance',id)} style={[s.settingsRow,{borderBottomColor:t.border}]}><Icon size={21} color={t.purple}/><Text style={{flex:1,color:t.ink,fontWeight:'700'}}>{label}</Text>{prefs.appearance===id&&<Check color={t.teal} size={22}/>}</TouchableOpacity>)}{section('FEEDBACK & ACCESSIBILITY')}{toggleRow('Sound feedback','Spoken cues for selected actions',prefs.sound?Volume2:VolumeX,'sound')}{toggleRow('Haptic feedback','Small vibrations when interacting',Bell,'haptics')}{toggleRow('Larger text','Increase important text sizes',Accessibility,'largeText')}{toggleRow('Reduce motion','Turn off page transition animations',ShieldCheck,'reducedMotion')}</Card></>}
 function profileView(){return <><Heading title="Profile" back={()=>go('home')} t={t}/><TouchableOpacity onPress={()=>go('avatar')} style={{alignItems:'center',marginVertical:10}}><View style={[s.avatar,{width:92,height:92,borderRadius:46,backgroundColor:avatar.color}]}><UserRound color="white" size={43}/></View><Text style={[s.centerTitle,{color:t.ink,marginTop:13}]}>{displayName}</Text>{paragraph(account?.email||'')}{paragraph('Tap to customize avatar',{marginTop:5})}</TouchableOpacity><Menu title="Achievements" subtitle={`${achievements.length} local badges`} Icon={Award} color={t.yellow} t={t} onPress={()=>go('achievements')}/><Menu title="My Results" subtitle="Quiz results history" Icon={ChartNoAxesColumn} color={t.teal} t={t} onPress={()=>coming('Results history')}/><Menu title="Leaderboard" subtitle="Compare your results" Icon={Trophy} color="#D6A000" t={t} onPress={()=>coming('Leaderboard')}/><Menu title="Edit Profile" subtitle="Update your account details" Icon={Settings2} color={t.pink} t={t} onPress={()=>coming('Profile editing')}/><Menu title="Appearance & Accessibility" subtitle="Theme, sound, motion, and text" Icon={Sun} color={t.purple} t={t} onPress={()=>go('settings')}/><Menu title="Help & How to Play" subtitle="Learn about game modes" Icon={CircleHelp} color={t.teal} t={t} onPress={()=>go('help')}/><Button title={busy?'Signing out...':'Sign Out'} Icon={LogOut} secondary disabled={busy} onPress={()=>Alert.alert('Sign out?','Do you want to sign out of Quiz Arena?',[{text:'Cancel',style:'cancel'},{text:'Sign Out',onPress:signOut}])}/></>}
 const tutorial=[['Welcome to Quiz Arena','Choose Multiplayer to play with friends, or Solo to practice independently.',Gamepad2],['Join a Room','Enter the six-digit code given by your host. Joining uses your existing Supabase connection.',UsersRound],['Host a Game','Create questions manually, use AI-assisted creation when connected, or choose saved quizzes.',Crown],['Make It Yours','Customize your avatar, appearance, sounds, haptics, and accessibility preferences.',Settings2]];
 function tutorialView(){const [title,description,Icon]=tutorial[tutorialStep];return <><Heading title="Getting Started" subtitle={`Step ${tutorialStep+1} of ${tutorial.length}`} back={finishTutorial} t={t}/><Empty Icon={Icon} title={title} detail={description} t={t}/><View style={[s.track,{backgroundColor:t.input}]}><View style={[s.fill,{backgroundColor:t.purple,width:`${(tutorialStep+1)*25}%`}]}/></View><Button title={tutorialStep===3?'Start Playing':'Next'} Icon={ChevronRight} onPress={()=>{if(tutorialStep===3)finishTutorial();else setTutorialStep(i=>i+1)}}/><Button title="Skip Tutorial" secondary onPress={finishTutorial}/></>}
 function helpView(){return <><Heading title="Help & How to Play" subtitle="A quick guide to Quiz Arena" back={()=>go('profile')} t={t}/>{[['Multiplayer','Open Multiplayer, then Join Game or Host Game.'],['Join Game','Enter the six-digit room code supplied by your host. Internet is required.'],['Host Game','Create a quiz manually, use AI-assisted creation, or select a saved quiz. Room creation still requires backend integration.'],['Manual Drafts','Write questions, select correct answers, set timers, and preview. Drafts autosave locally.'],['Solo Mode','Solo gameplay will be available once connected to the quiz backend.'],['Privacy','Streaks, avatars, badges, and preferences are stored on this device and are not synchronized.']].map(([title,detail])=><Card key={title} t={t} padding={14}><Text style={{color:t.ink,fontSize:16*fontScale,fontWeight:'900',marginBottom:6}}>{title}</Text>{paragraph(detail)}</Card>)}<Button title="Replay Tutorial" Icon={BookOpen} onPress={()=>{setTutorialStep(0);go('tutorial')}}/></>}

 function renderScreen(){
  switch(screen){
   case 'home':return homeView();
   case 'multiplayer':return multiplayerView();
   case 'join':return joinView();
   case 'lobby':return lobbyView();
   case 'host':return hostView();
   case 'manual':return manualView();
   case 'preview':return previewView();
   case 'ai':return aiView();
   case 'saved':return savedView();
   case 'solo':return soloView();
   case 'profile':return profileView();
   case 'achievements':return achievementsView();
   case 'avatar':return avatarView();
   case 'settings':return settingsView();
   case 'tutorial':return tutorialView();
   case 'help':return helpView();
   default:return homeView();
  }
 }

 function bottomNavigation(){
  const items=[
   {id:'home',label:'Home',Icon:House},
   {id:'multiplayer',label:'Multiplayer',Icon:UsersRound},
   {id:'solo',label:'Solo',Icon:Target},
   {id:'profile',label:'Profile',Icon:UserRound},
  ];

  const active=
   ['join','lobby','host','manual','preview','ai','saved'].includes(screen)
    ?'multiplayer'
    :['settings','avatar','achievements','help'].includes(screen)
     ?'profile'
     :screen;

  return (
   <View style={[
    s.nav,
    {
     backgroundColor:t.nav,
     borderTopColor:t.border,
    }
   ]}>
    {items.map(({id,label,Icon})=>{
     const selected=active===id;
     return (
      <TouchableOpacity
       key={id}
       accessibilityRole="tab"
       accessibilityLabel={label}
       accessibilityState={{selected}}
       onPress={()=>{
        feedback();
        go(id);
       }}
       activeOpacity={0.75}
       style={[
        s.navItem,
        selected&&{
         backgroundColor:dark
          ?'rgba(176,121,255,0.17)'
          :'rgba(116,40,200,0.09)',
        }
       ]}
      >
       <Icon
        size={22}
        color={selected?t.purple:t.muted}
        strokeWidth={selected?2.8:2}
       />
       <Text style={[
        s.navText,
        {
         color:selected?t.purple:t.muted,
         fontSize:10*fontScale,
         fontWeight:selected?'900':'700',
        }
       ]}>
        {label}
       </Text>
      </TouchableOpacity>
     );
    })}
   </View>
  );
 }

 function loadingView(){
  return (
   <View style={[
    s.loadingContainer,
    {backgroundColor:t.bg}
   ]}>
    <Animated.View style={{
     transform:[{scale:pulse}],
     alignItems:'center',
    }}>
     <View style={[
      s.loadingIcon,
      {backgroundColor:t.purple}
     ]}>
      <Crown
       size={52}
       color={t.yellow}
       fill={t.yellow}
      />
     </View>
    </Animated.View>

    <Text style={[
     s.loadingTitle,
     {color:t.ink}
    ]}>
     QUIZ ARENA
    </Text>

    <Text style={[
     s.subtitle,
     {
      color:t.muted,
      textAlign:'center',
      marginTop:8,
     }
    ]}>
     Preparing your arena...
    </Text>

    <ActivityIndicator
     size="large"
     color={t.purple}
     style={{marginTop:25}}
    />
   </View>
  );
 }

 if(initializing||!readyPrefs){
  return (
   <SafeAreaProvider>
    <StatusBar
     barStyle={dark?'light-content':'dark-content'}
     backgroundColor={t.bg}
    />
    <SafeAreaView
     style={{flex:1,backgroundColor:t.bg}}
    >
     {loadingView()}
    </SafeAreaView>
   </SafeAreaProvider>
  );
 }

 const authenticated=Boolean(account);
 const showNav=authenticated&&screen!=='tutorial';

 return (
  <SafeAreaProvider>
   <StatusBar
    barStyle={dark?'light-content':'dark-content'}
    backgroundColor={t.bg}
   />

   <SafeAreaView
    style={[
     s.safe,
     {backgroundColor:t.bg}
    ]}
    edges={['top','left','right','bottom']}
   >
    <View
     pointerEvents="none"
     style={[
      s.decorOne,
      {
       backgroundColor:dark
        ?'rgba(176,121,255,0.10)'
        :'rgba(116,40,200,0.08)',
      }
     ]}
    />

    <View
     pointerEvents="none"
     style={[
      s.decorTwo,
      {
       backgroundColor:dark
        ?'rgba(255,90,167,0.08)'
        :'rgba(245,45,134,0.07)',
      }
     ]}
    />

    <KeyboardAvoidingView
     style={{flex:1}}
     behavior={Platform.OS==='ios'?'padding':undefined}
    >
     <Animated.View
      style={{
       flex:1,
       opacity:fade,
      }}
     >
      <ScrollView
       keyboardShouldPersistTaps="handled"
       showsVerticalScrollIndicator={false}
       contentContainerStyle={[
        s.scrollContent,
        {
         flexGrow:1,
         paddingBottom:showNav?26:35,
        }
       ]}
      >
       {!authenticated
        ?authView()
        :renderScreen()}
      </ScrollView>
     </Animated.View>
    </KeyboardAvoidingView>

    {showNav&&bottomNavigation()}
   </SafeAreaView>
  </SafeAreaProvider>
 );
}

const s=StyleSheet.create({
 safe:{
  flex:1,
 },

 scrollContent:{
  paddingHorizontal:18,
  paddingTop:16,
  gap:13,
 },

 row:{
  flexDirection:'row',
  alignItems:'center',
  gap:11,
 },

 card:{
  borderRadius:23,
  borderWidth:1,
  overflow:'hidden',
  marginBottom:2,
 },

 buttonShell:{
  borderRadius:15,
  overflow:'hidden',
  marginTop:11,
 },

 button:{
  minHeight:49,
  borderRadius:15,
  paddingHorizontal:15,
  paddingVertical:12,
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'center',
  gap:8,
 },

 buttonText:{
  fontSize:15,
  fontWeight:'900',
  textAlign:'center',
 },

 fieldLabel:{
  fontSize:13,
  fontWeight:'800',
  marginBottom:7,
 },

 fieldWrap:{
  borderRadius:13,
  borderWidth:1,
  paddingHorizontal:13,
  flexDirection:'row',
  alignItems:'center',
  gap:8,
 },

 fieldInput:{
  flex:1,
  fontSize:15,
  paddingVertical:10,
  paddingHorizontal:0,
 },

 heading:{
  borderRadius:20,
  padding:17,
  borderWidth:1,
  marginBottom:5,
 },

 headingTitle:{
  fontSize:23,
  fontWeight:'900',
  flexShrink:1,
 },

 subtitle:{
  fontSize:13,
  lineHeight:19,
 },

 hello:{
  fontWeight:'900',
  lineHeight:30,
 },

 logo:{
  fontSize:28,
  fontWeight:'900',
  letterSpacing:2,
  marginTop:7,
 },

 centerTitle:{
  fontSize:21,
  fontWeight:'900',
  textAlign:'center',
  marginBottom:6,
 },

 centerSub:{
  fontSize:13,
  lineHeight:20,
  textAlign:'center',
  marginBottom:17,
 },

 section:{
  fontSize:12,
  fontWeight:'900',
  letterSpacing:1.2,
  marginTop:13,
  marginBottom:7,
 },

 avatar:{
  width:49,
  height:49,
  borderRadius:25,
  alignItems:'center',
  justifyContent:'center',
 },

 chip:{
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'center',
  gap:7,
  borderWidth:1,
  borderRadius:14,
  paddingHorizontal:12,
  paddingVertical:10,
  flex:1,
 },

 modeShell:{
  borderRadius:22,
  overflow:'hidden',
  marginBottom:3,
 },

 mode:{
  minHeight:130,
  borderRadius:22,
  paddingHorizontal:18,
  paddingVertical:21,
  flexDirection:'row',
  alignItems:'center',
  gap:14,
 },

 modeTitle:{
  fontSize:21,
  fontWeight:'900',
  color:'white',
  marginBottom:6,
 },

 modeSub:{
  fontSize:12,
  color:'rgba(255,255,255,0.90)',
  lineHeight:18,
 },

 menu:{
  minHeight:86,
  borderRadius:19,
  borderWidth:1,
  padding:14,
  flexDirection:'row',
  alignItems:'center',
  gap:13,
  marginBottom:2,
 },

 menuIcon:{
  width:52,
  height:52,
  borderRadius:15,
  alignItems:'center',
  justifyContent:'center',
 },

 menuTitle:{
  fontSize:16,
  fontWeight:'900',
  marginBottom:4,
 },

 emptyIcon:{
  width:75,
  height:75,
  borderRadius:24,
  alignItems:'center',
  justifyContent:'center',
  marginBottom:14,
 },

 code:{
  fontSize:32,
  fontWeight:'900',
  textAlign:'center',
  letterSpacing:10,
  borderWidth:1,
  borderRadius:15,
  paddingVertical:14,
  marginBottom:8,
 },

 codeBig:{
  fontSize:39,
  fontWeight:'900',
  textAlign:'center',
  letterSpacing:8,
  marginVertical:18,
 },

 letter:{
  width:42,
  height:44,
  borderRadius:12,
  alignItems:'center',
  justifyContent:'center',
 },

 choice:{
  minHeight:45,
  borderWidth:1,
  borderRadius:12,
  paddingHorizontal:12,
  paddingVertical:9,
  fontSize:14,
 },

 track:{
  height:9,
  borderRadius:10,
  overflow:'hidden',
  marginVertical:11,
 },

 fill:{
  height:'100%',
  borderRadius:10,
 },

 previewQuestion:{
  fontSize:21,
  fontWeight:'900',
  lineHeight:29,
  marginTop:15,
  marginBottom:17,
 },

 previewAnswer:{
  minHeight:51,
  borderRadius:13,
  borderWidth:1,
  paddingHorizontal:14,
  paddingVertical:14,
  justifyContent:'center',
  marginBottom:10,
 },

 settingsRow:{
  minHeight:62,
  flexDirection:'row',
  alignItems:'center',
  gap:13,
  borderBottomWidth:1,
  paddingVertical:11,
 },

 toggle:{
  width:45,
  height:26,
  borderRadius:20,
  justifyContent:'center',
  paddingHorizontal:4,
 },

 knob:{
  width:19,
  height:19,
  backgroundColor:'white',
  borderRadius:10,
 },

 nav:{
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-around',
  borderTopWidth:1,
  paddingHorizontal:8,
  paddingTop:9,
  paddingBottom:8,
 },

 navItem:{
  flex:1,
  minHeight:55,
  alignItems:'center',
  justifyContent:'center',
  gap:4,
  borderRadius:14,
  paddingHorizontal:3,
 },

 navText:{
  textAlign:'center',
 },

 loadingContainer:{
  flex:1,
  justifyContent:'center',
  alignItems:'center',
  padding:25,
 },

 loadingIcon:{
  width:110,
  height:110,
  borderRadius:32,
  alignItems:'center',
  justifyContent:'center',
 },

 loadingTitle:{
  fontSize:29,
  fontWeight:'900',
  letterSpacing:2,
  marginTop:24,
 },

 decorOne:{
  position:'absolute',
  top:-85,
  right:-105,
  width:270,
  height:270,
  borderRadius:135,
 },

 decorTwo:{
  position:'absolute',
  bottom:90,
  left:-130,
  width:290,
  height:290,
  borderRadius:145,
 },
});
