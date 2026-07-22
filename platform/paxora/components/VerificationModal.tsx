'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Camera, Check, X, CreditCard, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { verificationApi } from '@/lib/api';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function VerificationModal({ onClose, onSuccess }: Props) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ fullName: '', documentType: 'id_card', documentNumber: '' });
    const [cameraActive, setCameraActive] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await verificationApi.submit(formData);
            onSuccess();
        } catch (e) {
            alert('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const startCamera = () => {
        setCameraActive(true);
        // Simulate camera initialization
        setTimeout(() => {
            // Fake scan
            setTimeout(() => {
                setScanned(true);
                setCameraActive(false);
            }, 3000);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-surface w-full max-w-md rounded-3xl border border-border-light overflow-hidden shadow-2xl">
                {step === 1 && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Identity Verification</h2>
                        <p className="text-muted-foreground mb-8">We need to verify your identity before you can access loan features. This process takes less than 2 minutes.</p>
                        <Button onClick={() => setStep(2)} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-12 rounded-xl">
                            Start Verification
                        </Button>
                        <button onClick={onClose} className="mt-4 text-muted-foreground hover:text-foreground text-sm">Cancel</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Personal Details</h2>
                            <div className="text-xs font-bold bg-surface-hover px-2 py-1 rounded">Step 1/2</div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Full Legal Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Document Type</label>
                                <select
                                    value={formData.documentType}
                                    onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none"
                                >
                                    <option value="id_card">National ID Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="license">Driver's License</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Document Number</label>
                                <input
                                    type="text"
                                    value={formData.documentNumber}
                                    onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                                    className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary outline-none"
                                    placeholder="A12345678"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => setStep(3)}
                            disabled={!formData.fullName || !formData.documentNumber}
                            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-12 rounded-xl"
                        >
                            Next: Scan Document
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Scan Document</h2>
                            <div className="text-xs font-bold bg-surface-hover px-2 py-1 rounded">Step 2/2</div>
                        </div>

                        <div className="aspect-[4/3] bg-background rounded-2xl mb-6 relative overflow-hidden border border-border flex items-center justify-center">
                            {!cameraActive && !scanned && (
                                <div className="text-center">
                                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground text-sm">Front of ID</p>
                                </div>
                            )}

                            {cameraActive && (
                                <div className="absolute inset-0 bg-surface flex items-center justify-center">
                                    <div className="w-full h-full absolute inset-0 bg-[url('https://media.istockphoto.com/id/1156525659/vector/camera-focus-screen-of-viewfinder-ui-vector-design.jpg?s=612x612&w=0&k=20&c=g-w_uS3sX9UqO4B8o7u7d8x5rq_2g_x-w_uS3sX9U')] bg-cover opacity-20 animate-pulse"></div>
                                    <ScanLine className="w-24 h-24 text-primary animate-bounce relative z-10" />
                                    <div className="absolute bottom-4 text-primary text-sm font-medium animate-pulse">Scanning...</div>
                                </div>
                            )}

                            {scanned && (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                    <Check className="w-16 h-16 text-primary" />
                                </div>
                            )}
                        </div>

                        {!cameraActive && !scanned && (
                            <Button onClick={startCamera} className="w-full bg-surface-hover hover:bg-surface-hover text-foreground font-bold h-12 rounded-xl">
                                <Camera className="w-4 h-4 mr-2" /> Start Camera
                            </Button>
                        )}

                        {scanned && (
                            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-12 rounded-xl">
                                {loading ? 'Submitting...' : 'Submit Verification'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
