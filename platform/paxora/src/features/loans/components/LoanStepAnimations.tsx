'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function WelcomeAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const coinOuterRef = useRef<SVGCircleElement>(null);
  const coinInnerRef = useRef<SVGCircleElement>(null);
  const dollarRef = useRef<SVGTextElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const shineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set(coinOuterRef.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(coinInnerRef.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(dollarRef.current, { opacity: 0, scale: 0, transformOrigin: '12px 12px' });
      gsap.set(shineRef.current, { strokeDasharray: 20, strokeDashoffset: 20, opacity: 0 });

      tl.to(glowRef.current, { scale: 1, opacity: 0.15, duration: 0.6, ease: 'power2.out' });
      tl.to(coinOuterRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' }, '-=0.3');
      tl.to(coinInnerRef.current, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, '-=0.2');
      tl.to(dollarRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, '-=0.1');
      tl.to(shineRef.current, { opacity: 0.5, strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');

      tl.to(coinOuterRef.current, {
        scale: 1.06, transformOrigin: '12px 12px', duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out',
      }, '-=0.3');

      gsap.to(coinOuterRef.current, {
        y: -2, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0 my-2">
      <svg viewBox="0 0 24 24" className="w-20 h-20 overflow-visible text-[#2563EB] dark:text-[#3B82F6]">
        <circle ref={glowRef} cx="12" cy="12" r="10" fill="currentColor" />
        <circle ref={coinOuterRef} cx="12" cy="12" r="7" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 0px 5px currentColor)' }} />
        <circle ref={coinInnerRef} cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.35" />
        <text ref={dollarRef} x="12" y="14.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold">$</text>
        <line ref={shineRef} x1="7" y1="7" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}

export function LoanDetailsAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const coinOuterRef = useRef<SVGCircleElement>(null);
  const coinInnerRef = useRef<SVGCircleElement>(null);
  const dollarRef = useRef<SVGTextElement>(null);
  const ring1Ref = useRef<SVGCircleElement>(null);
  const ring2Ref = useRef<SVGCircleElement>(null);
  const sparkle1Ref = useRef<SVGCircleElement>(null);
  const sparkle2Ref = useRef<SVGCircleElement>(null);
  const sparkle3Ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(coinOuterRef.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(coinInnerRef.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(dollarRef.current, { opacity: 0, scale: 0, transformOrigin: '12px 12px' });
      gsap.set(ring1Ref.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(ring2Ref.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set([sparkle1Ref.current, sparkle2Ref.current, sparkle3Ref.current], { scale: 0, opacity: 0, transformOrigin: 'center' });

      tl.to(coinOuterRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' });
      tl.to(coinInnerRef.current, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, '-=0.2');
      tl.to(dollarRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, '-=0.1');
      tl.to(ring1Ref.current, { scale: 1, opacity: 0.3, duration: 0.5, ease: 'power2.out' }, '-=0.2');
      tl.to(ring2Ref.current, { scale: 1, opacity: 0.15, duration: 0.6, ease: 'power2.out' }, '-=0.3');
      tl.to([sparkle1Ref.current, sparkle2Ref.current, sparkle3Ref.current], {
        scale: 1, opacity: 1, duration: 0.3, stagger: 0.1, ease: 'back.out(3)',
      }, '-=0.3');

      gsap.to(ring1Ref.current, {
        rotation: 360, transformOrigin: '12px 12px', duration: 8, repeat: -1, ease: 'none',
      });
      gsap.to(ring2Ref.current, {
        rotation: -360, transformOrigin: '12px 12px', duration: 12, repeat: -1, ease: 'none',
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0 my-2">
      <svg viewBox="0 0 24 24" className="w-20 h-20 overflow-visible text-[#2563EB] dark:text-[#3B82F6]">
        <circle ref={ring2Ref} cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        <circle ref={ring1Ref} cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        <circle ref={coinOuterRef} cx="12" cy="12" r="7" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" style={{ filter: 'drop-shadow(0px 0px 4px currentColor)' }} />
        <circle ref={coinInnerRef} cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
        <text ref={dollarRef} x="12" y="14.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold">$</text>
        <circle ref={sparkle1Ref} cx="4" cy="5" r="0.8" fill="currentColor" fillOpacity="0.6" />
        <circle ref={sparkle2Ref} cx="20" cy="6" r="0.6" fill="currentColor" fillOpacity="0.5" />
        <circle ref={sparkle3Ref} cx="19" cy="19" r="0.7" fill="currentColor" fillOpacity="0.4" />
      </svg>
    </div>
  );
}

export function IdentityAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<SVGRectElement>(null);
  const chipRef = useRef<SVGRectElement>(null);
  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);
  const line3Ref = useRef<SVGLineElement>(null);
  const avatarRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(cardRef.current, { strokeDasharray: 120, strokeDashoffset: 120, fill: 'transparent' });
      gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set([chipRef.current, line1Ref.current, line2Ref.current, line3Ref.current, avatarRef.current], { opacity: 0 });

      tl.to(glowRef.current, { scale: 1, opacity: 0.1, duration: 0.5, ease: 'power2.out' });
      tl.to(cardRef.current, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.3');
      tl.to(cardRef.current, { fill: 'currentColor', fillOpacity: 0.08, duration: 0.3 }, '-=0.2');
      tl.to(chipRef.current, { opacity: 1, duration: 0.3 }, '-=0.1');
      tl.to(line1Ref.current, { opacity: 1, duration: 0.25 }, '-=0.1');
      tl.to(line2Ref.current, { opacity: 1, duration: 0.25 }, '-=0.15');
      tl.to(line3Ref.current, { opacity: 1, duration: 0.25 }, '-=0.15');
      tl.to(avatarRef.current, { opacity: 1, duration: 0.3 }, '-=0.3');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0 my-2">
      <svg viewBox="0 0 24 24" className="w-20 h-20 overflow-visible text-[#2563EB] dark:text-[#3B82F6]">
        <circle ref={glowRef} cx="12" cy="12" r="10" fill="currentColor" />
        <rect ref={cardRef} x="2" y="5" width="20" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" pathLength="120" style={{ filter: 'drop-shadow(0px 0px 3px currentColor)' }} />
        <rect ref={chipRef} x="5" y="9" width="4" height="3" rx="0.8" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.6" />
        <line ref={line1Ref} x1="11" y1="9.5" x2="17" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
        <line ref={line2Ref} x1="11" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.35" />
        <line ref={line3Ref} x1="5" y1="15.5" x2="12" y2="15.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.35" />
        <circle ref={avatarRef} cx="17" cy="15" r="2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

export function DocumentsAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<SVGRectElement>(null);
  const lensRef = useRef<SVGCircleElement>(null);
  const lensInnerRef = useRef<SVGCircleElement>(null);
  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const scanLineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(docRef.current, { strokeDasharray: 100, strokeDashoffset: 100, fill: 'transparent' });
      gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set([lensRef.current, lensInnerRef.current], { opacity: 0 });
      gsap.set([line1Ref.current, line2Ref.current], { opacity: 0 });
      gsap.set(scanLineRef.current, { opacity: 0, attr: { y1: 6, y2: 6 } });

      tl.to(glowRef.current, { scale: 1, opacity: 0.1, duration: 0.5, ease: 'power2.out' });
      tl.to(docRef.current, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
      tl.to(docRef.current, { fill: 'currentColor', fillOpacity: 0.06, duration: 0.3 }, '-=0.2');
      tl.to([line1Ref.current, line2Ref.current], { opacity: 1, duration: 0.3, stagger: 0.1 }, '-=0.2');
      tl.to(lensRef.current, { opacity: 1, duration: 0.3 }, '-=0.2');
      tl.to(lensInnerRef.current, { opacity: 1, duration: 0.2 }, '-=0.1');

      tl.to(scanLineRef.current, { opacity: 0.6, attr: { y1: 6, y2: 6 }, duration: 0.1 }, '-=0.1');
      tl.to(scanLineRef.current, { attr: { y1: 18, y2: 18 }, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0 my-2">
      <svg viewBox="0 0 24 24" className="w-20 h-20 overflow-visible text-[#2563EB] dark:text-[#3B82F6]">
        <circle ref={glowRef} cx="12" cy="12" r="10" fill="currentColor" />
        <rect ref={docRef} x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" pathLength="100" style={{ filter: 'drop-shadow(0px 0px 3px currentColor)' }} />
        <line ref={line1Ref} x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
        <line ref={line2Ref} x1="7" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.3" />
        <circle ref={lensRef} cx="15" cy="15" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle ref={lensInnerRef} cx="15" cy="15" r="1.8" fill="currentColor" fillOpacity="0.2" />
        <line ref={scanLineRef} x1="6" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}

export function ReviewAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shieldOutlineRef = useRef<SVGPathElement>(null);
  const shieldFillRef = useRef<SVGPathElement>(null);
  const checkmarkRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const orbitTopRef = useRef<SVGGElement>(null);
  const orbitBottomRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(shieldOutlineRef.current, { strokeDasharray: 120, strokeDashoffset: 120 });
      gsap.set(shieldFillRef.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(checkmarkRef.current, { strokeDasharray: 30, strokeDashoffset: 30 });
      gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set([orbitTopRef.current, orbitBottomRef.current], { scale: 0, opacity: 0, transformOrigin: '12px 12px' });

      tl.to(glowRef.current, { scale: 1, opacity: 0.15, duration: 0.5, ease: 'power2.out' });
      tl.to(shieldOutlineRef.current, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, '-=0.2');
      tl.to(shieldFillRef.current, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }, '-=0.2');
      tl.to(checkmarkRef.current, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, '-=0.1');
      tl.to(shieldOutlineRef.current, {
        scale: 1.06, transformOrigin: '12px 12px', duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out',
      });
      tl.to([orbitTopRef.current, orbitBottomRef.current], {
        scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)',
      }, '-=0.2');
      tl.to(orbitTopRef.current, {
        rotation: 360, transformOrigin: '12px 12px', duration: 4, repeat: -1, ease: 'none',
      }, '-=0.1');
      tl.to(orbitBottomRef.current, {
        rotation: -360, transformOrigin: '12px 12px', duration: 4, repeat: -1, ease: 'none',
      }, '-=0.1');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-[120px] h-[120px] flex items-center justify-center shrink-0 my-2">
      <svg viewBox="0 0 24 24" className="w-16 h-16 overflow-visible text-[#2563EB] dark:text-[#3B82F6]">
        <circle ref={glowRef} cx="12" cy="12" r="10" fill="currentColor" />
        <g ref={orbitTopRef} style={{ transformOrigin: '12px 12px' }}>
          <circle cx="12" cy="3" r="1.2" className="fill-primary/60" />
        </g>
        <g ref={orbitBottomRef} style={{ transformOrigin: '12px 12px' }}>
          <circle cx="12" cy="21" r="1.2" className="fill-primary/60" />
        </g>
        <path ref={shieldFillRef} d="M12 2.5l8 3.5v5c0 4.5-3.5 8.5-8 10-4.5-1.5-8-5.5-8-10V6l8-3.5z" className="fill-primary/15" stroke="none" />
        <path ref={shieldOutlineRef} d="M12 2.5l8 3.5v5c0 4.5-3.5 8.5-8 10-4.5-1.5-8-5.5-8-10V6l8-3.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" pathLength="120" style={{ filter: 'drop-shadow(0px 0px 4px currentColor)' }} />
        <path ref={checkmarkRef} d="M9 12.5l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="30" />
      </svg>
    </div>
  );
}

export function SuccessAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const burst1Ref = useRef<SVGLineElement>(null);
  const burst2Ref = useRef<SVGLineElement>(null);
  const burst3Ref = useRef<SVGLineElement>(null);
  const burst4Ref = useRef<SVGLineElement>(null);
  const burst5Ref = useRef<SVGLineElement>(null);
  const burst6Ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(circleRef.current, { strokeDasharray: 80, strokeDashoffset: 80 });
      gsap.set(checkRef.current, { strokeDasharray: 20, strokeDashoffset: 20 });
      gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set([burst1Ref.current, burst2Ref.current, burst3Ref.current, burst4Ref.current, burst5Ref.current, burst6Ref.current], {
        strokeDasharray: 10, strokeDashoffset: 10, opacity: 0,
      });

      tl.to(glowRef.current, { scale: 1, opacity: 0.2, duration: 0.5, ease: 'power2.out' });
      tl.to(circleRef.current, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
      tl.to(checkRef.current, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1');
      tl.to(circleRef.current, {
        scale: 1.08, transformOrigin: '12px 12px', duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out',
      });
      tl.to([burst1Ref.current, burst2Ref.current, burst3Ref.current, burst4Ref.current, burst5Ref.current, burst6Ref.current], {
        opacity: 0.5, strokeDashoffset: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out',
      }, '-=0.3');
      tl.to([burst1Ref.current, burst2Ref.current, burst3Ref.current, burst4Ref.current, burst5Ref.current, burst6Ref.current], {
        opacity: 0, duration: 0.8, stagger: 0.05,
      }, '-=0.1');
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-[160px] h-[160px] flex items-center justify-center shrink-0 my-2">
      <svg viewBox="0 0 24 24" className="w-24 h-24 overflow-visible text-[#10b981]">
        <circle ref={glowRef} cx="12" cy="12" r="12" fill="currentColor" />
        <circle ref={circleRef} cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" pathLength="80" style={{ filter: 'drop-shadow(0px 0px 6px currentColor)' }} />
        <path ref={checkRef} d="M8 12.5l3 3 5-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength="20" />
        <line ref={burst1Ref} x1="12" y1="0" x2="12" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line ref={burst2Ref} x1="12" y1="22" x2="12" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line ref={burst3Ref} x1="0" y1="12" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line ref={burst4Ref} x1="22" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line ref={burst5Ref} x1="3.5" y1="3.5" x2="5" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line ref={burst6Ref} x1="19" y1="19" x2="20.5" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
