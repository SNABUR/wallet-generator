"use client";
import { useState,useRef  } from 'react';
import { generatePrivateKey, generateBTCAddress } from '../utils/bitcoinUtils'; // Importa las funciones desde utils
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';
import { Switch } from '@headlessui/react';
import WalletBackground from './btc/components/background';
import { payments } from 'bitcoinjs-lib';

const BTCPage = () => {
  const [inputText, setInputText] = useState('Satoshi Nakamoto');
  const [BTCAddress, setBTCAddress] = useState('17ZYZASydeA1xyfNrcYcLyqghmK3eGJpHq');
  const [BTCAddresspredict, setBTCAddresspredict] = useState('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
  const [privateKey, setPrivateKey] = useState('a0dc65ffca799873cbea0ac274015b9526505daaaed385155425f7337704883e');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedtext, setSeedtext] = useState('');
  const [mode, setMode] = useState<'predict' | 'generate'>('generate');
  const [addressType, setAddressType] = useState('P2PKH'); // Estado para el tipo de dirección
  const isPredictingRef = useRef(isPredicting); // Coloca el hook dentro del componente
  const [privatekeyGuess, setPrivatekeyGuess] = useState('');
  const handleWalletClick = (address: string) => {
    setBTCAddresspredict(address);
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
      while (!found && isPredictingRef.current) {  
        const randomText = Array.from(
          { length: getRandomLength(1, 1370) },
          randomChar
        ).join('');
  
        // Generar dirección basada en randomText
        const solAddressGuessed = generateWalletGuess(randomText);
        setSeedtext(randomText); // Actualizar el texto generado
  
        // Comparar con la predicción
        if (solAddressGuessed === BTCAddresspredict) {
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


  const generateWallet = (text: string) => {
    const privateKeyHex = generatePrivateKey(text); // Genera la clave privada

    let btcAddress = '';

    switch (addressType) {
      case 'P2PKH':
        btcAddress = generateBTCAddress(privateKeyHex, addressType);
        break;
      case 'BECH32':
        btcAddress = generateBTCAddress(privateKeyHex, addressType);
        break;
      default:
        throw new Error('Tipo de dirección no soportado');
    }

  
    setPrivateKey(privateKeyHex);
    setBTCAddress(btcAddress);   
  };


  // Genera clave y dirección BTC cada vez que cambia el texto
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    if (text) {
      generateAddress(text); // Llama a la función para generar la dirección
    } else {
      setBTCAddress('');
      setPrivateKey('');
    }
  };

  const handleStopPrediction = () => {
    // Detener la predicción
    setIsPredicting(false); // Establecer isPredicting a false para detener el ciclo
  };

  // Función para generar dirección y clave BTC
  const generateAddress = (text: string) => {
    const privateKeyHex = generatePrivateKey(text); // Genera la clave privada
    setPrivateKey(privateKeyHex);

    let btcAddress = '';

    switch (addressType) {
      case 'P2PKH':
        btcAddress = generateBTCAddress(privateKeyHex, addressType);
        break;
      case 'BECH32':
        btcAddress = generateBTCAddress(privateKeyHex, addressType);
        break;
      default:
        throw new Error('Tipo de dirección no soportado');
    }

    setBTCAddress(btcAddress);
  };

  const generateWalletGuess = (text: string) => {
    // Hash del texto usando keccak256
    const privateKeyHex = generatePrivateKey(text); // Genera la clave privada
  
    let btcAddress = '';

    switch (addressType) {
      case 'P2PKH':
        btcAddress = generateBTCAddress(privateKeyHex, addressType);
        break;
      case 'BECH32':
        btcAddress = generateBTCAddress(privateKeyHex, addressType);
        break;
      default:
        throw new Error('Tipo de dirección no soportado');
    }
  
    // Actualizar el estado con la clave privada
    setPrivatekeyGuess(privateKeyHex);
  
    return btcAddress; 
  };


  const handleAddressChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const address = event.target.value;
    setBTCAddresspredict(address);
    setError(null);
  
    if (address.trim() === "") {
      setError("");
      return;
    }
  
    try {
      // Intentamos verificar si la dirección es válida según Bitcoin (P2PKH)
      payments.p2pkh({ address });
  
      // Si es una dirección P2PKH válida, la aceptamos
      setBTCAddresspredict(address);
    } catch (error) {
      try {
        // Intentamos verificar si la dirección es válida en BECH32 (P2WPKH)
        payments.p2wpkh({ address });
  
        // Si es una dirección BECH32 válida, la aceptamos
        setBTCAddresspredict(address);
      } catch (error) {
        // Si no es válida ni como P2PKH ni BECH32
        setError("This is not a valid BTC address.");
      }
    }
  };
  

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
  };

  const handleAddressTypeChange = (type: string) => {
    setAddressType(type);
    generateAddress(inputText); // Generar la dirección cada vez que cambia el tipo
  };


  return (
  <div className={`min-h-screen flex items-center font-hacker justify-center ${mode === 'predict' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
    <div className="absolute w-full h-full z-0">
      <WalletBackground onWalletClick={handleWalletClick} />
  </div>
      <div className={`flex flex-col shadow-lg rounded-lg p-7 w-full max-w-md items-center relative ${mode === 'predict' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex flex-col items-center mb-6">
          <Image className='mb-3' src="/Bitcoin.svg" alt="Bitcoin Logo" width={64} height={64} />
          <h1 className="text-sm font-semibold text-center mb-3 leading-relaxed md:text-base">
          <span className={`font-bold ${mode === 'predict' ? 'text-blue-400' : 'text-blue-700'}`}>wallets</span>
          <span className="mx-1">from text</span>
        </h1>
          {/*<h1 className="text-3xl font-bold text-gray-800 text-center">Free Bitcoin</h1>*/}
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

        <div className="w-full mb-4">
          <div className='flex flex-fil text-center justify-between'>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insert Text:</label>
            <div className="flex items-center mb-4">
            <button
              className={`py-1 px-3 text-xs rounded-l-lg transition duration-200 ${addressType === 'P2PKH' ? 'bg-orange-400 text-white' : 'bg-orange-100 text-black'}`}
              onClick={() => handleAddressTypeChange('P2PKH')}
            >
              A
            </button>
            <button
              className={`py-1 px-3  text-xs rounded-r-lg transition duration-200 ${addressType === 'BECH32' ? 'bg-orange-400 text-white' : 'bg-orange-100 text-black'}`}
              onClick={() => handleAddressTypeChange('BECH32')}
            >
              B
            </button>
          </div>
        </div>
        </div>

        {mode === 'generate' ? (
        <>

        <div className="w-full mb-4">
        <label className={`block text-sm font-medium ${mode === 'generate' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>
          Insert Text:
        </label>
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 text-black text-sm"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Satoshi Nakamoto"
          />
        </div>

        <button
          className="bg-black text-white py-2 px-4 rounded-lg mt-1 hover:bg-gray-700 transition w-64 active:scale-95 duration-200"
          onClick={() => predictWallet(3710)} // Llama a la función para generar la dirección
        >
          {isPredicting ? 'GENERATING...' : 'GENERATE WALLET'}
          </button>

        <div className="w-full mt-6">
          <div className="flex items-center justify-start mb-2">
            <label className="text-sm font-medium text-gray-700">BTC Address:</label>
            <button
              className="bg-gray-200 py-1 px-2 rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              onClick={() => copyToClipboard(BTCAddress)}
            >
              <Image src="./copy.svg" alt="Copy" width={16} height={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 text-black"
              readOnly
              value={BTCAddress}
            />
                        <a
              className="rounded-lg hover:bg-gray-300 transition duration-200 active:scale-95"
              href={`https://www.blockchain.com/explorer/addresses/btc/${BTCAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="./blockchain.svg" alt="Blockchain" width={26} height={26} />
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
              <Image src="./copy.svg" alt="Copy" width={16} height={16} />
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
          <label className={`block text-sm font-medium ${mode === 'predict' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>BTC Address:</label>
          <textarea
            className={`border border-gray-300 rounded-lg p-3 w-full focus:ring-2 h-24 focus:ring-blue-500 ${mode === 'predict' ? 'bg-gray-700 text-white' : 'text-black'}`}
            value={BTCAddresspredict}
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
              <Image src="./copy.svg" alt="Copy" width={16} height={16} />
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
              <Image src="./copy.svg" alt="Copy" width={16} height={16} />
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
            Airdrop:  
            <a 
              href="https://ggeese.fun" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 font-bold hover:underline"
            >
              ggeese.fun
            </a>
          </p>*/}
          <div
            className="flex items-center space-x-1 rounded-lg p-1 cursor-pointer transition duration-200"
            onClick={() => copyToClipboard("bc1q2qdqw82tqmt6ctt6ydr7lxg3mrg4ps4l6a6m9m")}
          >
            <span className="text-gray-700 text-xs transition duration-200 active:scale-95">bc1q2qdqw82tqmt6ctt6ydr7lxg3mrg4ps4l6a6m9m</span>
            <button
              className="p-2 rounded-lg transition duration-200 active:scale-90 focus:outline-none"
              aria-label="Copy to clipboard"
            >
              <Image src="./copy.svg" alt="Copy" width={12} height={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BTCPage;
