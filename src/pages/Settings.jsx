import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Radio, ShieldAlert, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { KeyringController } from '../lib/keyring';

function Settings({ onBack, networkController }) {
    const [rpcUrl, setRpcUrl] = useState('');
    const [networkKey, setNetworkKey] = useState('bsc');
    const [relayUrl, setRelayUrl] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    React.useEffect(() => {
        const checkStatus = () => {
            chrome.runtime.sendMessage({ type: 'GET_RELAY_STATUS' }, (response) => {
                if (response) {
                    setIsConnected(response.connected);
                }
            });
        };

        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const toggleConnection = () => {
        chrome.runtime.sendMessage({ type: 'TOGGLE_RELAY' }, (response) => {
            if (response) setIsConnected(response.connected);
        });
    };

    React.useEffect(() => {
        chrome.storage.local.get('relayUrl').then((data) => {
            if (data.relayUrl) setRelayUrl(data.relayUrl);
        });
    }, []);

    React.useEffect(() => {
        if (relayUrl) {
            chrome.storage.local.set({ relayUrl });
            chrome.runtime.sendMessage({ type: 'RELAY_CONFIG_UPDATED', url: relayUrl });
        }
    }, [relayUrl]);

    const [whitelist, setWhitelist] = useState([]);
    const [newWhitelistKey, setNewWhitelistKey] = useState('');

    React.useEffect(() => {
        chrome.storage.local.get('whitelist').then((data) => {
            if (data.whitelist) setWhitelist(data.whitelist);
        });
    }, []);

    const [autoConfirm, setAutoConfirm] = useState(false);

    React.useEffect(() => {
        chrome.storage.local.get('autoConfirm').then((data) => {
            setAutoConfirm(Boolean(data.autoConfirm));
        });
    }, []);

    const toggleAutoConfirm = () => {
        const newValue = !autoConfirm;
        setAutoConfirm(newValue);
        chrome.storage.local.set({ autoConfirm: newValue });
    };

    const addWhitelistKey = () => {
        if (!newWhitelistKey) return;
        const updated = [...whitelist, newWhitelistKey];
        setWhitelist(updated);
        chrome.storage.local.set({ whitelist: updated });
        setNewWhitelistKey('');
    };

    const removeWhitelistKey = (key) => {
        const updated = whitelist.filter((k) => k !== key);
        setWhitelist(updated);
        chrome.storage.local.set({ whitelist: updated });
    };

    const [isRevealed, setIsRevealed] = useState(false);
    const [privateKey, setPrivateKey] = useState('');
    const [copyMsg, setCopyMsg] = useState('');

    const handleAddRpc = async () => {
        if (!rpcUrl) return;
        try {
            await networkController.addCustomRpc(networkKey, rpcUrl);
            setMsg({ text: 'RPC updated successfully.', type: 'success' });
            setRpcUrl('');
            setTimeout(() => setMsg({ text: '', type: '' }), 3000);
        } catch (e) {
            setMsg({ text: `Error: ${e.message}`, type: 'error' });
        }
    };

    const handleRevealKey = async () => {
        try {
            const keyring = new KeyringController();
            const isAuthenticated = await keyring.load('password');

            if (isAuthenticated && keyring.wallet) {
                setPrivateKey(keyring.wallet.privateKey);
                setIsRevealed(true);
            } else {
                setMsg({ text: 'Failed to load wallet.', type: 'error' });
            }
        } catch (e) {
            setMsg({ text: `Error: ${e.message}`, type: 'error' });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(privateKey);
        setCopyMsg('Copied');
        setTimeout(() => setCopyMsg(''), 2000);
    };

    return (
        <div className="page page-scroll">
            <div className="row gap-10">
                <Button onClick={onBack} className="icon-btn" variant="ghost" aria-label="Back">
                    <ArrowLeft size={16} />
                </Button>
                <div className="col">
                    <h2 style={{ fontSize: 22 }}>Settings</h2>
                    <p className="subtitle">Manage network, relay and security preferences.</p>
                </div>
            </div>

            <Card className="col gap-12">
                <div className="row gap-8"><Radio size={16} /><h3>Network & Relay</h3></div>
                <div className="col gap-8">
                    <p className="section-title">Network</p>
                    <select className="neu-select" value={networkKey} onChange={(e) => setNetworkKey(e.target.value)}>
                        <option value="bsc">Binance Smart Chain (BSC)</option>
                        <option value="eth">Ethereum Mainnet</option>
                        <option value="arb">Arbitrum One</option>
                        <option value="pol">Polygon (Matic)</option>
                    </select>
                </div>

                <div className="col gap-8">
                    <p className="section-title">RPC URL</p>
                    <Input value={rpcUrl} onChange={(e) => setRpcUrl(e.target.value)} placeholder="https://rpc.example.com" />
                </div>

                <div className="col gap-8">
                    <div className="row-between">
                        <p className="section-title">Relay WebSocket</p>
                        <span className="subtitle" style={{ color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <div className="row gap-8">
                        <Input value={relayUrl} onChange={(e) => setRelayUrl(e.target.value)} placeholder="ws://localhost:8080" />
                        <Button onClick={toggleConnection} size="sm" variant={isConnected ? 'danger' : 'ghost'} style={{ width: 'auto', minWidth: 88 }}>
                            {isConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                    </div>
                </div>

                <Button onClick={handleAddRpc} disabled={!rpcUrl}>Save Network Config</Button>
                {msg.text && <div className={`status ${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}
            </Card>

            <Card className="col gap-12">
                <p className="row gap-8"><ShieldAlert size={16} /><strong>Trusted Apps</strong></p>
                <div className="row gap-8">
                    <Input value={newWhitelistKey} onChange={(e) => setNewWhitelistKey(e.target.value)} placeholder="Add Ed25519 public key" />
                    <Button onClick={addWhitelistKey} size="sm" style={{ width: 'auto' }}>Add</Button>
                </div>

                {whitelist.length > 0 && (
                    <div className="col gap-8">
                        {whitelist.map((key) => (
                            <Card key={key} variant="inset" className="row-between" style={{ padding: '10px 12px' }}>
                                <span className="mono" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{key}</span>
                                <Button onClick={() => removeWhitelistKey(key)} variant="danger" size="sm" style={{ width: 'auto', minWidth: 0, padding: 8 }}>
                                    <Trash2 size={12} />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                <Card variant="inset" className="row-between" style={{ padding: 12 }}>
                    <div className="col gap-8">
                        <strong style={{ fontSize: 12 }}>Auto-Confirm Whitelisted</strong>
                        <p className="subtitle">Skip popup for trusted app signatures.</p>
                    </div>
                    <Button onClick={toggleAutoConfirm} size="sm" variant={autoConfirm ? 'primary' : 'ghost'} style={{ width: 'auto' }}>
                        {autoConfirm ? 'On' : 'Off'}
                    </Button>
                </Card>
            </Card>

            <Card className="col gap-12" style={isRevealed ? { border: '1px solid rgba(193, 73, 32, 0.5)' } : undefined}>
                <p className="row gap-8"><KeyRound size={16} /><strong>Private Key</strong></p>

                {!isRevealed ? (
                    <>
                        <p className="subtitle">Only reveal in a secure environment. Never share this key.</p>
                        <Button onClick={handleRevealKey} variant="danger">Reveal Private Key</Button>
                    </>
                ) : (
                    <>
                        <Card variant="inset" style={{ padding: 12 }}>
                            <p className="mono" style={{ fontSize: 11, wordBreak: 'break-all', userSelect: 'text' }}>{privateKey}</p>
                        </Card>
                        <div className="row gap-8">
                            <Button onClick={copyToClipboard}>{copyMsg || 'Copy'}</Button>
                            <Button onClick={() => { setIsRevealed(false); setPrivateKey(''); }} variant="ghost">Hide</Button>
                        </div>
                    </>
                )}
            </Card>

            <p className="subtitle" style={{ textAlign: 'center', paddingBottom: 4 }}>Meme Wallet v1.0.0</p>
        </div>
    );
}

export default Settings;