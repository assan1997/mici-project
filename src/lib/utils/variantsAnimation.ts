export const container = {
    hidden: { opacity: 0,  y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

export const itemContainer = {
    hidden: { y: 40, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};