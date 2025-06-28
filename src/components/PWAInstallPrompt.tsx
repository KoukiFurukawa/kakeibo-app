'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    
    let ios, webkit, safari;
    
    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
    
        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
    
            if (outcome === 'accepted') {
                console.log('PWAのインストールが受け入れられました');
            } else {
                console.log('PWAのインストールが却下されました');
            }
    
            setDeferredPrompt(null);
            setIsInstallable(false);
        } catch (error) {
            console.error('PWAインストールエラー:', error);
        }
    };

    useEffect(() => {
        // PWAがすでにインストールされているかチェック
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // iOS Safariでのスタンドアロンモードチェック
        if ((window.navigator as any).standalone === true) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // if (typeof window === 'undefined') return false;

        const ua = window.navigator.userAgent;
        ios = !!ua.match(/iPad|iPhone|iPod/);
        webkit = !!ua.match(/WebKit/);
        safari = !ua.match(/CriOS|FxiOS|OPiOS|mercury/);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    if (isInstalled) {
        return null; // すでにインストール済みの場合は何も表示しない
    }

    if (ios && webkit && safari) {
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">アプリをホーム画面に追加</h3>
                        <p className="text-xs mt-1 opacity-90">
                            共有ボタン → 「ホーム画面に追加」をタップ
                        </p>
                    </div>
                    <button
                        onClick={() => setIsInstallable(false)}
                        className="ml-2 text-white hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    if (isInstallable && deferredPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">アプリをインストール</h3>
                        <p className="text-xs mt-1 opacity-90">
                            ホーム画面に追加してより快適に利用できます
                        </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                            インストール
                        </button>
                        <button
                            onClick={() => setIsInstallable(false)}
                            className="text-white hover:text-gray-300 px-2"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
