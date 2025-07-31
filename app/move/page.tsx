
// pages/index.js
"use client";
import { useState, useRef } from 'react';
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import WalletBackground from './components/background';
import { sha3_256 } from 'js-sha3';

// Helper function to convert Uint8Array to Hex string
const toHexString = (byteArray: Uint8Array) => {
  return '0x' + Array.from(byteArray, byte => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
};

const MovePage = () => {
  const [inputText, setInputText] = useState('move');
  const [moveAddress, setMoveAddress] = useState('0x5f7e...3e2a');
  const [moveAddressPredict, setMoveAddressPredict] = useState('0x5f7e...3e2a');
  const [privateKey, setPrivateKey] = useState('0x12...ab');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mode, setMode] = useState<'predict' | 'generate'>('generate');
  const [error, setError] = useState<string | null>(null);
  const [seedtext, setSeedtext] = useState('');
  const [privatekeyGuess, setPrivatekeyGuess] = useState('');
  const isPredictingRef = useRef(isPredicting);

  const handleWalletClick = (address: string) => {
    setMoveAddressPredict(address);
  }
  isPredictingRef.current = isPredicting;

  const predictWallet = (duration: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?`~';
    const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));

    let timeElapsed = 0;
    const interval = 13.7;

    const timer = setInterval(() => {
      const getRandomLength = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

      const randomText = Array.from({ length: getRandomLength(1, 1370) }, randomChar).join('');
      setInputText(randomText);
      generateWallet(randomText);

      timeElapsed += interval;

      if (timeElapsed >= duration) {
        clearInterval(timer);
      }
    }, interval);
  };

  const guessWallet = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?`~';

    const randomChar = () =>
      characters.charAt(Math.floor(Math.random() * characters.length));
    const getRandomLength = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let found = false;
    setIsPredicting(true);
    isPredictingRef.current = true;

    try {
      while (!found && isPredictingRef.current) {
        const randomText = Array.from(
          { length: getRandomLength(1, 1370) },
          randomChar
        ).join('');

        const moveAddressGuessed = generateWalletGuess(randomText);
        setSeedtext(randomText);

        if (moveAddressGuessed === moveAddressPredict) {
          found = true;
        }

        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } finally {
      setIsPredicting(false);
      isPredictingRef.current = false;
    }
  };


  const handleStopPrediction = () => {
    setIsPredicting(false);
  };


  const generateWalletGuess = (text: string) => {
    const hash = sha3_256.create();
    hash.update(text);
    const privateKeyBytes = new Uint8Array(hash.arrayBuffer());
    const privateKey = new Ed25519PrivateKey(privateKeyBytes);
    const account = Account.fromPrivateKey({privateKey});
    setPrivatekeyGuess(toHexString(privateKey.toUint8Array()));
    return account.accountAddress.toString();
  };


  const generateWallet = (text: string) => {
    const hash = sha3_256.create();
    hash.update(text);
    const privateKeyBytes = new Uint8Array(hash.arrayBuffer());
    const privateKey = new Ed25519PrivateKey(privateKeyBytes);
    const account = Account.fromPrivateKey({privateKey});
    setPrivateKey(toHexString(privateKey.toUint8Array()));
    setMoveAddress(account.accountAddress.toString());
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (text) {
      generateWallet(text);
    } else {
      setMoveAddress('');
      setPrivateKey('');
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const address = event.target.value;
    setMoveAddressPredict(address);
    setError(null);

    if (address.trim() === "") {
      setError("");
      return;
    }

    if (address.length >= 66) {
        setMoveAddressPredict(address);
    } else {
      setError("This is not a valid Move Address.");
    }
  };

  return (
<div className={`min-h-screen flex items-center font-hacker justify-center ${mode === 'predict' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
<div className="absolute w-full h-full z-0">
      <WalletBackground onWalletClick={handleWalletClick} />
  </div>
      <div className={`flex flex-col shadow-lg rounded-lg p-7 w-full max-w-md items-center relative ${mode === 'predict' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col items-center mb-3">
          <Image className='mb-3' src="/move.png" alt="Blockchain Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-center mb-3 leading-relaxed md:text-base">
            <span className="mx-1">create</span>
            <span className={`font-bold ${mode === 'predict' ? 'text-blue-400' : 'text-blue-700'}`}>wallets</span>
            <span className="mx-1">from text</span>
          </h1>
        </div>

          <div className="flex items-center">
            <Switch
              checked={mode === 'predict'}
              onChange={(checked) => setMode(checked ? 'predict' : 'generate')}
              className={`${mode === 'predict' ? 'bg-gray-700' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-12 transition-colors ease-in-out`}
            >
              <span
                className={`${
                  mode === 'predict' ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 bg-white rounded-full transform transition ease-in-out`}
              />
            </Switch>
          </div>
          {mode === 'generate' ? (

      <>
        <div className="w-full mb-4">
        <label className={`block text-sm font-medium ${mode === 'generate' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>
          Insert Text:
        </label>
        <textarea
                className={`border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 ${mode === 'generate' ? ' text-black' : 'text-white bg-gray-700'}`}
                value={inputText}
            onChange={handleInputChange}
            placeholder="move"
          />
        </div>

        <button
          className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
          onClick={() => predictWallet(3710)}
          >
          {isPredicting ? 'GENERATING...' : 'GENERATE WALLET'}

        </button>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">Move Address:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(moveAddress)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={moveAddress}
            />

            <a
              className="p-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              href={`https://explorer.aptoslabs.com/account/${moveAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/globe.svg" alt="Aptos Explorer" width={26} height={26} />
            </a>
          </div>
        </div>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">Private Key:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(privateKey)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={showPrivateKey ? privateKey : '*'.repeat(privateKey.length)}
            />
            <button
              className="p-1 rounded-xl hover:bg-gray-300 transition duration-200 active:scale-90 focus:outline-none"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? <FaEye className="text-black w-6 h-6" /> : <FaEyeSlash className="text-black w-6 h-6" />}
            </button>
          </div>
        </div>
      </>
        ) : (
      <>
        {/* Predict Mode */}
        <div className="w-full mb-3">
          <label className={`block text-sm font-medium ${mode === 'predict' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>Move Address:</label>
          <textarea
            className={`border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 ${mode === 'predict' ? 'bg-gray-700 text-white' : 'text-black'}`}
            value={moveAddressPredict}
            onChange={handleAddressChange}
            placeholder="Enter Move Address"
            disabled={isPredicting}
          />
        </div>

        <div className=" mb-3 h-3">
          {error && <p className=" text-sm text-red-700 font-semibold">{error}</p>}
        </div>

        <button
            className="bg-gradient-to-r from-purple-700 via-pink-300 to-red-300 text-black py-2 px-4 rounded-2xl mt-2
                      shadow-lg hover:from-purple-300 hover:via-pink-100 hover:to-red-300
                      active:scale-90 transition-transform duration-300 w-64 font-bold text-lg"
            onClick={() => {
              if (isPredicting) {
                handleStopPrediction();
              } else {
                setIsPredicting(true);
                guessWallet();
              }
            }}
          >
          {isPredicting ? "570P" : "H4CK W41137"}
        </button>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className={`text-sm font-medium ${mode === 'predict' ? 'text-gray-200' : 'text-gray-700'}`}>Seed Text:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(seedtext)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className={`border border-gray-300 rounded-lg p-3 w-full ${mode === 'predict' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
              readOnly
              value={seedtext}
            />
          </div>
        </div>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className={`text-sm font-medium ${mode === 'predict' ? 'text-gray-200' : 'text-gray-700'}`}>Private Key:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(privatekeyGuess)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className={`border border-gray-300 rounded-lg p-3 w-full ${mode === 'predict' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
              readOnly
              value={showPrivateKey ? privatekeyGuess : '*'.repeat(privatekeyGuess.length)}
            />
            <button
              className={`p-1 rounded-xl hover:bg-gray-300 ${mode === 'predict' ? 'text-gray-200' : 'text-gray-700'} dark:hover:bg-gray-600 dark:text-gray-300 transition duration-200 active:scale-90 focus:outline-none`}
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? (
                <FaEye className={mode === 'predict' ? 'text-gray-200' : 'text-gray-700'} />
              ) : (
                <FaEyeSlash className={mode === 'predict' ? 'text-gray-200' : 'text-gray-700'} />
              )}
            </button>

          </div>
        </div>
      </>
        )}
        <div className="flex flex-col items-center mt-3 text-center">
          <div
            className="flex items-center space-x-1 rounded-lg p-1 cursor-pointer transition duration-200"
            onClick={() => copyToClipboard("0x3d90Eb79C1e753Ca51D1447791C07e7CcC219e5C")}
          >
            <span className="text-gray-700 text-xs transition duration-200 active:scale-95">0x3d90Eb79C1e753Ca51D1447791C07e7CcC219e5C</span>
            <button
              className="p-2 rounded-lg transition duration-200 active:scale-90 focus:outline-none"
              aria-label="Copy to clipboard"
            >
              <Image src="/copy.svg" alt="Copy" width={12} height={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovePage;
