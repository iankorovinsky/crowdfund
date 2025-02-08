"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(100).fill(1);
  const cols = new Array(60).fill(1);

  const colors = useMemo(
    () => [
      "--sky-300",
      "--blue-300",
      "--sky-400",
      "--blue-400",
      "--cyan-300",
      "--indigo-300",
      "--cyan-400",
      "--indigo-400",
    ],
    [],
  );

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const grid = useMemo(() => {
    return rows.map((_, i) => (
      <motion.div
        key={`row${i}`}
        className="w-16 h-8 border-l border-slate-700 relative"
        initial={false}
      >
        {cols.map((_, j) => (
          <motion.div
            key={`col${j}`}
            className="w-16 h-8 border-r border-t border-slate-700 relative"
            initial={false}
            whileHover={{
              backgroundColor: `var(${getRandomColor()})`,
              transition: { duration: 0 },
            }}
          >
            {j % 2 === 0 && i % 2 === 0 && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-700 stroke-[1px] pointer-events-none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
            )}
          </motion.div>
        ))}
      </motion.div>
    ));
  }, []);

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "fixed left-1/2 top-1/2 flex w-[250%] h-[250%] z-0",
        className,
      )}
      {...rest}
    >
      {grid}
    </div>
  );
};

// Memoize the entire component
export const Boxes = React.memo(BoxesCore);
