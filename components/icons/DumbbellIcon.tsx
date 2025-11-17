import React from 'react';

const DumbbellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={className}
    >
        <path d="M14.4 14.4 9.6 9.6"></path>
        <path d="M18.657 5.343a2 2 0 1 0-2.828-2.828l-1.415 1.414a2 2 0 1 0 2.828 2.828l1.415-1.414z"></path>
        <path d="m5.343 18.657a2 2 0 1 0 2.828 2.828l1.415-1.414a2 2 0 1 0-2.828-2.828l-1.415 1.414z"></path>
        <path d="M12 12 7.757 7.757a2 2 0 1 0-2.828 2.828L9.172 14.83a2 2 0 1 0 2.828-2.828L12 12z"></path>
        <path d="M12 12l4.243 4.243a2 2 0 1 0 2.828-2.828L14.828 9.172a2 2 0 1 0-2.828 2.828L12 12z"></path>
    </svg>
);

export default DumbbellIcon;