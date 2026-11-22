import {supabase} from './supabase';
export async function requireUser(){if(!supabase)throw Error('Missing Supabase config');const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw Error('Please sign in');return data.user}
