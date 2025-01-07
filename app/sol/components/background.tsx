import React, { useEffect, useState } from "react";

// Cargar las wallets desde el archivo JSON
import walletsData from "../../../public/wallets.json";

const WalletBackground = () => {
  interface Wallet {
    address: string;
    balance: number;
  }

  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    setWallets(walletsData);
  }, []);

  return (
    <div className="walletsBackground">
      {wallets.map((wallet, index) => {
        // Generar posiciones y tiempos aleatorios
        const randomX = Math.random() * 100; // Porcentaje de la pantalla (eje X)
        const randomY = Math.random() * 100; // Porcentaje de la pantalla (eje Y)
        const randomDelay = Math.random() * 5; // Retraso en segundos (0-5s)
        const randomDuration = 5 + Math.random() * 3; // Duración de animación (2-5s)

        return (
          <div
            key={index}
            className="wallet"
            style={{
              top: `${randomY}%`,
              left: `${randomX}%`,
              animationDelay: `${randomDelay}s`,
              animationDuration: `${randomDuration}s`,
            }}
          >
            {wallet.address}: {wallet.balance.toLocaleString()}{" SOL"}
          </div>
        );
      })}
    </div>
  );
};

export default WalletBackground;
