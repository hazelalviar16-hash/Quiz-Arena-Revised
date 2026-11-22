import 'react-native-url-polyfill/auto';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CRIMSON='#B91C3C', DARK='#451522', CREAM='#FFF8EF', MUTED='#866E74';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase=url&&key?createClient(url,key,{auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}}):null;

function Action({title,onPress,secondary=false,disabled=false}) {
  return <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} activeOpacity={0.8} style={[styles.action,secondary&&styles.secondaryAction,disabled&&{opacity:0.55}]}><Text style={[styles.actionText,secondary&&styles.secondaryActionText]}>{title}</Text></TouchableOpacity>;
}
function Field({label,...props}) {return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#A49497" style={styles.input} {...props}/></View>}
function Panel({children}) {return <View style={styles.panel}>{children}</View>}
function Feature({symbol,title,description,onPress,disabled}) {return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.feature,disabled&&{opacity:0.65}]} activeOpacity={0.8}><View style={styles.featureIcon}><Text style={styles.featureEmoji}>{symbol}</Text></View><View style={{flex:1}}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.featureDescription}>{description}</Text></View><Text style={styles.chevron}>›</Text></TouchableOpacity>}

export default function App() {
 const [account,setAccount]=useState(null),[loadingSession,setLoadingSession]=useState(true);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
 const [register,setRegister]=useState(false),[busy,setBusy]=useState(false);
 const [tab,setTab]=useState('home'),[code,setCode]=useState(''),[joinedCode,setJoinedCode]=useState('');
 useEffect(()=>{
   let active=true;
   if(!supabase){setLoadingSession(false);return;}
   supabase.auth.getSession().then(({data,error})=>{if(active){setAccount(data?.session?.user||null);setLoadingSession(false);if(error)Alert.alert('Session error',error.message)}});
   const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active)setAccount(session?.user||null)});
   return ()=>{active=false;subscription.unsubscribe()};
 },[]);
 async function authenticate(){
   if(!supabase)return Alert.alert('Supabase not configured','Add your public Supabase URL and key to mobile-app/.env');
   if(!email.trim()||!password)return Alert.alert('Missing details','Enter your email and password.');
   if(register&&!name.trim())return Alert.alert('Missing name','Enter your full name.');
   setBusy(true);
   try{
     const result=register?await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()}}}):await supabase.auth.signInWithPassword({email:email.trim(),password});
     if(result.error)Alert.alert('Authentication failed',result.error.message);
     else if(register&&!result.data.session){Alert.alert('Check your email','Confirm your email address, then sign in.');setRegister(false)}
   }catch(e){Alert.alert('Connection error',e.message||'Please try again.')}finally{setBusy(false)}
 }
 async function join(){
   if(!supabase)return Alert.alert('Setup needed','Add your Supabase environment variables.');
   if(!/^\d{6}$/.test(code))return Alert.alert('Invalid room code','Enter the six-digit room code provided by the host.');
   setBusy(true);
   try{
     const {error}=await supabase.rpc('join_game_room',{p_room_code:code});
     if(error)Alert.alert('Could not join',error.message);
     else {setJoinedCode(code);Alert.alert('Room joined',`You joined room ${code}. Live gameplay screens are not yet available in this starter.`)}
   }catch(e){Alert.alert('Connection error',e.message||'Please try again.')}finally{setBusy(false)}
 }
 async function signOut(){setBusy(true);try{const {error}=await supabase.auth.signOut();if(error)Alert.alert('Sign-out failed',error.message);else {setTab('home');setJoinedCode('')}}finally{setBusy(false)}}
 const displayName=account?.user_metadata?.full_name?.trim()||account?.email?.split('@')[0]||'Player';
 return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor={CREAM}/><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
 <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
 <View style={styles.brandRow}><View style={styles.brandMark}><Text style={{color:'white',fontSize:21}}>✦</Text></View><Text style={styles.brand}>QUIZ <Text style={{color:CRIMSON}}>ARENA</Text></Text></View>
 {loadingSession?<View style={styles.loading}><ActivityIndicator size="large" color={CRIMSON}/><Text style={styles.muted}>Loading your arena...</Text></View>:!account?<>
  <View style={styles.hero}><Text style={styles.eyebrow}>WELCOME TO THE ARENA</Text><Text style={styles.heroTitle}>{register?'Join the fun.':'Play. Learn. Win.'}</Text><Text style={styles.heroSubtitle}>Create quizzes, join live rooms and challenge your friends.</Text></View>
  <Panel><Text style={styles.panelHeading}>{register?'Create your account':'Welcome back'}</Text><Text style={styles.muted}>{register?'One account to create, host and play.':'Sign in with your Quiz Arena account.'}</Text>
  {register&&<Field label="Full name" placeholder="Your full name" autoComplete="name" value={name} onChangeText={setName}/>}
  <Field label="Email address" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" value={email} onChangeText={setEmail}/>
  <Field label="Password" placeholder="Enter your password" secureTextEntry autoCapitalize="none" autoComplete={register?'new-password':'current-password'} value={password} onChangeText={setPassword}/>
  <Action title={busy?'Please wait...':register?'Create account':'Sign in'} onPress={authenticate} disabled={busy}/>
  <Action secondary title={register?'Already have an account? Sign in':'New here? Create an account'} onPress={()=>setRegister(!register)} disabled={busy}/></Panel>
 </>:<>
  <View style={styles.welcome}><Text style={styles.eyebrow}>READY FOR THE NEXT ROUND?</Text><Text style={styles.welcomeTitle}>Hey, {displayName}! 👋</Text><Text style={styles.welcomeSubtitle}>Your next quiz adventure starts here.</Text></View>
  {tab==='home'&&<><View style={styles.sectionRow}><Text style={styles.sectionTitle}>Explore the arena</Text><Text style={styles.smallAccent}>LET'S PLAY</Text></View>
   <Feature symbol="⚡" title="Join a game" description="Enter a room code to play with friends" onPress={()=>setTab('join')}/>
   <Feature symbol="🎯" title="Create a quiz" description="Quiz creation is available on the web" disabled/>
   <Feature symbol="🏆" title="Host a game" description="Hosting controls are coming to mobile" disabled/>
   <View style={styles.note}><Text style={styles.noteTitle}>✨ One account, all devices</Text><Text style={styles.noteBody}>Use the same Supabase account on Quiz Arena web and mobile.</Text></View>
  </>}
  {tab==='join'&&<><Text style={styles.sectionTitle}>Join a game</Text><Panel><Text style={styles.panelHeading}>Got a room code?</Text><Text style={styles.muted}>Ask your host for the six-digit code.</Text><Field label="Room code" placeholder="000000" keyboardType="number-pad" maxLength={6} value={code} onChangeText={v=>setCode(v.replace(/\D/g,''))}/><Action title={busy?'Joining...':'Join room →'} onPress={join} disabled={busy}/>{joinedCode?<Text style={styles.joined}>✓ Joined room {joinedCode}</Text>:null}</Panel></>}
  {tab==='profile'&&<><Text style={styles.sectionTitle}>Your profile</Text><Panel><View style={styles.avatar}><Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text></View><Text style={[styles.panelHeading,{textAlign:'center'}]}>{displayName}</Text><Text style={[styles.muted,{textAlign:'center',marginBottom:12}]}>{account.email}</Text><Action secondary title={busy?'Please wait...':'Sign out'} onPress={signOut} disabled={busy}/></Panel></>}
 </>}
 <View style={styles.footer}><Text style={styles.footerText}>QUIZ ARENA  •  PLAY FAIR. HAVE FUN.</Text></View>
 </ScrollView>
 {account&&!loadingSession&&<View style={styles.tabBar}>{[['home','⌂','Home'],['join','⚡','Join'],['profile','◉','Profile']].map(([id,icon,label])=><TouchableOpacity key={id} accessibilityRole="tab" accessibilityState={{selected:tab===id}} onPress={()=>setTab(id)} style={styles.tab}><Text style={[styles.tabIcon,tab===id&&styles.tabActive]}>{icon}</Text><Text style={[styles.tabLabel,tab===id&&styles.tabActive]}>{label}</Text></TouchableOpacity>)}</View>}
 </KeyboardAvoidingView></SafeAreaView>
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:CREAM},scroll:{flexGrow:1,paddingHorizontal:22,paddingTop:22,paddingBottom:28},brandRow:{flexDirection:'row',alignItems:'center',marginBottom:26,gap:9},brandMark:{height:38,width:38,backgroundColor:CRIMSON,borderRadius:13,alignItems:'center',justifyContent:'center'},brand:{fontSize:20,fontWeight:'900',letterSpacing:0.7,color:DARK},hero:{backgroundColor:'#7E1230',borderRadius:26,padding:25,marginBottom:18,minHeight:182,justifyContent:'center'},eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:'#FFD6A1',marginBottom:10},heroTitle:{color:'white',fontSize:34,fontWeight:'900',lineHeight:41},heroSubtitle:{color:'#FFE5E8',fontSize:14,lineHeight:21,marginTop:11},panel:{backgroundColor:'white',borderWidth:1,borderColor:'#F0DDDA',borderRadius:24,padding:21,marginBottom:16},panelHeading:{fontSize:23,fontWeight:'850',color:DARK,marginBottom:7},muted:{fontSize:14,color:MUTED,lineHeight:21,marginBottom:14},field:{marginTop:10,marginBottom:5},label:{fontSize:13,fontWeight:'700',color:DARK,marginBottom:8},input:{backgroundColor:'#FFFCFA',borderColor:'#E7D3D2',borderWidth:1,borderRadius:13,minHeight:51,paddingHorizontal:15,fontSize:16,color:DARK},action:{backgroundColor:CRIMSON,borderRadius:13,minHeight:51,alignItems:'center',justifyContent:'center',paddingHorizontal:14,marginTop:12},actionText:{color:'white',fontSize:15,fontWeight:'800',textAlign:'center'},secondaryAction:{backgroundColor:'#FBEAE5'},secondaryActionText:{color:'#8D1A38'},welcome:{backgroundColor:'#7E1230',borderRadius:25,padding:23,marginBottom:24},welcomeTitle:{fontSize:27,color:'white',fontWeight:'900',marginBottom:7},welcomeSubtitle:{fontSize:14,color:'#FFE2E6'},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},sectionTitle:{fontSize:22,color:DARK,fontWeight:'850',marginBottom:12},smallAccent:{fontSize:10,fontWeight:'800',color:CRIMSON,marginBottom:12},feature:{flexDirection:'row',alignItems:'center',gap:13,backgroundColor:'white',borderColor:'#F0DDDA',borderWidth:1,borderRadius:19,padding:16,marginBottom:12},featureIcon:{backgroundColor:'#FFF0E6',height:51,width:51,borderRadius:15,justifyContent:'center',alignItems:'center'},featureEmoji:{fontSize:24},featureTitle:{fontSize:16,fontWeight:'800',color:DARK,marginBottom:4},featureDescription:{fontSize:12,color:MUTED,lineHeight:18},chevron:{fontSize:29,color:'#BE8B94'},note:{backgroundColor:'#FDEBD8',borderRadius:18,padding:18,marginTop:9},noteTitle:{fontSize:15,fontWeight:'800',color:DARK,marginBottom:5},noteBody:{fontSize:13,color:'#765A5E',lineHeight:20},avatar:{width:75,height:75,backgroundColor:'#F7DCE1',borderRadius:40,alignSelf:'center',alignItems:'center',justifyContent:'center',marginBottom:15},avatarLetter:{fontSize:33,fontWeight:'900',color:CRIMSON},joined:{color:'#24734B',fontSize:14,fontWeight:'700',marginTop:14,textAlign:'center'},tabBar:{flexDirection:'row',backgroundColor:'white',borderTopWidth:1,borderTopColor:'#F0DDDA',paddingTop:9,paddingBottom:Platform.OS==='ios'?14:9},tab:{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:3},tabIcon:{fontSize:23,color:'#AD9A9C'},tabLabel:{fontSize:11,fontWeight:'700',color:'#AD9A9C',marginTop:3},tabActive:{color:CRIMSON},footer:{marginTop:'auto',paddingTop:18,alignItems:'center'},footerText:{fontSize:10,fontWeight:'800',letterSpacing:1.1,color:'#B49DA0'},loading:{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:80}
});
