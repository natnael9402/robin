import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function VerificationMotionGraphic() {
    const rootRef = useRef<HTMLDivElement>(null);
    const shieldRef = useRef<SVGPathElement>(null);
    const checkRef = useRef<SVGPathElement>(null);
    const glowRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        if (!rootRef.current) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Initial state
            gsap.set(shieldRef.current, { strokeDasharray: 100, strokeDashoffset: 100, fill: "transparent" });
            gsap.set(checkRef.current, { strokeDasharray: 100, strokeDashoffset: 100 });
            gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });

            // 1. Draw shield
            tl.to(shieldRef.current, {
                strokeDashoffset: 0,
                duration: 1,
                ease: "power2.inOut"
            });

            // 2. Shield pop & fill
            tl.to(shieldRef.current, {
                fill: "currentColor",
                fillOpacity: 0.15,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.2");
            
            tl.fromTo(shieldRef.current, 
                { scale: 1, transformOrigin: "center" },
                { scale: 1.08, duration: 0.2, ease: "back.out(2)", yoyo: true, repeat: 1 },
                "-=0.5"
            );

            // 3. Draw checkmark
            tl.to(checkRef.current, {
                strokeDashoffset: 0,
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.3");

            // 4. Checkmark pop
            tl.fromTo(checkRef.current,
                { scale: 1, transformOrigin: "center" },
                { scale: 1.2, duration: 0.2, ease: "back.out(2)", yoyo: true, repeat: 1 },
                "-=0.2"
            );
            
            // 5. Glow expand
            tl.to(glowRef.current, {
                scale: 1,
                opacity: 0.15,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.5");

        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0 my-4">
            <svg viewBox="0 0 24 24" className="w-20 h-20 overflow-visible text-[#2563EB] dark:text-[#3B82F6]">
                <circle ref={glowRef} cx="12" cy="12" r="14" fill="currentColor" />
                <path
                    ref={shieldRef}
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="100"
                    style={{ filter: 'drop-shadow(0px 0px 4px currentColor)' }}
                />
                <path
                    ref={checkRef}
                    d="m9 12 2 2 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="100"
                />
            </svg>
        </div>
    );
}
