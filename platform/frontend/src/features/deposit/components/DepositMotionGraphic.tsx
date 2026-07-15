import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function DepositMotionGraphic() {
    const rootRef = useRef<HTMLDivElement>(null);
    const walletOpeningRef = useRef<SVGPathElement>(null);
    const walletRef = useRef<SVGPathElement>(null);
    const walletFlapRef = useRef<SVGPathElement>(null);
    const coinsRef = useRef<(SVGGElement | null)[]>([]);
    const glowRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        if (!rootRef.current) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            gsap.set(walletRef.current, { strokeDasharray: 100, strokeDashoffset: 100 });
            gsap.set(walletOpeningRef.current, { strokeDasharray: 100, strokeDashoffset: 100 });
            gsap.set(walletFlapRef.current, { strokeDasharray: 50, strokeDashoffset: 50 });
            gsap.set(glowRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });

            coinsRef.current.forEach(coin => {
                if (coin) {
                    gsap.set(coin, { y: -10, opacity: 0, scale: 0, transformOrigin: '12px 2px' });
                }
            });

            tl.to(walletOpeningRef.current, {
                strokeDashoffset: 0,
                duration: 0.4,
                ease: "power2.inOut"
            });
            tl.to(walletRef.current, {
                strokeDashoffset: 0,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.2");
            tl.to(walletFlapRef.current, {
                strokeDashoffset: 0,
                duration: 0.3,
                ease: "power2.out"
            }, "-=0.3");

            coinsRef.current.forEach((coin, i) => {
                if (!coin) return;
                const coinTl = gsap.timeline();

                coinTl.to(coin, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: "back.out(1.5)",
                });

                coinTl.to(coin, {
                    y: 7,
                    opacity: 0,
                    scale: 0.6,
                    duration: 0.35,
                    ease: "power2.in"
                });

                tl.add(coinTl, 0.5 + i * 0.25);

                tl.to([walletRef.current, walletOpeningRef.current, walletFlapRef.current], {
                    scaleY: 1.05,
                    scaleX: 1.02,
                    transformOrigin: "12px 20px",
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out"
                }, 0.5 + i * 0.25 + 0.55);
            });

            tl.to(glowRef.current, {
                scale: 1,
                opacity: 0.15,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.2");

        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className="relative w-full max-w-[72px] mx-auto aspect-square flex items-center justify-center shrink-0 my-1">
            <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible text-[#B8860B] dark:text-[#D4AF37]">
                <circle ref={glowRef} cx="12" cy="12" r="10" fill="currentColor" />

                <path ref={walletOpeningRef} d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength="100" />

                <g>
                    {[0, 1, 2].map((_, i) => (
                        <g key={i} ref={el => { coinsRef.current[i] = el; }}>
                            <circle cx="12" cy="2" r="5" className="fill-[#F59E0B] dark:fill-[#FACC15]" />
                            <circle cx="12" cy="2" r="3.8" fill="none" strokeWidth="0.5" className="stroke-[#B45309] dark:stroke-[#CA8A04]" />
                            <text x="12" y="3.8" fontSize="4.5" fontWeight="black" textAnchor="middle" className="fill-[#B45309] dark:fill-[#CA8A04]">$</text>
                        </g>
                    ))}
                </g>

                <path
                    ref={walletRef}
                    d="M4 6v12c0 1.1.9 2 2 2h14v-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="100"
                    style={{ filter: 'drop-shadow(0px 0px 4px currentColor)' }}
                />

                <path
                    ref={walletFlapRef}
                    d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="50"
                />
            </svg>
        </div>
    );
}
