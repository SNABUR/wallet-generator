

// pages/index.js
"use client";
import { useState, useRef } from 'react';
import { keccak256, Message } from 'js-sha3';
import { ethers } from 'ethers';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import WalletBackground from './components/background'; // Asegúrate de importar el componente correctamente

const ETHPage = () => {
  const [inputText, setInputText] = useState('vitalik');
  const [ETHAddress, setETHAddress] = useState('0x89d768F75bd1Ae465876046d5e5466D0b1FdbD03');
  const [ETHAddresspredict, setETHAddresspredict] = useState('0x89d768F75bd1Ae465876046d5e5466D0b1FdbD03');
  const [privateKey, setPrivateKey] = useState('0xaf2caa1c2ca1d027f1ac823b529d0a67cd144264b2789fa2ea4d63a67c7103cc');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mode, setMode] = useState<'predict' | 'generate'>('predict');
  const [error, setError] = useState<string | null>(null);
  const [seedtext, setSeedtext] = useState('');
  const [privatekeyGuess, setPrivatekeyGuess] = useState('');
  const isPredictingRef = useRef(isPredicting); // Coloca el hook dentro del componente

  const handleWalletClick = (address: string) => {
    setETHAddresspredict(address);
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
        if (solAddressGuessed === ETHAddresspredict) {
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
    // Hash del texto usando keccak256
    const hashedOutput = ethers.keccak256(ethers.toUtf8Bytes(text));
  
    // Usar el hash como clave privada
    const privateKey = hashedOutput.slice(2); // Eliminar el prefijo "0x"
  
    // Crear una wallet a partir de la clave privada
    const wallet = new ethers.Wallet(privateKey);
  
    // Actualizar el estado con la clave privada
    setPrivatekeyGuess(wallet.privateKey); // Clave privada (formato hexadecimal)
  
    // Retornar la dirección pública
    return wallet.address; // Dirección pública (formato Ethereum: 0x...)
  };
  

  const generateWallet = (text: string) => {
    const hashedOutput = ethers.keccak256(ethers.toUtf8Bytes(text));
  
    const privateKey = hashedOutput.slice(2); // Eliminar el prefijo "0x"
  
    // Crear una wallet a partir de la clave privada
    const wallet = new ethers.Wallet(privateKey);
  
    setPrivateKey(wallet.privateKey); // Clave privada (formato hexadecimal)
    setETHAddress(wallet.address);    // Dirección pública
  };
  
  

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    // Solo generar la wallet si el texto no está vacío
    if (text) {
      generateWallet(text);  // Generar la wallet a partir del texto ingresado
    } else {
      setETHAddress('');  // Limpiar la dirección si no hay texto
      setPrivateKey('');   // Limpiar la clave privada si no hay texto
    }
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const address = event.target.value;
    setETHAddresspredict(address);
    setError(null); // Clear previous error
  
    if (address.trim() === "") {
      setError(""); // No error, pero vacío
      return;
    }
  
    // Verificar si es una dirección válida de Ethereum
    if (ethers.isAddress(address)) {
      setETHAddresspredict(address);
    } else {
      setError("This is not a valid ETH Address.");
    }
  };

  return (
<div className={`min-h-screen flex items-center font-hacker justify-center ${mode === 'predict' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
<div className="absolute w-full h-full z-0">
      <WalletBackground onWalletClick={handleWalletClick} />
  </div>
      <div className="flex flex-col bg-white shadow-lg rounded-lg p-8 w-full max-w-md items-center relative">
        <div className="flex flex-col items-center mb-6">
          <Image className='mb-3' src="/ethereum.svg" alt="Ethereum Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-black text-center mb-6 leading-relaxed md:text-base">
            <span className="text-blue-700 font-bold">Hashai</span>
            <span className="mx-1">can give you</span>
            <span className="text-blue-700 font-bold">wallets</span>
            <span className="mx-1">from text</span>
          </h1>
          {/*<h1 className="text-3xl font-bold text-gray-800 text-center">Free Ethereum</h1>*/}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Insert Text:</label>
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 text-black text-sm"
            value={inputText}
            onChange={handleInputChange}
            placeholder="vitalik"
          />
        </div>
  
        <button
          className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
          onClick={() => predictWallet(3710)}
          >
          GENERATE WALLET
        </button>
  
        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">ETH Address:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(ETHAddress)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>
  
          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={ETHAddress}
            />

            <a
              className="p-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              href={`https://etherscan.io/address/${ETHAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/etherscan_logo.svg" alt="Etherscan" width={26} height={26} />
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
          <label className={`block text-sm font-medium ${mode === 'predict' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>ETH Address:</label>
          <textarea
            className={`border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 ${mode === 'predict' ? 'bg-gray-700 text-white' : 'text-black'}`}
            value={ETHAddresspredict}
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
          {/*<p className="text-sm text-gray-600 mb-2">
          made with ❤️ by GG

          </p>
          <p className="text-2sm text-gray-600 font-bold mb-2">
            <a 
              href="https://goosey.fun" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 font-bold hover:underline"
            >
              goosey.fun
            </a>
          </p>*/}
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

export default ETHPage;
