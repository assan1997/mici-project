'use client'

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type Tab = {
  id: number;
  numberOfElement?: number;
  label: string;
  content: React.ReactNode;
};

type BaseTabsProps = {
  tabs: Tab[];
  withLine?: boolean;
  otherWithLine?: boolean;
  headClass: string;
  animateButtonTabClass: string;
  contentClass: string;
  labelTextColor?: string;
  layoutId?: string;
  isSticky?: boolean;
  isStickyValueTop?: string;
} & React.ComponentPropsWithRef<'div'>;

const BaseTabs = React.forwardRef<HTMLDivElement, BaseTabsProps>(
  ({
    tabs,
    withLine,
    headClass,
    animateButtonTabClass,
    contentClass, otherWithLine,
    labelTextColor,
    isSticky,
    isStickyValueTop,
    layoutId = "active_pill"
  }, ref) => {
    const [activeTab, setActiveTab] = React.useState(1);
    return (
      <div ref={ref}>
        <div className={`${withLine && 'relative'} ${otherWithLine && 'relative'} ${isSticky ? `sticky ${isStickyValueTop} bg-white z-[123456789]` : ''}`}>
          {withLine ? (
            <div
              className={`absolute bottom-0 h-[1px] w-full bg-vermilion-50`}
            />
          ) : (
            <>
              {otherWithLine && (
                <div
                  className={`absolute bottom-0 h-[1px] w-full bg-majorelle-blue-50`}
                />
              )}
            </>
          )}
          <div className={`${headClass} `}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={
                  'relative px-[12px] py-[8px] transition focus:outline-none focus-visible:outline'
                }
                onClick={() => setActiveTab(tab.id)}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId={layoutId}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className={animateButtonTabClass}
                  />
                )}
                <div
                  className={`${tab.numberOfElement && 'flex items-center gap-[8px]'
                    }`}
                >
                  <span
                    className={`${activeTab === tab.id
                        ? `${labelTextColor ? labelTextColor : "text-grayscale-900"} 
                        font-[500]
                        `
                        : 'text-grayscale-700 font-[500]'
                      } relative z-20 text-[14px] leading-[24px] font-poppins whitespace-nowrap transition-all duration-300 ease-out 
                    ${otherWithLine && "pl-[.4rem]"}`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className={contentClass}
          >
            {tabs.map((tab) => {
              return (
                activeTab === tab.id && (
                  <React.Fragment key={tab.id}>{tab.content}</React.Fragment>
                )
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
);

BaseTabs.displayName = 'BaseTabs';

export { BaseTabs };