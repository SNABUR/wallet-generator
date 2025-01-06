"use client";
import { useState } from 'react';
import { keccak256 } from 'js-sha3';
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58"; // Asegúrate de instalar esta librería
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SOLPage = () => {
  const [inputText, setInputText] = useState('Anatoly');
  const [solAddress, setSolAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const simulateTyping = (duration: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?`~';
    const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));
  
    let timeElapsed = 0;
    const interval = 100; // Actualizar cada 100ms
  
    const timer = setInterval(() => {
      // Función para generar un número aleatorio dentro de un rango
      const getRandomLength = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
      const randomText = Array.from({ length: getRandomLength(137, 1370) }, randomChar).join('');  // Generar texto aleatorio
      
      // Simular valores aleatorios durante el efecto de escritura
      setInputText(randomText);  // Actualiza el texto simulado
      setSolAddress(Array.from({ length: 32 }, randomChar).join(''));  // Dirección pública aleatoria
      setPrivateKey(Array.from({ length: 64 }, randomChar).join(''));  // Clave privada aleatoria
  
      // Generar la wallet real mientras se simula el tipeo
      generateWallet(randomText);  // Usa la misma lógica para generar wallet
  
      timeElapsed += interval;
  
      if (timeElapsed >= duration) {
        clearInterval(timer);
        // Después de la simulación, puedes hacer algo más si es necesario
      }
    }, interval);
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center font-hacker justify-center">
      <div className="flex flex-col bg-white shadow-lg rounded-lg p-8 w-full max-w-md items-center relative">
        <div className="flex flex-col items-center mb-6">
          <Image className='mb-3' src="/solana.svg" alt="Solana Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-black text-center mb-6 leading-relaxed md:text-base">
            <span className="text-blue-700 font-bold">Hashai</span>
            <span className="mx-1">can give you</span>
            <span className="text-blue-700 font-bold">wallets</span>
            <span className="mx-1">from text</span>
          </h1>
        </div>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Insert Text:</label>
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 text-black text-sm"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Anatoly"
          />
        </div>

        <button
          className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
          onClick={() => simulateTyping(3000)} // Simula durante 3 segundos
          >
          GENERATE WALLET
        </button>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">SOL Address:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(solAddress)}
            >
              <Image src="/copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
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

        <div className="flex flex-col items-center mt-3 text-center">
          <div
            className="flex items-center space-x-1 rounded-lg p-1 cursor-pointer transition duration-200"
            onClick={() => copyToClipboard("82Ha9jcBWQZtBcZFBCKFbeZY1Fwy3ADfYpvv3NC1qr23")}
          >
            <span className="text-gray-700 text-xs transition duration-200 active:scale-95">82Ha9jcBWQZtBcZFBCKFbeZY1Fwy3ADfYpvv3NC1qr23</span>
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