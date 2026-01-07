import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, containerId = 'portal-root' }) => {
    const elRef = useRef(null);

    if (!elRef.current) {
        elRef.current = document.createElement('div');
    }

    useEffect(() => {
        const portalRoot = document.getElementById(containerId);
        const el = elRef.current;

        if (!portalRoot) {
            
            return;
        }

        portalRoot.appendChild(el);

        return () => {
            portalRoot.removeChild(el);
        };
    }, [containerId]);

    return createPortal(children, elRef.current);
};

export default Portal;
