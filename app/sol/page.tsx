"use client";
import { useState, useRef } from 'react';
import { keccak256 } from 'js-sha3';
import { Keypair, PublicKey  } from "@solana/web3.js";
import bs58 from "bs58"; // Asegúrate de instalar esta librería
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import WalletBackground from './components/background'; // Asegúrate de importar el componente correctamente

const SOLPage = () => {
  const [inputText, setInputText] = useState('Anatoly');
  const [solAddress, setSolAddress] = useState('');
  const [solAddresspredict, setSolAddresspredict] = useState('CzEuMZSS7eVgRVsAHtJWYU4R3TQ9Ge68ibYYfs3pNuEV');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mode, setMode] = useState<'predict' | 'generate'>('generate');
  const [error, setError] = useState<string | null>(null);
  const [seedtext, setSeedtext] = useState('');
  const [privatekeyGuess, setPrivatekeyGuess] = useState('');
  const isPredictingRef = useRef(isPredicting); // Coloca el hook dentro del componente

  const handleWalletClick = (address: string) => {
    setSolAddresspredict(address);
  }
  isPredictingRef.current = isPredicting;

  const predictWallet = (duration: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?`~';
    const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));
  
    let timeElapsed = 0;
    const interval = 13.7; // Actualizar cada 100ms
  
    const timer = setInterval(() => {
      // Función para generar un número aleatorio dentro de un rango
      const getRandomLength = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
      const randomText = Array.from({ length: getRandomLength(1, 1370) }, randomChar).join('');  // Generar texto aleatorio
      
      setInputText(randomText);  // Actualiza el texto simulado
      generateWallet(randomText);  // Usa la misma lógica para generar wallet
  
      timeElapsed += interval;
  
      if (timeElapsed >= duration) {
        clearInterval(timer);
        // Después de la simulación, puedes hacer algo más si es necesario
      }
    }, interval);
  };

  const guessWallet = async () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?`~';

    const randomChar = () =>
      characters.charAt(Math.floor(Math.random() * characters.length));
    const getRandomLength = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
  
    let found = false; // Bandera para saber si ya coincidimos
    setIsPredicting(true); // Iniciar el proceso de predicción
    isPredictingRef.current = true;

    try {
      while (!found && isPredictingRef.current) {  // Revisar isPredictingRef.current en cada iteración
        // Generar texto aleatorio
        const randomText = Array.from(
          { length: getRandomLength(1, 1370) }, // Limitar a longitudes más razonables
          randomChar
        ).join('');
  
        // Generar dirección basada en randomText
        const solAddressGuessed = generateWalletGuess(randomText);
        setSeedtext(randomText); // Actualizar el texto generado
  
        // Comparar con la predicción
        if (solAddressGuessed === solAddresspredict) {
          found = true; // Coincidencia encontrada
        }
  
        // Esperar brevemente para no bloquear la interfaz
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } finally {
      setIsPredicting(false); // Asegurarse de que el estado se actualiza una vez el ciclo termine
      isPredictingRef.current = false;

    }
  };

  const handleStopPrediction = () => {
    // Detener la predicción
    setIsPredicting(false); // Establecer isPredicting a false para detener el ciclo
  };
  
  const generateWalletGuess = (text: string) => {
    const hashedOutput = keccak256(text); // Hash del texto
    const seed = Uint8Array.from(Buffer.from(hashedOutput, 'hex').slice(0, 32));
    const keypair = Keypair.fromSeed(seed);
  
    setPrivatekeyGuess(bs58.encode(keypair.secretKey)); // Clave privada en formato Base58
    return keypair.publicKey.toBase58();  // Dirección pública
  };
  
  
  
  const generateWallet = (text: string) => {
    const hashedOutput = keccak256(text);  // Hash del texto
    const seed = Uint8Array.from(Buffer.from(hashedOutput, 'hex').slice(0, 32));
    const keypair = Keypair.fromSeed(seed);
  
    setPrivateKey(bs58.encode(keypair.secretKey)); // Clave privada en formato Base58
    setSolAddress(keypair.publicKey.toBase58());  // Dirección pública
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    // Solo generar la wallet si el texto no está vacío
    if (text) {
      generateWallet(text);  // Generar la wallet a partir del texto ingresado
    } else {
      setSolAddress('');  // Limpiar la dirección si no hay texto
      setPrivateKey('');   // Limpiar la clave privada si no hay texto
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  };


  const handleAddressChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const address = event.target.value;
    setSolAddresspredict(address);
    setError(null); // Clear previous error
    if (address.trim() === "") {
      setError("");
      return;
    }
    
    try {
      const publicKey = new PublicKey(address);  
      // Verifica si la dirección es válida en la curva de Solana
      if (PublicKey.isOnCurve(publicKey.toBytes())) {
        setSolAddresspredict(address);
      } else {
        setError("This is not a SOL Address.");
      }
    } catch (error) {
      // Captura el error si la dirección no es válida
      setError("This is not a SOL Address.");

    }
  };

  return (
<div className={`min-h-screen flex items-center font-hacker justify-center ${mode === 'predict' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
<div className="absolute w-full h-full z-0">
      <WalletBackground onWalletClick={handleWalletClick} />
  </div>
      <div className={`flex flex-col shadow-lg rounded-lg p-7 w-full max-w-md items-center relative ${mode === 'predict' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex flex-col items-center mb-3">
          <Image className='mb-3' src="/solana.svg" alt="Solana Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-center mb-3 leading-relaxed md:text-base">
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
  
        {/* Aquí comienza la parte que cambia entre 'generate' y 'predict' */}
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
                placeholder="Anatoly"
              />
            </div>
  
            <div className=" mb-2 h-2"></div>
  
            <button
              className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
              onClick={() => predictWallet(3710)}
            >
              {isPredicting ? 'GENERATING...' : 'GENERATE WALLET'}
            </button>
  
            <div className="w-full mt-7">
              {/* SOL Address */}
              <div className="flex items-center justify-start mb-2">
                <label className={`text-sm font-medium ${mode === 'generate' ? 'text-gray-700' : 'text-gray-200'}`}>SOL Address:</label>
                <button
                  className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
                  onClick={() => copyToClipboard(solAddress)}
                >
                  <Image src="/copy.svg" alt="Copy" width={16} height={16} />
                </button>
              </div>
  
              <div className="flex items-center gap-2 mb-4">
                <textarea
                  className={`border border-gray-300 rounded-lg p-3 w-full ${mode === 'generate' ? 'bg-gray-100 text-black' : 'bg-gray-700 text-white'}`}
                  readOnly
                  value={solAddress}
                />
  
                <a
                  className="p-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
                  href={`https://explorer.solana.com/address/${solAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src="/solscan.svg" alt="Solana Explorer" width={26} height={26} />
                </a>
              </div>
            </div>
  
            {/* Private Key */}
            <div className="w-full mt-6">
              <div className="flex items-center justify-start mb-2">
                <label className={`text-sm font-medium ${mode === 'generate' ? 'text-gray-700' : 'text-gray-200'}`}>Private Key:</label>
                <button
                  className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
                  onClick={() => copyToClipboard(privateKey)}
                >
                  <Image src="/copy.svg" alt="Copy" width={16} height={16} />
                </button>
              </div>
  
              <div className="flex items-center gap-2 mb-4">
                <textarea
                  className={`border border-gray-300 rounded-lg p-3 w-full ${mode === 'generate' ? 'bg-gray-100 text-black' : 'bg-gray-700 text-white'}`}
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
              <label className={`block text-sm font-medium ${mode === 'predict' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>SOL Address:</label>
              <textarea
                className={`border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 ${mode === 'predict' ? 'bg-gray-700 text-white' : 'text-black'}`}
                value={solAddresspredict}
                onChange={handleAddressChange}
                placeholder="Enter SOL Address"
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
                    setIsPredicting(true); // Iniciar la predicción
                    guessWallet(); // Comenzar el proceso de adivinanza
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
            onClick={() => copyToClipboard("9ig1TL5j47Qrry6W1wQ287X1EP8u49rnSCgvdSTLPfH4")}
          >
            <span className={`text-xs ${mode === 'predict' ? 'text-gray-200' : 'text-gray-700'}`}>9ig1TL5j47Qrry6W1wQ287X1EP8u49rnSCgvdSTLPfH4</span>
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

export default SOLPage;