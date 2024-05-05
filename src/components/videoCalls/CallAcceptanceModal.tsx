import React from 'react';

const CallAcceptanceModal = ({ onAccept, onDecline }) => {
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'white', padding: '20px', border: '1px solid black' }}>
            <h1>Incoming Call</h1>
            <button onClick={onAccept}>Accept</button>
            <button onClick={onDecline}>Decline</button>
        </div>
    );
};

export default CallAcceptanceModal;