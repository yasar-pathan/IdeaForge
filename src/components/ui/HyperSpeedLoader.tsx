'use client';

type HyperSpeedLoaderProps = {
  title?: string;
  subtitle?: string;
};

export function HyperSpeedLoader({
  title = 'Processing your idea',
  subtitle = 'Syncing modules and preparing your workspace',
}: HyperSpeedLoaderProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div className="hyper-speed-noise absolute inset-0 opacity-20" aria-hidden />
      <div className="hyper-speed-lines absolute inset-0" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center justify-center">
        <div className="hyper-speed-loader" aria-hidden>
          <span>
            <span />
            <span />
            <span />
            <span />
          </span>
          <div className="base">
            <span />
            <div className="face" />
          </div>
        </div>

        <div className="mt-16 space-y-3 text-center">
          <p className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {title}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{subtitle}</p>
        </div>
      </div>

      <style jsx>{`
        .hyper-speed-loader {
          position: absolute;
          top: 46%;
          left: 50%;
          margin-left: -50px;
          animation: speeder 0.4s linear infinite;
          filter: drop-shadow(0 0 10px rgba(124, 110, 250, 0.4));
        }

        .hyper-speed-loader > span {
          position: absolute;
          top: -19px;
          left: 60px;
          width: 35px;
          height: 5px;
          border-radius: 2px 10px 1px 0;
          background: var(--text-primary);
        }

        .base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid var(--text-primary);
          border-bottom: 6px solid transparent;
        }

        .base span:before {
          content: '';
          position: absolute;
          right: -110px;
          top: -16px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--text-primary);
        }

        .base span:after {
          content: '';
          position: absolute;
          top: -16px;
          right: -98px;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid var(--text-primary);
          border-bottom: 16px solid transparent;
        }

        .face {
          position: absolute;
          right: -125px;
          top: -15px;
          width: 20px;
          height: 12px;
          border-radius: 20px 20px 0 0;
          background: var(--text-primary);
          transform: rotate(-40deg);
        }

        .face:after {
          content: '';
          position: absolute;
          right: 4px;
          top: 7px;
          width: 12px;
          height: 12px;
          border-radius: 0 0 0 2px;
          background: var(--text-primary);
          transform: rotate(40deg);
          transform-origin: 50% 50%;
        }

        .hyper-speed-loader > span > span:nth-child(1),
        .hyper-speed-loader > span > span:nth-child(2),
        .hyper-speed-loader > span > span:nth-child(3),
        .hyper-speed-loader > span > span:nth-child(4) {
          position: absolute;
          width: 30px;
          height: 1px;
          background: var(--text-primary);
          animation: fazer1 0.2s linear infinite;
        }

        .hyper-speed-loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.4s linear infinite;
        }

        .hyper-speed-loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.4s linear infinite;
          animation-delay: -1s;
        }

        .hyper-speed-loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1s linear infinite;
          animation-delay: -1s;
        }

        .hyper-speed-lines {
          overflow: hidden;
          pointer-events: none;
        }

        .hyper-speed-lines span {
          position: absolute;
          width: 22%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(124, 110, 250, 0.25) 35%,
            rgba(240, 240, 255, 0.4) 50%,
            rgba(124, 110, 250, 0.25) 65%,
            transparent 100%
          );
        }

        .hyper-speed-lines span:nth-child(1) {
          top: 20%;
          animation: lf 0.7s linear infinite;
          animation-delay: -2s;
        }
        .hyper-speed-lines span:nth-child(2) {
          top: 40%;
          animation: lf2 0.9s linear infinite;
          animation-delay: -1s;
        }
        .hyper-speed-lines span:nth-child(3) {
          top: 60%;
          animation: lf3 0.65s linear infinite;
        }
        .hyper-speed-lines span:nth-child(4) {
          top: 80%;
          animation: lf4 0.55s linear infinite;
          animation-delay: -3s;
        }

        .hyper-speed-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        @keyframes fazer1 {
          0% {
            left: 0;
          }
          100% {
            left: -80px;
            opacity: 0;
          }
        }
        @keyframes fazer2 {
          0% {
            left: 0;
          }
          100% {
            left: -100px;
            opacity: 0;
          }
        }
        @keyframes fazer3 {
          0% {
            left: 0;
          }
          100% {
            left: -50px;
            opacity: 0;
          }
        }
        @keyframes fazer4 {
          0% {
            left: 0;
          }
          100% {
            left: -150px;
            opacity: 0;
          }
        }

        @keyframes speeder {
          0% {
            transform: translate(2px, 1px) rotate(0deg);
          }
          10% {
            transform: translate(-1px, -3px) rotate(-1deg);
          }
          20% {
            transform: translate(-2px, 0) rotate(1deg);
          }
          30% {
            transform: translate(1px, 2px) rotate(0deg);
          }
          40% {
            transform: translate(1px, -1px) rotate(1deg);
          }
          50% {
            transform: translate(-1px, 3px) rotate(-1deg);
          }
          60% {
            transform: translate(-1px, 1px) rotate(0deg);
          }
          70% {
            transform: translate(3px, 1px) rotate(-1deg);
          }
          80% {
            transform: translate(-2px, -1px) rotate(1deg);
          }
          90% {
            transform: translate(2px, 1px) rotate(0deg);
          }
          100% {
            transform: translate(1px, -2px) rotate(-1deg);
          }
        }

        @keyframes lf {
          0% {
            left: 200%;
          }
          100% {
            left: -200%;
            opacity: 0;
          }
        }
        @keyframes lf2 {
          0% {
            left: 200%;
          }
          100% {
            left: -200%;
            opacity: 0;
          }
        }
        @keyframes lf3 {
          0% {
            left: 200%;
          }
          100% {
            left: -100%;
            opacity: 0;
          }
        }
        @keyframes lf4 {
          0% {
            left: 200%;
          }
          100% {
            left: -100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
