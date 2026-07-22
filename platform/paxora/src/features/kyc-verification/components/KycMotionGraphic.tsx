'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function KycMotionGraphic() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shieldOutlineRef = useRef<SVGPathElement>(null);
  const shieldFillRef = useRef<SVGPathElement>(null);
  const checkmarkRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const orbitTopGroupRef = useRef<SVGGElement>(null);
  const orbitBottomGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(shieldOutlineRef.current, { strokeDasharray: 120, strokeDashoffset: 120 });
      gsap.set(shieldFillRef.current, { scale: 0, opacity: 0, transformOrigin: '12px 12px' });
      gsap.set(checkmarkRef.current, { strokeDasharray: 30, strokeDashoffset: 30 });
      gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
      gsap.set([orbitTopGroupRef.current, orbitBottomGroupRef.current], { scale: 0, opacity: 0, transformOrigin: '12px 12px' });

      tl.to(shieldOutlineRef.current, {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: 'power2.inOut',
      });

      tl.to(shieldFillRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'back.out(2)',
      }, '-=0.2');

      tl.to(checkmarkRef.current, {
        strokeDashoffset: 0,
        duration: 0.35,
        ease: 'power2.out',
      }, '-=0.1');

      tl.to(shieldOutlineRef.current, {
        scale: 1.06,
        transformOrigin: '12px 12px',
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });

      tl.to(glowRef.current, {
        scale: 1,
        opacity: 0.2,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.3');

      tl.to([orbitTopGroupRef.current, orbitBottomGroupRef.current], {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(2)',
      }, '-=0.2');

      tl.to(orbitTopGroupRef.current, {
        rotation: 360,
        transformOrigin: '12px 12px',
        duration: 4,
        repeat: -1,
        ease: 'none',
      }, '-=0.1');

      tl.to(orbitBottomGroupRef.current, {
        rotation: -360,
        transformOrigin: '12px 12px',
        duration: 4,
        repeat: -1,
        ease: 'none',
      }, '-=0.1');

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative w-full max-w-[72px] mx-auto aspect-square flex items-center justify-center shrink-0 my-1">
      <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible text-primary">
        <circle ref={glowRef} cx="12" cy="12" r="10" fill="currentColor" />

        <g ref={orbitTopGroupRef} style={{ transformOrigin: '12px 12px' }}>
          <circle cx="12" cy="3" r="1.2" className="fill-primary/60" />
        </g>

        <g ref={orbitBottomGroupRef} style={{ transformOrigin: '12px 12px' }}>
          <circle cx="12" cy="21" r="1.2" className="fill-primary/60" />
        </g>

        <path
          ref={shieldFillRef}
          d="M12 2.5l8 3.5v5c0 4.5-3.5 8.5-8 10-4.5-1.5-8-5.5-8-10V6l8-3.5z"
          className="fill-primary/15"
          stroke="none"
        />
        <path
          ref={shieldOutlineRef}
          d="M12 2.5l8 3.5v5c0 4.5-3.5 8.5-8 10-4.5-1.5-8-5.5-8-10V6l8-3.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="120"
          style={{ filter: 'drop-shadow(0px 0px 4px currentColor)' }}
        />
        <path
          ref={checkmarkRef}
          d="M9 12.5l2 2 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="30"
        />
      </svg>
    </div>
  );
}
