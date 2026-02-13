import React, { useState } from 'react';
import { ArrowLeft, Import, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { KeyringController } from '../lib/keyring';
import logo from '../res/logo.png';
import banner from '../res/banner.png';

function Welcome({ onComplete }) {
    const [mnemonic, setMnemonic] = useState('');
    const [mode, setMode] = useState('home');
    const [error, setError] = useState('');

    const handleCreate = () => {
        const newMnemonic = KeyringController.createMnemonic();
        setMnemonic(newMnemonic);
        setMode('create-step-2');
    };

    const confirmCreate = async () => {
        const keyring = new KeyringController();
        await keyring.importMnemonic(mnemonic);
        await keyring.save('password');
        onComplete();
    };

    const handleImport = async () => {
        if (!mnemonic) {
            setError('Please enter a mnemonic or private key.');
            return;
        }

        try {
            const keyring = new KeyringController();
            if (mnemonic.trim().split(' ').length > 1) {
                await keyring.importMnemonic(mnemonic);
            } else {
                await keyring.importPrivateKey(mnemonic);
            }
            await keyring.save('password');
            onComplete();
        } catch (e) {
            setError(e.message);
        }
    };

    if (mode === 'home') {
        return (
            <div className="page">
                <Card className="col center gap-12" style={{ padding: 14 }}>
                    <img src={banner} alt="Agent Pocket Banner" style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(255,255,255,.35)' }} />
                    <div className="logo-box">
                        <img src={logo} alt="Agent Pocket" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <h2 style={{ fontSize: 21 }}>Agent Pocket</h2>
                    <p className="subtitle" style={{ textAlign: 'center' }}>BNB-friendly wallet with on-chain utility and extension workflows.</p>
                </Card>

                <Card variant="inset" className="col gap-8" style={{ padding: 14 }}>
                    <p className="section-title">Highlights</p>
                    <p className="subtitle row gap-8"><Sparkles size={13} /> Lightweight extension runtime</p>
                    <p className="subtitle row gap-8"><ShieldCheck size={13} /> Local key storage and signing</p>
                </Card>

                <div className="col gap-10" style={{ marginTop: 'auto' }}>
                    <Button onClick={handleCreate}>Create New Wallet</Button>
                    <Button onClick={() => { setError(''); setMnemonic(''); setMode('import'); }} variant="ghost">
                        <Import size={14} /> Import Wallet
                    </Button>
                </div>
            </div>
        );
    }

    if (mode === 'create-step-2') {
        return (
            <div className="page">
                <div className="row-between">
                    <Button onClick={() => setMode('home')} className="icon-btn" variant="ghost" aria-label="Back">
                        <ArrowLeft size={16} />
                    </Button>
                    <p className="section-title">Secure Backup</p>
                    <div style={{ width: 40 }} />
                </div>

                <Card className="col gap-10">
                    <h3>Backup Your Recovery Phrase</h3>
                    <Card variant="inset" style={{ padding: 12 }}>
                        <p className="mono" style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>{mnemonic}</p>
                    </Card>
                    <p className="subtitle">Write these words offline and never share them with anyone.</p>
                </Card>

                <Button onClick={confirmCreate} style={{ marginTop: 'auto' }}>
                    I Have Saved It
                </Button>
            </div>
        );
    }

    if (mode === 'import') {
        return (
            <div className="page">
                <div className="row-between">
                    <Button onClick={() => setMode('home')} className="icon-btn" variant="ghost" aria-label="Back">
                        <ArrowLeft size={16} />
                    </Button>
                    <p className="section-title">Import Wallet</p>
                    <div style={{ width: 40 }} />
                </div>

                <Card className="col gap-12">
                    <p className="subtitle">Paste a 12-word mnemonic phrase or a private key.</p>
                    <textarea
                        className="neu-textarea"
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        placeholder="Enter mnemonic phrase or private key"
                    />
                    {error && <div className="status error">{error}</div>}
                </Card>

                <div className="row gap-10" style={{ marginTop: 'auto' }}>
                    <Button onClick={() => setMode('home')} variant="ghost">Cancel</Button>
                    <Button onClick={handleImport}>Import</Button>
                </div>
            </div>
        );
    }

    return null;
}

export default Welcome;
