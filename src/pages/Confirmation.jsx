import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { ethers } from 'ethers';

function Confirmation() {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chrome.storage.local.get('pendingRequest').then((data) => {
            if (data.pendingRequest) {
                setRequest(data.pendingRequest);
            }
            setLoading(false);
        });
    }, []);

    const handleConfirm = () => {
        if (!request) return;
        chrome.runtime.sendMessage({ type: 'CONFIRM_TX', id: request.id }, () => {
            window.close();
        });
    };

    const handleReject = () => {
        if (!request) return;
        chrome.runtime.sendMessage({ type: 'REJECT_TX', id: request.id }, () => {
            window.close();
        });
    };

    if (loading) return <div className="page"><Card>Loading request...</Card></div>;
    if (!request) return <div className="page"><Card>No pending request found.</Card></div>;

    const { params, method } = request;
    const normalizedMethod = String(method || '').toLowerCase();
    const isMessageSignature = ['sign_message', 'personal_sign', 'eth_sign', 'eth_signtypeddata', 'eth_signtypeddata_v4']
        .some((keyword) => normalizedMethod.includes(keyword));
    const tx = params[0] || {};
    const to = tx.to || 'Unknown';
    const value = tx.value ? ethers.formatEther(tx.value) : '0';
    const chainId = tx.chainId || 'Unknown';
    const messagePayload = typeof params?.[0] === 'string'
        ? params[0]
        : JSON.stringify(params?.[0] ?? params ?? '', null, 2);

    return (
        <div className={`page confirmation-page ${isMessageSignature ? 'confirmation-message' : ''}`}>
            <h2 style={{ textAlign: 'center', fontSize: 21 }}>Confirm Request</h2>

            <Card className="col gap-12" style={{ flex: 1, minHeight: 0 }}>
                <Card variant="inset" style={{ padding: 10, textAlign: 'center' }}>
                    <span className="section-title" style={{ color: 'var(--text-secondary)' }}>{method.replace('_', ' ')}</span>
                </Card>

                {isMessageSignature ? (
                    <>
                        <div className="col gap-8">
                            <p className="section-title">Message</p>
                            <Card variant="inset" className="confirmation-message-box page-scroll" style={{ padding: 10 }}>
                                <p className="mono" style={{ fontSize: 11, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                    {messagePayload}
                                </p>
                            </Card>
                        </div>
                        <p className="subtitle" style={{ fontSize: 11 }}>
                            Only sign messages you trust. Signature can be used to verify wallet ownership.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="col gap-8">
                            <p className="section-title">Chain ID</p>
                            <strong>{chainId}</strong>
                        </div>

                        <div className="col gap-8">
                            <p className="section-title">To</p>
                            <Card variant="inset" style={{ padding: 10 }}>
                                <p className="mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{to}</p>
                            </Card>
                        </div>

                        <div className="col gap-8">
                            <p className="section-title">Value</p>
                            <div className="big-balance" style={{ fontSize: 28 }}>{value} <span style={{ fontSize: 14 }}>ETH</span></div>
                        </div>

                        {tx.data && tx.data !== '0x' && (
                            <div className="col gap-8">
                                <p className="section-title">Data</p>
                                <Card variant="inset" className="page-scroll" style={{ maxHeight: 90, padding: 10 }}>
                                    <p className="mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{tx.data}</p>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </Card>

            <div className="row gap-10 confirmation-actions">
                <Button onClick={handleReject} variant="danger">
                    <XCircle size={14} /> Reject
                </Button>
                <Button onClick={handleConfirm}>
                    <CheckCircle2 size={14} /> Confirm
                </Button>
            </div>
        </div>
    );
}

export default Confirmation;
