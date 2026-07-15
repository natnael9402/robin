import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function LoanAnimation() {
    const rootRef = useRef<HTMLDivElement>(null);
    const baseRef = useRef<SVGLineElement>(null);
    const pillar1Ref = useRef<SVGLineElement>(null);
    const pillar2Ref = useRef<SVGLineElement>(null);
    const pillar3Ref = useRef<SVGLineElement>(null);
    const pillar4Ref = useRef<SVGLineElement>(null);
    const roofRef = useRef<SVGPolygonElement>(null);
    const glowRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        if (!rootRef.current) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Initial state
            gsap.set(baseRef.current, { strokeDasharray: 100, strokeDashoffset: 100 });
            gsap.set([pillar1Ref.current, pillar2Ref.current, pillar3Ref.current, pillar4Ref.current], { strokeDasharray: 100, strokeDashoffset: 100 });
            gsap.set(roofRef.current, { strokeDasharray: 100, strokeDashoffset: 100, fill: "transparent" });
            gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });

            // 1. Draw base
            tl.to(baseRef.current, {
                strokeDashoffset: 0,
                duration: 0.5,
                ease: "power2.out"
            });

            // 2. Draw pillars
            tl.to([pillar1Ref.current, pillar2Ref.current, pillar3Ref.current, pillar4Ref.current], {
                strokeDashoffset: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.2");

            // 3. Draw roof
            tl.to(roofRef.current, {
                strokeDashoffset: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.2");

            // 4. Fill roof & pop
            tl.to(roofRef.current, {
                fill: "currentColor",
                fillOpacity: 0.2,
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.2");

            tl.fromTo(roofRef.current,
                { scale: 1, transformOrigin: "center 7px" },
                { scale: 1.1, duration: 0.2, ease: "back.out(2)", yoyo: true, repeat: 1 },
                "-=0.4"
            );

            // 5. Glow expand
            tl.to(glowRef.current, {
                scale: 1,
                opacity: 0.15,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.4");

        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0 my-4">
            <svg viewBox="0 0 24 24" className="w-20 h-20 overflow-visible text-[#B8860B] dark:text-[#D4AF37]">
                <circle ref={glowRef} cx="12" cy="12" r="14" fill="currentColor" />
                <line ref={baseRef} x1="3" x2="21" y1="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
                <line ref={pillar1Ref} x1="6" x2="6" y1="18" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
                <line ref={pillar2Ref} x1="10" x2="10" y1="18" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
                <line ref={pillar3Ref} x1="14" x2="14" y1="18" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
                <line ref={pillar4Ref} x1="18" x2="18" y1="18" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
                <polygon ref={roofRef} points="12 2 20 7 4 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" style={{ filter: 'drop-shadow(0px 0px 4px currentColor)' }} />
            </svg>
        </div>
    );
}
