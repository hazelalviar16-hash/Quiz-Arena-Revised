'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff } from 'lucide-react';
import { isPreviewMode, setPreviewPlayerName } from '../../lib/preview';
import { supabase } from '../../lib/supabase';
import { QuizArenaWordmark } from '../quiz-arena-wordmark';
import roundStopwatch from './round-stopwatch.webp';
import styles from './auth.module.css';

type Feedback = {
  kind: 'error' | 'confirmation';
  text: string;
};

const roundScale = 4;
const roundTicks = [0, 1, 2, 3, roundScale];
const sampleResults = [
  { player: 'Mika', seconds: 2.4 },
  { player: 'Javi', seconds: 3.1 },
] as const;

function RoundPreview() {
  const gap = (sampleResults[1].seconds - sampleResults[0].seconds).toFixed(1);

  return (
    <section className={styles.replay} aria-labelledby="round-title">
      <h2 className={styles.previewLabel} id="round-title">Round preview</h2>
      <div className={styles.roundHero}>
        <p className={styles.margin}>
          <strong className={styles.marginValue}>{gap} s</strong>{' '}
          <span className={styles.apart}>apart</span>
        </p>
        <Image className={styles.artwork} src={roundStopwatch} alt="" priority unoptimized />
      </div>

      <section className={styles.race} aria-labelledby="time-title">
        <h3 className={styles.raceTitle} id="time-title">Time to answer</h3>
        <div className={styles.axis} aria-hidden="true">
          <div className={styles.scale}>
            {roundTicks.map(tick => (
              <span key={tick}>{tick === roundScale ? `${tick} s` : tick}</span>
            ))}
          </div>
        </div>
        <ol className={styles.lanes} role="list">
          {sampleResults.map(({ player, seconds }, index) => (
            <li className={styles.lane} key={player}>
              <span className={styles.place}><span className={styles.srOnly}>Place </span>{index + 1}</span>
              <span className={styles.runner}>{player}</span>
              <div className={styles.track} aria-hidden="true">
                <span className={styles.trackFill} style={{ width: `${(seconds / roundScale) * 100}%` }} />
              </div>
              <time className={styles.time} dateTime={`PT${seconds}S`}>{seconds.toFixed(1)} s</time>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.questionResult}>
        <p>Which planet is known as the Red Planet?</p>
        <span className={styles.correct}>
          <Check size={20} strokeWidth={3} aria-hidden="true" />
          <span className={styles.srOnly}>Correct answer </span>
          Mars
        </span>
      </div>
    </section>
  );
}

export default function Auth() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (focusHeading.current) {
      headingRef.current?.focus();
      focusHeading.current = false;
    }
  }, [register]);

  function switchMode() {
    focusHeading.current = true;
    setRegister(!register);
    setFeedback(null);
    setVisible(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (register && !name.trim()) {
      setFeedback({ kind: 'error', text: 'Please enter your name.' });
      return;
    }
    if (password.length < 6) {
      setFeedback({ kind: 'error', text: 'Password must contain at least six characters.' });
      return;
    }
    if (isPreviewMode) {
      setPreviewPlayerName(register ? name.trim() : undefined);
      router.push('/dashboard');
      return;
    }
    if (!supabase) {
      setFeedback({ kind: 'error', text: 'Set Supabase environment variables first.' });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      if (register) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: location.origin + '/auth',
          },
        });
        if (error) throw error;
        if (!data.session) {
          setFeedback({
            kind: 'confirmation',
            text: 'Account created. Confirm your email, then sign in.',
          });
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      router.push('/dashboard');
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Authentication failed',
      });
    } finally {
      setBusy(false);
    }
  }

  const title = register ? 'Create an account' : 'Sign in';
  const submitLabel = register ? 'Create account' : 'Sign in';
  const busyLabel = register ? 'Creating account…' : 'Signing in…';

  return (
    <main className={styles.stage}>
      <div className={styles.frame}>
        <header className={styles.masthead}>
          <Link className={styles.wordmark} href="/" aria-label="Quiz Arena home">
            <QuizArenaWordmark />
          </Link>
        </header>

        <div className={styles.layout}>
          <section
            className={styles.panel}
            aria-labelledby="auth-title"
            data-mode={register ? 'registration' : 'sign-in'}
          >
            <div className={styles.intro}>
              <h1 id="auth-title" ref={headingRef} tabIndex={-1}>{title}</h1>
              {isPreviewMode && (
                <p className={styles.preview}>
                  {register ? 'Use sample details to try registration.' : 'Use sample details to sign in.'}
                </p>
              )}
            </div>
            <form className={styles.form} onSubmit={submit} aria-busy={busy}>
              {register && (
                <div className={styles.field}>
                  <label htmlFor="qa-name">Full name</label>
                  <input
                    id="qa-name"
                    name="name"
                    placeholder="Alex Reyes"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="qa-email">Email address</label>
                <input
                  id="qa-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="qa-password">Password</label>
                <div className={styles.passwordField}>
                  <input
                    id="qa-password"
                    name="password"
                    type={visible ? 'text' : 'password'}
                    placeholder={register ? 'At least 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    autoComplete={register ? 'new-password' : 'current-password'}
                    autoCapitalize="none"
                    spellCheck={false}
                    minLength={6}
                    required
                  />
                  <button
                    className={styles.visibility}
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-controls="qa-password"
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div>
                <div role="status" aria-atomic="true">
                  {feedback && (
                    <p className={styles.notice} data-kind={feedback.kind}>{feedback.text}</p>
                  )}
                </div>
                <button className={styles.submit} type="submit" disabled={busy}>
                  {busy ? busyLabel : submitLabel}
                </button>
              </div>
            </form>
            <div className={styles.formLinks}>
              <p className={styles.switchMode}>
                {register ? 'Already have an account?' : 'New here?'}{' '}
                <button className={styles.modeButton} type="button" onClick={switchMode} disabled={busy}>
                  {register ? 'Sign in' : 'Create an account'}
                </button>
              </p>
              {isPreviewMode && (
                <Link className={styles.previewLink} href="/dashboard">Open UI preview</Link>
              )}
            </div>
          </section>
          <RoundPreview />
        </div>
      </div>
    </main>
  );
}
