import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Edges, Text } from '@react-three/drei';
import * as THREE from 'three';

// 3D Shield Component
const Shield = ({ status }) => {
    const meshRef = useRef();
    const edgesRef = useRef();

    const { color, emissive } = useMemo(() => {
        switch (status) {
            case 'secure':
                return { color: '#059669', emissive: '#059669' }; // Emerald
            case 'warning':
                return { color: '#F59E0B', emissive: '#F59E0B' }; // Amber
            case 'danger':
                return { color: '#DC2626', emissive: '#DC2626' }; // Red
            default:
                return { color: '#4B5563', emissive: '#374151' }; // Gray
        }
    }, [status]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.002;
            const time = state.clock.getElapsedTime();
            meshRef.current.position.y = Math.sin(time) * 0.1;
        }
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <Icosahedron args={[1.5, 1]} />
                <meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={status !== 'scanning' ? 0.8 : 0.2}
                    metalness={0.8}
                    roughness={0.2}
                    transparent
                    opacity={0.6}
                />
                <Edges ref={edgesRef} scale={1.001}>
                    <lineBasicMaterial color={color} toneMapped={false} />
                </Edges>
            </mesh>
        </group>
    );
};

// Main App Component
const App = () => {
    const [result, setResult] = useState({ status: 'scanning', message: 'Analyzing current page...', url: '', aiScore: 0, quantumVerified: false });
    const [tabUrl, setTabUrl] = useState('');

    useEffect(() => {
        // Get current tab info
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0]?.url;
            if (url) {
                const formattedUrl = new URL(url).hostname;
                setTabUrl(formattedUrl);
                // Check storage for cached result
                chrome.storage.local.get([url], (data) => {
                    if (data[url]) {
                        setResult(data[url]);
                    } else {
                        // Request a new scan
                        chrome.runtime.sendMessage({ type: 'SCAN_PAGE', tabId: tabs[0].id });
                    }
                });
            } else {
                setResult({ status: 'idle', message: 'No active page to scan.', url: '', aiScore: 0, quantumVerified: false });
            }
        });

        // Listen for updates from the background script
        const listener = (message) => {
            if (message.type === 'SCAN_RESULT') {
                setResult(message.payload);
            }
        };
        chrome.runtime.onMessage.addListener(listener);

        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    const getStatusText = () => {
        switch (result.status) {
            case 'secure': return 'SECURE';
            case 'warning': return 'CAUTION ADVISED';
            case 'danger': return 'THREAT DETECTED';
            default: return 'ANALYZING';
        }
    };

    const getStatusColor = () => {
        switch (result.status) {
            case 'secure': return 'text-emerald-400';
            case 'warning': return 'text-amber-400';
            case 'danger': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="w-full h-full bg-[#111827] text-white flex flex-col">
            <header className="p-4 text-center border-b border-gray-700">
                <h1 className="text-xl font-bold tracking-wider">PhishGuard<span className="text-cyan-400">AI</span></h1>
                <p className="text-sm text-gray-400 truncate">{tabUrl || 'No active tab'}</p>
            </header>

            <div className="flex-grow h-64">
                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Shield status={result.status} />
                    <Text
                        position={[0, 0, 0]}
                        fontSize={0.4}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/Inter-Bold.woff"
                    >
                        {getStatusText()}
                    </Text>
                </Canvas>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-t-2xl flex-shrink-0">
                <div className="text-center mb-4">
                    <h2 className={`text-lg font-semibold ${getStatusColor()}`}>{result.message}</h2>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">AI Risk Score:</span>
                        <span className={`font-mono px-2 py-1 rounded ${getStatusColor()} bg-gray-800`}>
                            {result.aiScore.toFixed(2)}%
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Quantum Verification:</span>
                        <span className={`font-semibold ${result.quantumVerified ? 'text-cyan-400' : 'text-gray-500'}`}>
                            {result.quantumVerified ? 'VERIFIED' : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
