import React, { useState, useRef } from 'react';
import './DraggablePanel.css';

function DraggablePanel({ title, children, defaultX = 0, defaultY = 0, minWidth = 300, zIndex = 1000 }) {
    const [position, setPosition] = useState({ x: defaultX, y: defaultY });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const panelRef = useRef(null);
    const headerRef = useRef(null);

    const handleMouseDown = (e) => {
        // Only drag from the header
        if (!headerRef.current || !headerRef.current.contains(e.target)) {
            return;
        }

        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const panelStyle = {
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: isDragging ? zIndex + 100 : zIndex,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: `${minWidth}px`,
        minHeight: 'auto',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'default',
    };

    const headerStyle = {
        padding: '12px 16px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0',
        borderRadius: '6px 6px 0 0',
        cursor: 'grab',
        userSelect: 'none',
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    const contentStyle = {
        padding: '16px',
        maxHeight: 'calc(90vh - 60px)',
        overflowY: 'auto',
    };

    return (
        <div ref={panelRef} style={panelStyle}>
            {title && (
                <div ref={headerRef} style={headerStyle} onMouseDown={handleMouseDown}>
                    <span style={{ flex: 1 }}>{title}</span>
                </div>
            )}
            <div style={contentStyle}>
                {children}
            </div>
        </div>
    );
}

export default DraggablePanel;
